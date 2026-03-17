import { auth } from "~/firebase/auth";
import { db } from "../firebase/fireStore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { saveStoreSettings } from "./storeSettingsService";
import { slugify } from "~/utils/slugify";

export const registerUser = async (
  email: string,
  password: string,
  userData: any,
  role: "individual" | "business"
) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

  const storeHandle =
    role === "business"
      ? buildStoreHandle(cred.user.uid, userData, email)
      : undefined;

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email: normalizedEmail,
    role,
    ...(storeHandle ? { storeHandle } : {}),
    ...userData,
    createdAt: serverTimestamp(),
  });

  if (role === "business") {
    const defaultDay = { open: "09:00", close: "18:00", isClosed: false };
    const defaultSettings = {
      name: userData.businessName || "My Dealership",
      description: "Welcome to my online store!",
      contact: {
        phone: userData.phone || "",
        email: normalizedEmail,
      },
      workTime: {
        Monday: { ...defaultDay },
        Tuesday: { ...defaultDay },
        Wednesday: { ...defaultDay },
        Thursday: { ...defaultDay },
        Friday: { ...defaultDay },
        Saturday: { ...defaultDay, open: "10:00", close: "16:00" },
        Sunday: { ...defaultDay, isClosed: true },
      },
      bannerImage: null,
      logo: null,
      location: {
        adress: userData.country ? `${userData.city ? userData.city + ", " : ""}${userData.country}` : "",
        cords: { lat: null, lng: null },
      },
      theme: {
        primary: "rgb(122, 0, 129)",
        secondary: "#ffffff",
        background: "#ffffff",
        accent: "#4caf50",
        heading: "#111827",
        isTextLight: false,
        layout: "classic" as const,
      },
      isEditMode: false,
    };
    try {
      await saveStoreSettings(cred.user.uid, defaultSettings);
    } catch (e) {
      // Non-fatal: the account + user doc are already created.
      // This can fail if Firestore rules don't allow creating `storeSettings/{uid}` yet.
      console.error("Failed to create default store settings during registration", e);
    }
  }

  return cred;
};

function buildStoreHandle(uid: string, userData: any, email: string): string {
  const base =
    userData?.businessName ||
    userData?.storeName ||
    `${userData?.ownerName || ""} ${userData?.ownerSurname || ""}`.trim() ||
    (email ? email.split("@")[0] : "store");

  const slug = slugify(String(base)) || "store";
  // Ensure uniqueness without extra queries.
  return `${slug}-${uid.slice(0, 6)}`;
}


export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export const login = async (email: string, password: string) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return await signInWithEmailAndPassword(auth, normalizedEmail, password);
};