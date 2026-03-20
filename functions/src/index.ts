import { onCall, onRequest, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { defineSecret } from "firebase-functions/params";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

setGlobalOptions({ region: "europe-west1" });

admin.initializeApp();

const geminiApiKey = defineSecret("GEMINI_API_KEY");

// NOTE: Email notifications (SMTP) are temporarily disabled until SMTP secrets are configured.

type DealerVerificationStatus = "pending" | "approved" | "rejected";

export const setDealerVerificationStatus = onCall(
  {},
  async (request: CallableRequest) => {
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
    const ref = db.doc(`users/${dealerUid}`);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Dealer user not found");

    const data = snap.data() as any;
    if (String(data?.role || "") !== "business") {
      throw new HttpsError("failed-precondition", "Target user is not a business account");
    }

    const dealerVerified = status === "approved";
    await ref.set(
      {
        dealerVerificationStatus: status,
        dealerVerified,
        ...(reason ? { dealerVerificationReason: reason } : {}),
        dealerVerificationUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { ok: true };
  }
);

// NOTE: Email triggers for dealer verification are temporarily disabled until SMTP secrets are configured.

function getGemini() {
  return new GoogleGenAI({ apiKey: geminiApiKey.value() });
}

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
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Login required");

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
