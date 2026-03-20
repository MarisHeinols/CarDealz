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
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiEstimateMarketValue = exports.geminiAnalyzeCarImage = exports.setDealerVerificationStatus = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
(0, v2_1.setGlobalOptions)({ region: "europe-west1" });
admin.initializeApp();
const geminiApiKey = (0, params_1.defineSecret)("GEMINI_API_KEY");
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
