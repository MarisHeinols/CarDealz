import { onCall, onRequest, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { logger } from "firebase-functions";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";

setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();

// --- GLOBAL BILLING TOGGLE ---
// Set to true to require active Stripe subscriptions for all business features.
export const BILLING_ENABLED = false;

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const smtpHost = defineSecret("SMTP_HOST");
const smtpUser = defineSecret("SMTP_USER");
const smtpPass = defineSecret("SMTP_PASS");
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

const smtpFrom = defineSecret("SMTP_FROM");
const adminEmail = defineSecret("ADMIN_EMAIL");

// NOTE: Email notifications (SMTP) are temporarily disabled until SMTP secrets are configured.

type DealerVerificationStatus = "pending" | "approved" | "rejected";

const PUBLIC_USERS_COLLECTION = "publicUsers";
const PRIVATE_USERS_COLLECTION = "privateUsers";
const LEGACY_USERS_COLLECTION = "users";

export const verifyDealerAccount = onCall(
  { 
    region: "europe-west1", 
    cors: ["http://localhost:5173", "https://baltic-auto.net"], 
    invoker: "public" 
  },
  async (request: CallableRequest) => {
    if (!request.data) throw new HttpsError("invalid-argument", "Request body is empty");
    const callerUid = request.auth?.uid;
    if (!callerUid) throw new HttpsError("unauthenticated", "Login required");

    const isAdmin = (request.auth?.token as any)?.admin === true;
    if (!isAdmin) throw new HttpsError("permission-denied", "Admin access required");

    const dealerUid = String((request.data as any)?.dealerUid || "").trim();
    const status = String((request.data as any)?.status || "").trim() as DealerVerificationStatus;
    const reason = String((request.data as any)?.reason || "").trim();

    if (!dealerUid) throw new HttpsError("invalid-argument", "Missing dealerUid");
    if (status !== "approved" && status !== "rejected" && status !== "pending") {
      throw new HttpsError("invalid-argument", "Invalid status");
    }

    const db = admin.firestore();
    const privRef = db.doc(`${PRIVATE_USERS_COLLECTION}/${dealerUid}`);
    const privSnap = await privRef.get();
    if (!privSnap.exists) throw new HttpsError("not-found", "Dealer user not found");

    const data = privSnap.data() as any;
    if (String(data?.role || "") !== "business") {
      throw new HttpsError("failed-precondition", "Target user is not a business account");
    }

    const dealerVerified = status === "approved";
    const payload = {
      dealerVerificationStatus: status,
      dealerVerified,
      dealerVerificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await Promise.all([
      db.doc(`${PUBLIC_USERS_COLLECTION}/${dealerUid}`).set(payload, { merge: true }),
      db.doc(`${PRIVATE_USERS_COLLECTION}/${dealerUid}`).set(payload, { merge: true }),
      // keep legacy doc updated only if it exists
      db.doc(`${LEGACY_USERS_COLLECTION}/${dealerUid}`).set(payload, { merge: true }),
    ]);

    // Keep reason private
    if (reason) {
      await db.doc(`privateUserMetadata/${dealerUid}`).set({
        dealerVerificationReason: reason,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return { ok: true };
  }
);

export const deleteUserByAdmin = onCall(
  { region: "europe-west1" },
  async (request: CallableRequest) => {
    if (!request.data) throw new HttpsError("invalid-argument", "Request body is empty");

    const callerUid = request.auth?.uid;
    if (!callerUid) throw new HttpsError("unauthenticated", "Login required");

    const isAdmin = (request.auth?.token as any)?.admin === true;
    if (!isAdmin) throw new HttpsError("permission-denied", "Admin access required");

    const targetUid = String((request.data as any)?.uid || "").trim();
    if (!targetUid) throw new HttpsError("invalid-argument", "Missing uid");

    logger.info(`START: Admin ${callerUid} deleting user ${targetUid}`);

    const db = admin.firestore();
    const auth = admin.auth();
    const batch = db.batch();

    try {
      // 1. STRIPE CANCELLATION
      const privateSnap = await db.doc(`privateUserMetadata/${targetUid}`).get();
      const customerId = privateSnap.data()?.stripeCustomerId;
      if (customerId) {
        try {
          const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2024-06-20" as any });
          const subscriptions = await stripe.subscriptions.list({ customer: customerId });
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
          logger.info(`Stripe subscriptions canceled for ${targetUid}`);
        } catch (sErr) {
          logger.error(`Stripe cleanup failed for ${targetUid}:`, sErr);
        }
      }

      // 2. Listings
      const listingsSnap = await db.collection("listings").where("sellerId", "==", targetUid).get();
      listingsSnap.forEach((d) => batch.delete(d.ref));

      // 3. Leads
      const leadsSnap = await db.collection("leads").where("dealerId", "==", targetUid).get();
      leadsSnap.forEach((d) => batch.delete(d.ref));

      // 4. Reviews
      const reviewsSnap = await db.collection("storeReviews").where("storeUid", "==", targetUid).get();
      reviewsSnap.forEach((d) => batch.delete(d.ref));

      // 5. Business Names
      const namesSnap = await db.collection("businessNames").where("uid", "==", targetUid).get();
      namesSnap.forEach((d) => batch.delete(d.ref));

      // 6. Store settings, User doc, and private metadata
      batch.delete(db.doc(`storeSettings/${targetUid}`));
      batch.delete(db.doc(`${PUBLIC_USERS_COLLECTION}/${targetUid}`));
      batch.delete(db.doc(`${PRIVATE_USERS_COLLECTION}/${targetUid}`));
      batch.delete(db.doc(`${LEGACY_USERS_COLLECTION}/${targetUid}`));
      batch.delete(db.doc(`privateUserMetadata/${targetUid}`));

      await batch.commit();

      // 7. Auth
      try {
        await auth.deleteUser(targetUid);
      } catch (authErr: any) {
        if (authErr.code !== "auth/user-not-found") {
          throw authErr;
        }
      }
      
      logger.info(`SUCCESS: Admin ${callerUid} deleted user ${targetUid}`);
      return { ok: true };
    } catch (err: any) {
      logger.error(`FAIL: Admin deletion failed for ${targetUid}:`, err);
      throw new HttpsError("unknown", `Deletion failed: ${err.message || String(err)}`);
    }
  }
);

export const deleteMyAccount = onCall(
  { region: "europe-west1", secrets: [stripeSecretKey] },
  async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Login required");

    logger.info(`START: User ${uid} deleting their own account`);

    const db = admin.firestore();
    const auth = admin.auth();
    const batch = db.batch();

    try {
      // 1. STRIPE CANCELLATION
      const privateSnap = await db.doc(`privateUserMetadata/${uid}`).get();
      const customerId = privateSnap.data()?.stripeCustomerId;
      if (customerId) {
        try {
          const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2024-06-20" as any });
          const subscriptions = await stripe.subscriptions.list({ customer: customerId });
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
          logger.info(`Stripe subscriptions canceled for ${uid}`);
        } catch (sErr) {
          logger.error(`Stripe cleanup failed for ${uid}:`, sErr);
        }
      }

      // 2. Listings
      const listingsSnap = await db.collection("listings").where("sellerId", "==", uid).get();
      listingsSnap.forEach((d) => batch.delete(d.ref));

      // 3. Leads (Bidirectional)
      const leadsInSnap = await db.collection("leads").where("dealerId", "==", uid).get();
      leadsInSnap.forEach((d) => batch.delete(d.ref));
      const leadsOutSnap = await db.collection("leads").where("buyerUid", "==", uid).get();
      leadsOutSnap.forEach((d) => batch.delete(d.ref));

      // 4. Reviews (Bidirectional)
      const reviewsForSnap = await db.collection("storeReviews").where("storeUid", "==", uid).get();
      reviewsForSnap.forEach((d) => batch.delete(d.ref));
      const reviewsBySnap = await db.collection("storeReviews").where("reviewerUid", "==", uid).get();
      reviewsBySnap.forEach((d) => batch.delete(d.ref));

      // 5. Business Names
      const namesSnap = await db.collection("businessNames").where("uid", "==", uid).get();
      namesSnap.forEach((d) => batch.delete(d.ref));

      // 6. Docs
      batch.delete(db.doc(`storeSettings/${uid}`));
      batch.delete(db.doc(`${PUBLIC_USERS_COLLECTION}/${uid}`));
      batch.delete(db.doc(`${PRIVATE_USERS_COLLECTION}/${uid}`));
      batch.delete(db.doc(`${LEGACY_USERS_COLLECTION}/${uid}`));
      batch.delete(db.doc(`privateUserMetadata/${uid}`));

      await batch.commit();

      // 7. Auth Delete
      await auth.deleteUser(uid);
      
      logger.info(`SUCCESS: User ${uid} deleted their own account`);
      return { ok: true };
    } catch (err: any) {
      logger.error(`FAIL: User deletion failed for ${uid}:`, err);
      throw new HttpsError("unknown", `Deletion failed: ${err.message || String(err)}`);
    }
  }
);

export const onBusinessRegistered = onDocumentCreated(
  {
    document: "privateUsers/{uid}",
    secrets: [smtpHost, smtpUser, smtpPass, smtpFrom, adminEmail],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    if (data.role !== "business") return;

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost.value(),
        port: 465,
        secure: true,
        auth: {
          user: smtpUser.value(),
          pass: smtpPass.value(),
        },
      });

      const subject = `🚀 New Business Registration: ${data.storeName || data.businessName || "Unknown"}`;
      const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #6a1b9a;">New Business requires approval</h2>
          <p><strong>Name:</strong> ${data.storeName || data.businessName || "N/A"}</p>
          <p><strong>Email:</strong> ${data.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${data.businessPhone || data.phone || "N/A"}</p>
          <p>Please log in to the admin dashboard to verify and approve or decline this registration.</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"BalticAuto Admin" <${smtpFrom.value()}>`,
        to: adminEmail.value(),
        subject,
        html,
      });
      logger.info(`Admin notified of new business ${data.uid}`);
    } catch (err) {
      logger.error("Error sending admin notification:", err);
    }
  }
);

export const onDealerVerificationUpdated = onDocumentUpdated(
  {
    document: "privateUsers/{uid}",
    secrets: [smtpHost, smtpUser, smtpPass, smtpFrom],
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;
    if (after.role !== "business") return;

    const oldStatus = before.dealerVerificationStatus;
    const newStatus = after.dealerVerificationStatus;

    if (oldStatus !== newStatus && (newStatus === "approved" || newStatus === "rejected")) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost.value(),
          port: 465,
          secure: true,
          auth: {
            user: smtpUser.value(),
            pass: smtpPass.value(),
          },
        });

        const isApproved = newStatus === "approved";
        const subject = isApproved ? "✅ Your Business Account is Approved!" : "❌ Your Business Account was Declined";
        const reasonStr = after.dealerVerificationReason ? `<p><strong>Reason:</strong> ${after.dealerVerificationReason}</p>` : "";

        const html = `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: ${isApproved ? "#4caf50" : "#d32f2f"};">Business Account Status Update</h2>
            <p>Hello ${after.storeName || after.businessName || after.name || "Dealer"},</p>
            <p>Your business registration for <strong>${after.storeName || after.businessName || "your dealership"}</strong> has been <strong>${isApproved ? "Approved" : "Declined"}</strong>.</p>
            ${isApproved ? `<p>You can now log in and start publishing your car listings!</p>` : reasonStr}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #999; text-align: center;">BalticAuto Team</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"BalticAuto" <${smtpFrom.value()}>`,
          to: after.email,
          subject,
          html,
        });

        logger.info(`Dealer ${after.uid} notified of verification status: ${newStatus}`);
      } catch (err) {
        logger.error("Error sending dealer verification email:", err);
      }
    }
  }
);

function getGemini() {
  return new GoogleGenAI({ apiKey: geminiApiKey.value() });
}

function normalizeIp(raw: any): string {
  const xff = String(raw?.headers?.["x-forwarded-for"] || "");
  const first = xff.split(",")[0]?.trim();
  const ip = first || String(raw?.ip || "").trim();
  return ip || "unknown";
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function clampStr(v: any, max: number): string {
  const s = String(v || "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

function normalizeForProfanityScan(v: string): string {
  // Lowercase + normalize diacritics + make separators uniform.
  // Keep Cyrillic/Latin letters and digits; everything else becomes spaces.
  const lowered = (v || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ё/g, "е");
  return lowered.replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function containsProfanity(v: string): boolean {
  const text = normalizeForProfanityScan(v);
  if (!text) return false;

  // High-signal list covering English, Russian and Latvian.
  // Tuned to minimise false positives while catching clear abuse.
  const patterns: RegExp[] = [
    // ── English ──────────────────────────────────────────────────────────────
    /\b(fuck|fucking|fucked|fucker|shit|shitty|bitch|bitching|asshole|bastard|cunt|dick|dickhead|cock|cocksucker|motherfucker|whore|slut|nigger|faggot|retard)\b/i,
    // ── Russian (Cyrillic – common obscene roots & derivatives) ─────────────
    /\b(бля|блять|бляд|блядь|блядский|сука|суки|сучка|хуй|хуйня|хуев|хуило|хуита|пизд|пизда|пиздец|пиздит|ёб|ёба|еба|ебать|ебало|ебан|нахуй|захуй|похуй|уёбок|уебок|манда|залупа|мудак|мудила|мразь|ублюдок|блядина|шлюха|проститутка|педик|педераст|гандон|долбоёб|долбоеб)\b/i,
    // ── Latvian ──────────────────────────────────────────────────────────────
    /\b(pizd|pizda|pizdet|pizdulis|dirsa|dirsā|dirst|kuce|sukas|mauka|maukas|pakaļa|muds|mudit|sūds|fuck|jebi|jebies|jebties)\b/i,
  ];

  return patterns.some((p) => p.test(text));
}

export const createLeadSecure = onCall(
  {
    region: "europe-west1",
    cors: ["http://localhost:5173", "https://baltic-auto.net"],
    invoker: "public",
  },
  async (request: CallableRequest) => {
    if (!request.data) throw new HttpsError("invalid-argument", "Request body is empty");

    const db = admin.firestore();
    const ip = normalizeIp((request as any).rawRequest);

    const listingId = clampStr((request.data as any).listingId, 120);
    const dealerId = clampStr((request.data as any).dealerId, 120);
    const buyerName = clampStr((request.data as any).buyerName, 120);
    const message = clampStr((request.data as any).message, 2000);
    const preferredContactMethod = clampStr((request.data as any).preferredContactMethod, 20);

    const buyerUidRaw = (request.data as any).buyerUid;
    const buyerUid = buyerUidRaw ? clampStr(buyerUidRaw, 128) : null;

    const buyerEmailRaw = (request.data as any).buyerEmail;
    const buyerEmail = buyerEmailRaw ? clampStr(buyerEmailRaw, 254).toLowerCase() : null;

    const buyerPhoneRaw = (request.data as any).buyerPhone;
    const buyerPhone = buyerPhoneRaw ? clampStr(buyerPhoneRaw, 32) : null;

    // If authenticated, enforce UID match.
    if (request.auth?.uid && buyerUid && request.auth.uid !== buyerUid) {
      throw new HttpsError("permission-denied", "buyerUid mismatch");
    }

    if (!listingId || !dealerId) {
      throw new HttpsError("invalid-argument", "Missing listingId/dealerId");
    }
    if (!buyerName || buyerName.length < 2) {
      throw new HttpsError("invalid-argument", "Name is required");
    }
    if (!message || message.length < 5) {
      throw new HttpsError("invalid-argument", "Message is too short");
    }

    if (containsProfanity(buyerName) || containsProfanity(message)) {
      throw new HttpsError(
        "invalid-argument",
        "Message contains prohibited language.",
      );
    }
    if (preferredContactMethod !== "email" && preferredContactMethod !== "phone") {
      throw new HttpsError("invalid-argument", "Invalid preferredContactMethod");
    }
    if (preferredContactMethod === "email") {
      if (!buyerEmail || !isValidEmail(buyerEmail)) {
        throw new HttpsError("invalid-argument", "Valid email required");
      }
    }
    if (preferredContactMethod === "phone") {
      if (!buyerPhone || buyerPhone.replace(/[^\d+]/g, "").length < 8) {
        throw new HttpsError("invalid-argument", "Valid phone required");
      }
    }

    // Verify listing belongs to dealerId.
    const listingRef = db.doc(`listings/${listingId}`);
    const listingSnap = await listingRef.get();
    if (!listingSnap.exists) {
      throw new HttpsError("not-found", "Listing not found");
    }
    const listing = listingSnap.data() as any;
    if (String(listing?.sellerId || "") !== dealerId) {
      throw new HttpsError("failed-precondition", "Invalid dealer for listing");
    }

    // Rate limit: max 3 leads per 10 minutes per IP per dealer.
    const windowMs = 10 * 60 * 1000;
    const maxCount = 3;
    const now = Date.now();
    const rateKey = `leads_${dealerId}_${ip}`;
    const rateRef = db.doc(`rateLimits/${rateKey}`);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(rateRef);
      const data = snap.exists ? (snap.data() as any) : null;
      const resetAt = typeof data?.resetAt === "number" ? data.resetAt : 0;
      const count = typeof data?.count === "number" ? data.count : 0;

      if (!resetAt || now > resetAt) {
        tx.set(rateRef, { count: 1, resetAt: now + windowMs, updatedAt: now }, { merge: true });
        return;
      }

      if (count >= maxCount) {
        throw new HttpsError("resource-exhausted", "Too many requests. Please try again later.");
      }
      tx.set(rateRef, { count: count + 1, resetAt, updatedAt: now }, { merge: true });
    });

    const createdAtIso = new Date().toISOString();
    const leadRef = db.collection("leads").doc();
    await leadRef.set({
      listingId,
      dealerId,
      buyerUid: buyerUid || null,
      buyerName,
      buyerEmail: buyerEmail || null,
      buyerPhone: buyerPhone || null,
      preferredContactMethod,
      message,
      status: "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAtIso,
      sourceIp: ip,
    });

    // best-effort increment
    try {
      await listingRef.set(
        { leadCount: admin.firestore.FieldValue.increment(1) },
        { merge: true },
      );
    } catch {
      // ignore
    }

    return { ok: true, leadId: leadRef.id, createdAtIso };
  },
);

export const geminiAnalyzeCarImage = onCall(
  {
    cors: true,
    invoker: "public",
    secrets: [geminiApiKey],
  },
  async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Login required");

    const imageBase64 = String((request.data as any)?.imageBase64 || "");
    const mimeType = String((request.data as any)?.mimeType || "image/jpeg");
    if (!imageBase64) throw new HttpsError("invalid-argument", "Missing imageBase64");

    const ai = getGemini();
    const prompt =
      'Analyze this car image and return a flat JSON object with the vehicle\'s details: make, model, year, color. Example: {"make":"Toyota","model":"Camry","year":2018,"color":"Silver"}.\n' +
      'Very important: color MUST be one of ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Brown", "Beige", "Gold", "Orange", "Yellow", "Purple", "Other"].\n' +
      "Return ONLY valid JSON.";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        prompt,
        {
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new HttpsError("internal", "Empty AI response");

    let parsed: any;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      throw new HttpsError("internal", "Invalid AI JSON response");
    }

    const validColors = [
      "Black",
      "White",
      "Silver",
      "Gray",
      "Red",
      "Blue",
      "Green",
      "Brown",
      "Beige",
      "Gold",
      "Orange",
      "Yellow",
      "Purple",
      "Other",
    ];
    if (parsed?.color && !validColors.includes(parsed.color)) parsed.color = "Other";

    return parsed;
  }
);

export const geminiEstimateMarketValue = onCall(
  {
    cors: true,
    invoker: "public",
    secrets: [geminiApiKey],
  },
  async (request: CallableRequest) => {
    const listing = (request.data as any)?.listing || {};
    const make = String(listing?.make || "");
    const model = String(listing?.model || "");
    if (!make || !model) throw new HttpsError("invalid-argument", "Make and model are required");

    const year = listing?.year;
    const mileage = listing?.mileage;
    const condition = listing?.condition;
    const fuelType = listing?.fuelType;
    const transmission = listing?.transmission;
    const drivetrain = listing?.drivetrain;
    const horsepower = listing?.horsepower;
    const displacement = listing?.displacement;
    const features = listing?.features;
    const location = listing?.location;
    const price = listing?.price;

    const ai = getGemini();

    const carYear = year || new Date().getFullYear();
    const carMileage = mileage || 0;

    const prompt = `Estimate the market value for this vehicle in EUR (€):
Vehicle: ${carYear} ${make} ${model}
Mileage: ${carMileage} km
Condition: ${condition || "Used"}
Engine: ${displacement ? displacement + " cc" : ""} ${horsepower ? horsepower + " HP" : ""}
Powertrain: ${fuelType || ""} ${transmission || ""} ${drivetrain || ""}
Location: ${location || "Unknown"}
Features/Options: ${Array.isArray(features) ? features.join(", ") : "None"}
Current Listing Price: ${price ? "€" + price : "Not provided"}

Return a JSON object: min, max, recommendedSellPrice, verdict. Values should be numbers in EUR.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new HttpsError("internal", "Empty AI response");
    try {
      return JSON.parse(text.trim());
    } catch {
      throw new HttpsError("internal", "Invalid AI JSON response");
    }
  }
);

/**
 * Trigger: Send email to dealer when a new lead is created.
 */

export const onLeadCreated = onDocumentCreated(
  {
    document: "leads/{leadId}",
    secrets: [smtpHost, smtpUser, smtpPass, smtpFrom],
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const { dealerId, listingId, buyerName, buyerEmail, message, preferredContactMethod } = data;

    try {
      const db = admin.firestore();
      
      // 1. Get Dealer Info
      const dealerSnap = await db.doc(`users/${dealerId}`).get();
      const dealerData = dealerSnap.data();
      const dealerEmail = dealerData?.email;

      if (!dealerEmail) {
        logger.error(`No email found for dealer ${dealerId}`);
        return;
      }

      // 2. Get Listing Info
      const listingSnap = await db.doc(`listings/${listingId}`).get();
      const car = listingSnap.data();
      const carTitle = car ? `${car.year} ${car.make} ${car.model}` : "Vehicle";

      // 3. Setup Mail Transport
      const transporter = nodemailer.createTransport({
        host: smtpHost.value(),
        port: 465,
        secure: true,
        auth: {
          user: smtpUser.value(),
          pass: smtpPass.value(),
        },
      });

      const subject = `🚗 New Lead for your ${carTitle} - BalticAuto`;
      const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #6a1b9a;">You have a new buyer lead!</h2>
          <p>Hello ${dealerData?.name || "Dealer"},</p>
          <p>A potential buyer is interested in your <strong>${carTitle}</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Buyer Name:</strong> ${buyerName}</p>
            <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
            <p><strong>Preferred Contact:</strong> ${preferredContactMethod}</p>
            ${buyerEmail ? `<p><strong>Buyer Email:</strong> <a href="mailto:${buyerEmail}">${buyerEmail}</a></p>` : ""}
          </div>

          <p>You can view all details and manage this lead in your <a href="https://baltic-auto.net/admin" style="color: #6a1b9a; font-weight: bold; text-decoration: none;">Dealer Dashboard</a>.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #999; text-align: center;">Sent by BalticAuto Marketplace</p>
        </div>
      `;

      await transporter.sendMail({
        from: `"BalticAuto" <${smtpFrom.value()}>`,
        to: dealerEmail,
        replyTo: buyerEmail || undefined,
        subject,
        html,
        text: `New lead for your ${carTitle} from ${buyerName}. Message: ${message}`,
      });

      logger.info(`Lead email sent for lead ${event.params.leadId} to ${dealerEmail}`);
    } catch (err) {
      logger.error("Error sending lead email:", err);
    }
  }
);

/** 
 * --- STRIPE INTEGRATION ---
 * (MAP TIER IDs TO YOUR STRIPE PRICE IDs IN THE DASHBOARD)
 */
const PRICE_MAP: Record<string, string> = {
  "individual_plus": "price_123_individual_plus",
  "business_starter": "price_123_business_starter",
  "business_starter_pro": "price_123_business_starter_pro",
  "business_scale": "price_123_business_scale",
  "business_scale_pro": "price_123_business_scale_pro",
};

/**
 * Function: Create a Stripe Checkout Session
 */
export const createCheckoutSession = onCall(
  { region: "europe-west1", cors: true, invoker: "public", secrets: [stripeSecretKey] },
  async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    const email = request.auth?.token.email;
    if (!uid) throw new HttpsError("unauthenticated", "Login required");

    const planId = String(request.data?.planId || "");
    const priceId = PRICE_MAP[planId];

    if (!priceId) {
      throw new HttpsError("invalid-argument", `Invalid plan ${planId}. Make sure it is mapped in PRICE_MAP.`);
    }

    const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2024-06-20" as any });

    // 1. Get or create Stripe Customer
    const privateRef = admin.firestore().doc(`privateUserMetadata/${uid}`);
    const privateSnap = await privateRef.get();
    let customerId = privateSnap.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebaseUid: uid },
      });
      customerId = customer.id;
      await privateRef.set({ stripeCustomerId: customerId }, { merge: true });
    }

    // 2. Create Checkout Session
    const origin = request.rawRequest.headers.origin || "https://baltic-auto.net";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/choose-tier?success=1`,
      cancel_url: `${origin}/choose-tier?canceled=1`,
      client_reference_id: uid,
      subscription_data: {
        metadata: { firebaseUid: uid, planId },
      },
    });

    return { url: session.url };
  }
);

/**
 * Function: Create a Stripe Customer Portal Session (for Cancellation/Management)
 */
export const createPortalSession = onCall(
  { region: "europe-west1", cors: true, invoker: "public", secrets: [stripeSecretKey] },
  async (request: CallableRequest) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Login required");

    const privateSnap = await admin.firestore().doc(`privateUserMetadata/${uid}`).get();
    const customerId = privateSnap.data()?.stripeCustomerId;

    if (!customerId) {
      throw new HttpsError("failed-precondition", "No active subscription found (no Stripe ID).");
    }

    const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2024-06-20" as any });
    const origin = request.rawRequest.headers.origin || "https://baltic-auto.net";

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/admin`,
    });

    return { url: session.url };
  }
);

/**
 * Webhook: Handle Stripe status changes
 */
export const stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    const stripe = new Stripe(stripeSecretKey.value(), { apiVersion: "2024-06-20" as any });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value()
      );
    } catch (err: any) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const db = admin.firestore();

    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.updated": {
        const subscription = (event.type === "checkout.session.completed") 
          ? await stripe.subscriptions.retrieve((event.data.object as Stripe.Checkout.Session).subscription as string)
          : event.data.object as Stripe.Subscription;

        const uid = subscription.metadata.firebaseUid;
        const planId = subscription.metadata.planId;
        const status = subscription.status; // active, past_due, unpaid, canceled, incomplete

        if (uid) {
          await db.doc(`users/${uid}`).set({
            billing: {
              planId: planId || "business_starter",
              subscriptionId: subscription.id,
              status: status,
              updatedAt: new Date().toISOString(),
            }
          }, { merge: true });
          logger.info(`User ${uid} subscription updated: ${status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata.firebaseUid;
        if (uid) {
          await db.doc(`users/${uid}`).set({
            billing: {
              status: "canceled",
              planId: "individual_free", // Downgrade to free
              updatedAt: new Date().toISOString(),
            }
          }, { merge: true });
          logger.info(`User ${uid} subscription canceled.`);
        }
        break;
      }
    }

    res.json({ received: true });
  }
);

/**
 * Function: Dynamic XML Sitemap for SEO
 * Returns all published car listings in XML format.
 */
export const sitemap = onRequest(
  { region: "europe-west1", cors: true, invoker: "public" },
  async (req, res) => {
    const db = admin.firestore();
    const baseUrl = "https://baltic-auto.net";

    try {
      // 1. Fetch live listings
      const snapshot = await db.collection("listings")
        .where("deleted", "==", false)
        .where("status", "==", "published")
        .where("isSold", "==", false)
        .orderBy("createdAt", "desc")
        .get();

      const staticUrls = [
        "",
        "/businesses",
        "/about",
        "/pricing",
        "/privacy-policy",
        "/terms-of-service",
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Static Pages
      staticUrls.forEach(url => {
        xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${url === "" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
      });

      // Dynamic Listings
      snapshot.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        const lastMod = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString().split("T")[0] : new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0];
        
        xml += `  <url>\n    <loc>${baseUrl}/listing/${id}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      });

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (err) {
      logger.error("Sitemap generation failed:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

