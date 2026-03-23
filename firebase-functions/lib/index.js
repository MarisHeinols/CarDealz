"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createPortalSession = exports.createCheckoutSession = exports.onLeadCreated = exports.geminiEstimateMarketValue = exports.geminiAnalyzeCarImage = exports.onDealerVerificationUpdated = exports.onBusinessRegistered = exports.deleteMyAccount = exports.deleteUserByAdmin = exports.verifyDealerAccount = exports.BILLING_ENABLED = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const params_1 = require("firebase-functions/params");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const firebase_functions_1 = require("firebase-functions");
const genai_1 = require("@google/genai");
const stripe_1 = __importDefault(require("stripe"));
(0, v2_1.setGlobalOptions)({ region: "europe-west1" });
admin.initializeApp();
// --- GLOBAL BILLING TOGGLE ---
// Set to true to require active Stripe subscriptions for all business features.
exports.BILLING_ENABLED = false;
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
const smtpHost = (0, params_1.defineSecret)("SMTP_HOST");
const smtpUser = (0, params_1.defineSecret)("SMTP_USER");
const smtpPass = (0, params_1.defineSecret)("SMTP_PASS");
const stripeSecretKey = (0, params_1.defineSecret)("STRIPE_SECRET_KEY");
const stripeWebhookSecret = (0, params_1.defineSecret)("STRIPE_WEBHOOK_SECRET");
const smtpFrom = (0, params_1.defineSecret)("SMTP_FROM");
const adminEmail = (0, params_1.defineSecret)("ADMIN_EMAIL");
exports.verifyDealerAccount = (0, https_1.onCall)({
    region: "europe-west1",
    cors: ["http://localhost:5173", "https://baltic-auto.net"],
    invoker: "public"
}, async (request) => {
    if (!request.data)
        throw new https_1.HttpsError("invalid-argument", "Request body is empty");
    const callerUid = request.auth?.uid;
    if (!callerUid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const isAdmin = request.auth?.token?.admin === true;
    if (!isAdmin)
        throw new https_1.HttpsError("permission-denied", "Admin access required");
    const dealerUid = String(request.data?.dealerUid || "").trim();
    const status = String(request.data?.status || "").trim();
    const reason = String(request.data?.reason || "").trim();
    if (!dealerUid)
        throw new https_1.HttpsError("invalid-argument", "Missing dealerUid");
    if (status !== "approved" && status !== "rejected" && status !== "pending") {
        throw new https_1.HttpsError("invalid-argument", "Invalid status");
    }
    const db = admin.firestore();
    const ref = db.doc(`users/${dealerUid}`);
    const snap = await ref.get();
    if (!snap.exists)
        throw new https_1.HttpsError("not-found", "Dealer user not found");
    const data = snap.data();
    if (String(data?.role || "") !== "business") {
        throw new https_1.HttpsError("failed-precondition", "Target user is not a business account");
    }
    const dealerVerified = status === "approved";
    await ref.set({
        dealerVerificationStatus: status,
        dealerVerified,
        dealerVerificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Keep reason private
    if (reason) {
        await db.doc(`privateUserMetadata/${dealerUid}`).set({
            dealerVerificationReason: reason,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    return { ok: true };
});
exports.deleteUserByAdmin = (0, https_1.onCall)({ region: "europe-west1" }, async (request) => {
    if (!request.data)
        throw new https_1.HttpsError("invalid-argument", "Request body is empty");
    const callerUid = request.auth?.uid;
    if (!callerUid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const isAdmin = request.auth?.token?.admin === true;
    if (!isAdmin)
        throw new https_1.HttpsError("permission-denied", "Admin access required");
    const targetUid = String(request.data?.uid || "").trim();
    if (!targetUid)
        throw new https_1.HttpsError("invalid-argument", "Missing uid");
    firebase_functions_1.logger.info(`START: Admin ${callerUid} deleting user ${targetUid}`);
    const db = admin.firestore();
    const auth = admin.auth();
    const batch = db.batch();
    try {
        // 1. STRIPE CANCELLATION
        const privateSnap = await db.doc(`privateUserMetadata/${targetUid}`).get();
        const customerId = privateSnap.data()?.stripeCustomerId;
        if (customerId) {
            try {
                const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2024-06-20" });
                const subscriptions = await stripe.subscriptions.list({ customer: customerId });
                for (const sub of subscriptions.data) {
                    await stripe.subscriptions.cancel(sub.id);
                }
                firebase_functions_1.logger.info(`Stripe subscriptions canceled for ${targetUid}`);
            }
            catch (sErr) {
                firebase_functions_1.logger.error(`Stripe cleanup failed for ${targetUid}:`, sErr);
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
        batch.delete(db.doc(`users/${targetUid}`));
        batch.delete(db.doc(`privateUserMetadata/${targetUid}`));
        await batch.commit();
        // 7. Auth
        try {
            await auth.deleteUser(targetUid);
        }
        catch (authErr) {
            if (authErr.code !== "auth/user-not-found") {
                throw authErr;
            }
        }
        firebase_functions_1.logger.info(`SUCCESS: Admin ${callerUid} deleted user ${targetUid}`);
        return { ok: true };
    }
    catch (err) {
        firebase_functions_1.logger.error(`FAIL: Admin deletion failed for ${targetUid}:`, err);
        throw new https_1.HttpsError("unknown", `Deletion failed: ${err.message || String(err)}`);
    }
});
exports.deleteMyAccount = (0, https_1.onCall)({ region: "europe-west1", secrets: [stripeSecretKey] }, async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    firebase_functions_1.logger.info(`START: User ${uid} deleting their own account`);
    const db = admin.firestore();
    const auth = admin.auth();
    const batch = db.batch();
    try {
        // 1. STRIPE CANCELLATION
        const privateSnap = await db.doc(`privateUserMetadata/${uid}`).get();
        const customerId = privateSnap.data()?.stripeCustomerId;
        if (customerId) {
            try {
                const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2024-06-20" });
                const subscriptions = await stripe.subscriptions.list({ customer: customerId });
                for (const sub of subscriptions.data) {
                    await stripe.subscriptions.cancel(sub.id);
                }
                firebase_functions_1.logger.info(`Stripe subscriptions canceled for ${uid}`);
            }
            catch (sErr) {
                firebase_functions_1.logger.error(`Stripe cleanup failed for ${uid}:`, sErr);
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
        batch.delete(db.doc(`users/${uid}`));
        batch.delete(db.doc(`privateUserMetadata/${uid}`));
        await batch.commit();
        // 7. Auth Delete
        await auth.deleteUser(uid);
        firebase_functions_1.logger.info(`SUCCESS: User ${uid} deleted their own account`);
        return { ok: true };
    }
    catch (err) {
        firebase_functions_1.logger.error(`FAIL: User deletion failed for ${uid}:`, err);
        throw new https_1.HttpsError("unknown", `Deletion failed: ${err.message || String(err)}`);
    }
});
exports.onBusinessRegistered = (0, firestore_1.onDocumentCreated)({
    document: "users/{uid}",
    secrets: [smtpHost, smtpUser, smtpPass, smtpFrom, adminEmail],
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    if (data.role !== "business")
        return;
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
          <p><strong>Phone:</strong> ${data.businessPhone || data.phone || data.ownerPhone || "N/A"}</p>
          <p><strong>Owner:</strong> ${data.ownerName || ""} ${data.ownerSurname || ""}</p>
          <p>Please log in to the admin dashboard to verify and approve or decline this registration.</p>
        </div>
      `;
        await transporter.sendMail({
            from: `"BalticAuto Admin" <${smtpFrom.value()}>`,
            to: adminEmail.value(),
            subject,
            html,
        });
        firebase_functions_1.logger.info(`Admin notified of new business ${data.uid}`);
    }
    catch (err) {
        firebase_functions_1.logger.error("Error sending admin notification:", err);
    }
});
exports.onDealerVerificationUpdated = (0, firestore_1.onDocumentUpdated)({
    document: "users/{uid}",
    secrets: [smtpHost, smtpUser, smtpPass, smtpFrom],
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (after.role !== "business")
        return;
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
            <p>Hello ${after.ownerName || after.name || "Dealer"},</p>
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
            firebase_functions_1.logger.info(`Dealer ${after.uid} notified of verification status: ${newStatus}`);
        }
        catch (err) {
            firebase_functions_1.logger.error("Error sending dealer verification email:", err);
        }
    }
});
function getGemini() {
    return new genai_1.GoogleGenAI({ apiKey: geminiApiKey.value() });
}
exports.geminiAnalyzeCarImage = (0, https_1.onCall)({
    cors: true,
    invoker: "public",
    secrets: [geminiApiKey],
}, async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const imageBase64 = String(request.data?.imageBase64 || "");
    const mimeType = String(request.data?.mimeType || "image/jpeg");
    if (!imageBase64)
        throw new https_1.HttpsError("invalid-argument", "Missing imageBase64");
    const ai = getGemini();
    const prompt = 'Analyze this car image and return a flat JSON object with the vehicle\'s details: make, model, year, color. Example: {"make":"Toyota","model":"Camry","year":2018,"color":"Silver"}.\n' +
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
    if (!text)
        throw new https_1.HttpsError("internal", "Empty AI response");
    let parsed;
    try {
        parsed = JSON.parse(text.trim());
    }
    catch {
        throw new https_1.HttpsError("internal", "Invalid AI JSON response");
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
    if (parsed?.color && !validColors.includes(parsed.color))
        parsed.color = "Other";
    return parsed;
});
exports.geminiEstimateMarketValue = (0, https_1.onCall)({
    cors: true,
    invoker: "public",
    secrets: [geminiApiKey],
}, async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const listing = request.data?.listing || {};
    const make = String(listing?.make || "");
    const model = String(listing?.model || "");
    if (!make || !model)
        throw new https_1.HttpsError("invalid-argument", "Make and model are required");
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
    if (!text)
        throw new https_1.HttpsError("internal", "Empty AI response");
    try {
        return JSON.parse(text.trim());
    }
    catch {
        throw new https_1.HttpsError("internal", "Invalid AI JSON response");
    }
});
/**
 * Trigger: Send email to dealer when a new lead is created.
 */
exports.onLeadCreated = (0, firestore_1.onDocumentCreated)({
    document: "leads/{leadId}",
    secrets: [smtpHost, smtpUser, smtpPass, smtpFrom],
}, async (event) => {
    const data = event.data?.data();
    if (!data)
        return;
    const { dealerId, listingId, buyerName, buyerEmail, message, preferredContactMethod } = data;
    try {
        const db = admin.firestore();
        // 1. Get Dealer Info
        const dealerSnap = await db.doc(`users/${dealerId}`).get();
        const dealerData = dealerSnap.data();
        const dealerEmail = dealerData?.email;
        if (!dealerEmail) {
            firebase_functions_1.logger.error(`No email found for dealer ${dealerId}`);
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
        firebase_functions_1.logger.info(`Lead email sent for lead ${event.params.leadId} to ${dealerEmail}`);
    }
    catch (err) {
        firebase_functions_1.logger.error("Error sending lead email:", err);
    }
});
/**
 * --- STRIPE INTEGRATION ---
 * (MAP TIER IDs TO YOUR STRIPE PRICE IDs IN THE DASHBOARD)
 */
const PRICE_MAP = {
    "individual_plus": "price_123_individual_plus",
    "business_starter": "price_123_business_starter",
    "business_starter_pro": "price_123_business_starter_pro",
    "business_scale": "price_123_business_scale",
    "business_scale_pro": "price_123_business_scale_pro",
};
/**
 * Function: Create a Stripe Checkout Session
 */
exports.createCheckoutSession = (0, https_1.onCall)({ region: "europe-west1", cors: true, invoker: "public", secrets: [stripeSecretKey] }, async (request) => {
    const uid = request.auth?.uid;
    const email = request.auth?.token.email;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const planId = String(request.data?.planId || "");
    const priceId = PRICE_MAP[planId];
    if (!priceId) {
        throw new https_1.HttpsError("invalid-argument", `Invalid plan ${planId}. Make sure it is mapped in PRICE_MAP.`);
    }
    const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2024-06-20" });
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
});
/**
 * Function: Create a Stripe Customer Portal Session (for Cancellation/Management)
 */
exports.createPortalSession = (0, https_1.onCall)({ region: "europe-west1", cors: true, invoker: "public", secrets: [stripeSecretKey] }, async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const privateSnap = await admin.firestore().doc(`privateUserMetadata/${uid}`).get();
    const customerId = privateSnap.data()?.stripeCustomerId;
    if (!customerId) {
        throw new https_1.HttpsError("failed-precondition", "No active subscription found (no Stripe ID).");
    }
    const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2024-06-20" });
    const origin = request.rawRequest.headers.origin || "https://baltic-auto.net";
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/admin`,
    });
    return { url: session.url };
});
/**
 * Webhook: Handle Stripe status changes
 */
exports.stripeWebhook = (0, https_1.onRequest)({ secrets: [stripeSecretKey, stripeWebhookSecret] }, async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const stripe = new stripe_1.default(stripeSecretKey.value(), { apiVersion: "2024-06-20" });
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value());
    }
    catch (err) {
        firebase_functions_1.logger.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    const db = admin.firestore();
    switch (event.type) {
        case "checkout.session.completed":
        case "customer.subscription.updated": {
            const subscription = (event.type === "checkout.session.completed")
                ? await stripe.subscriptions.retrieve(event.data.object.subscription)
                : event.data.object;
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
                firebase_functions_1.logger.info(`User ${uid} subscription updated: ${status}`);
            }
            break;
        }
        case "customer.subscription.deleted": {
            const subscription = event.data.object;
            const uid = subscription.metadata.firebaseUid;
            if (uid) {
                await db.doc(`users/${uid}`).set({
                    billing: {
                        status: "canceled",
                        planId: "individual_free", // Downgrade to free
                        updatedAt: new Date().toISOString(),
                    }
                }, { merge: true });
                firebase_functions_1.logger.info(`User ${uid} subscription canceled.`);
            }
            break;
        }
    }
    res.json({ received: true });
});
