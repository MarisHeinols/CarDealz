import { auth } from "~/firebase/auth";
import { db } from "../firebase/fireStore";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  sendEmailVerification,
  reload,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { saveStoreSettings } from "./storeSettingsService";
import { slugify } from "~/utils/slugify";
import { reserveBusinessName } from "~/services/businessNameService";

export const registerUser = async (
  email: string,
  password: string,
  userData: any,
  role: "individual" | "business"
) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

  // Prevent copycat business profiles (reserve business name)
  if (role === "business") {
    const name = String(userData?.businessName || userData?.storeName || "").trim();
    try {
      await reserveBusinessName(cred.user.uid, name);
    } catch (e) {
      // Roll back auth user if name is taken
      try {
        await deleteUser(cred.user);
      } catch {
        // ignore; best-effort cleanup
      }
      throw e;
    }
  }

  const storeHandle =
    role === "business"
      ? buildStoreHandle(cred.user.uid, userData, email)
      : undefined;

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email: normalizedEmail,
    role,
    ...(role === "business"
      ? { dealerVerified: false, dealerVerificationStatus: "pending" as const }
      : {}),
    ...(storeHandle ? { storeHandle } : {}),
    ...userData,
    createdAt: serverTimestamp(),
  });

  if (role === "business") {
    const defaultDay = { open: "09:00", close: "18:00", isClosed: false };
    const lat = Number.parseFloat(String(userData?.lat || ""));
    const lng = Number.parseFloat(String(userData?.lng || ""));
    const cords = {
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    };
    const addressParts = [
      String(userData?.address || "").trim(),
      String(userData?.city || "").trim(),
      String(userData?.country || "").trim(),
    ].filter(Boolean);
    const defaultSettings = {
      name: userData.businessName || "My Dealership",
      description: "Welcome to my online store!",
      contact: {
        phone: userData.businessPhone || userData.ownerPhone || userData.phone || "",
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
        adress: addressParts.join(", "),
        cords,
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

export const completeSocialRegistration = async (
  userData: any,
  role: "individual" | "business"
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to complete registration.");

  // Prevent copycat business profiles (reserve business name)
  if (role === "business") {
    const name = String(userData?.businessName || userData?.storeName || "").trim();
    await reserveBusinessName(user.uid, name);
  }

  const storeHandle =
    role === "business"
      ? buildStoreHandle(user.uid, userData, user.email || "")
      : undefined;

  const normalizedEmail = String(user.email || "").trim().toLowerCase();

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: normalizedEmail || undefined,
    role,
    ...(role === "business"
      ? { dealerVerified: false, dealerVerificationStatus: "pending" as const }
      : {}),
    ...(storeHandle ? { storeHandle } : {}),
    ...userData,
    createdAt: serverTimestamp(),
  });

  if (role === "business") {
    const defaultDay = { open: "09:00", close: "18:00", isClosed: false };
    const lat = Number.parseFloat(String(userData?.lat || ""));
    const lng = Number.parseFloat(String(userData?.lng || ""));
    const cords = {
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    };
    const addressParts = [
      String(userData?.address || "").trim(),
      String(userData?.city || "").trim(),
      String(userData?.country || "").trim(),
    ].filter(Boolean);
    const defaultSettings = {
      name: userData.businessName || userData.storeName || "My Dealership",
      description: "Welcome to my online store!",
      contact: {
        phone: userData.businessPhone || userData.ownerPhone || userData.phone || "",
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
        adress: addressParts.join(", "),
        cords,
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
      await saveStoreSettings(user.uid, defaultSettings);
    } catch (e) {
      console.error("Failed to create default store settings during registration", e);
    }
  }

  return user;
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

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return await signInWithPopup(auth, provider);
}

export async function loginWithFacebook() {
  const provider = new FacebookAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function sendVerificationEmail(user: User) {
  return await sendEmailVerification(user);
}

export async function refreshCurrentUser() {
  if (!auth.currentUser) return;
  await reload(auth.currentUser);
}

export function isEmailVerified(user: User | null | undefined) {
  if (!user) return false;
  if (!user.email) return false;
  // Password accounts require verification; social providers are considered verified.
  const providers = user.providerData.map((p) => p.providerId);
  const isPassword = providers.includes("password");
  return isPassword ? Boolean(user.emailVerified) : true;
}

export function needsPhoneVerification(user: User | null | undefined) {
  if (!user) return false;
  return !user.phoneNumber;
}

export function formatAuthError(err: any): string {
  const code = String(err?.code || "");
  if (code === "auth/invalid-email") return "Invalid email address.";
  if (code === "auth/user-disabled") return "This account has been disabled.";
  if (code === "auth/user-not-found") return "No account found with this email.";
  if (code === "auth/wrong-password") return "Incorrect password.";
  if (code === "auth/invalid-credential") return "Incorrect email or password.";
  if (code === "auth/email-already-in-use") return "An account with this email already exists.";
  if (code === "auth/weak-password") return "Password is too weak (minimum 6 characters).";
  if (code === "auth/popup-closed-by-user") return "Sign-in popup was closed.";
  if (code === "auth/account-exists-with-different-credential")
    return "An account already exists with the same email but different sign-in method.";
  if (code === "auth/too-many-requests")
    return "Too many attempts. Please wait a bit and try again.";
  return err?.message || "Authentication failed.";
}