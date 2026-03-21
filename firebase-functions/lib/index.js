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
exports.stripeWebhook = exports.createPortalSession = exports.createCheckoutSession = exports.onLeadCreated = exports.geminiEstimateMarketValue = exports.geminiAnalyzeCarImage = exports.setDealerVerificationStatus = void 0;
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
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
const smtpHost = (0, params_1.defineSecret)("SMTP_HOST");
const smtpUser = (0, params_1.defineSecret)("SMTP_USER");
const smtpPass = (0, params_1.defineSecret)("SMTP_PASS");
const stripeSecretKey = (0, params_1.defineSecret)("STRIPE_SECRET_KEY");
const stripeWebhookSecret = (0, params_1.defineSecret)("STRIPE_WEBHOOK_SECRET");
exports.setDealerVerificationStatus = (0, https_1.onCall)({}, async (request) => {
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
        ...(reason ? { dealerVerificationReason: reason } : {}),
        dealerVerificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { ok: true };
});
// NOTE: Email triggers for dealer verification are temporarily disabled until SMTP secrets are configured.
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
const smtpFrom = (0, params_1.defineSecret)("SMTP_FROM");
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
exports.createCheckoutSession = (0, https_1.onCall)({ secrets: [stripeSecretKey] }, async (request) => {
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
    const userRef = admin.firestore().doc(`users/${uid}`);
    const userSnap = await userRef.get();
    let customerId = userSnap.data()?.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email,
            metadata: { firebaseUid: uid },
        });
        customerId = customer.id;
        await userRef.set({ stripeCustomerId: customerId }, { merge: true });
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
exports.createPortalSession = (0, https_1.onCall)({ secrets: [stripeSecretKey] }, async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new https_1.HttpsError("unauthenticated", "Login required");
    const userSnap = await admin.firestore().doc(`users/${uid}`).get();
    const customerId = userSnap.data()?.stripeCustomerId;
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
        case "checkout.session.completed": {
            const session = event.data.object;
            const uid = session.client_reference_id;
            const subscriptionId = session.subscription;
            // Fetch subscription to get Plan ID from metadata
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const planId = subscription.metadata.planId;
            if (uid && planId) {
                await db.doc(`users/${uid}`).set({
                    billing: {
                        planId,
                        subscriptionId,
                        status: "active",
                        updatedAt: new Date().toISOString(),
                    }
                }, { merge: true });
                firebase_functions_1.logger.info(`User ${uid} subscribed to ${planId}`);
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
