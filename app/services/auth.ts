import { auth } from "~/firebase/auth";
import { db } from "../firebase/fireStore";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  deleteUser,
  sendEmailVerification,
  reload,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { saveStoreSettings } from "./storeSettingsService";
import { slugify } from "~/utils/slugify";
import { reserveBusinessName } from "~/services/businessNameService";

const PUBLIC_USERS_COLLECTION = "publicUsers";
const PRIVATE_USERS_COLLECTION = "privateUsers";

export const registerUser = async (
  email: string,
  password: string,
  userData: any,
  role: "individual" | "business"
) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  
  // 1. Pre-check availability (Commented out because current Firestore rules restrict public querying of private user data)
  // await checkAvailability(normalizedEmail, userData, role);

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

  const publicPayload = {
    uid: cred.user.uid,
    role,
    status: "active",
    ...(role === "business"
      ? { dealerVerified: false, dealerVerificationStatus: "pending" as const }
      : {}),
    ...(storeHandle ? { storeHandle } : {}),
    createdAt: serverTimestamp(),
  };

  const privatePayload = {
    uid: cred.user.uid,
    email: normalizedEmail,
    role,
    status: "active",
    ...(role === "business"
      ? { dealerVerified: false, dealerVerificationStatus: "pending" as const }
      : {}),
    ...(storeHandle ? { storeHandle } : {}),
    ...userData,
    createdAt: serverTimestamp(),
  };

  await Promise.all([
    setDoc(doc(db, PUBLIC_USERS_COLLECTION, cred.user.uid), publicPayload),
    setDoc(doc(db, PRIVATE_USERS_COLLECTION, cred.user.uid), privatePayload),
  ]);

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
        phone: userData.businessPhone || userData.phone || "",
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

  const normalizedEmail = String(user.email || "").trim().toLowerCase();
  
  // 1. Pre-check availability (Commented out due to Firestore permission restrictions on private data)
  // await checkAvailability(normalizedEmail, userData, role, user.uid);

  // Prevent copycat business profiles (reserve business name)
  if (role === "business") {
    const name = String(userData?.businessName || userData?.storeName || "").trim();
    await reserveBusinessName(user.uid, name);
  }

  const storeHandle =
    role === "business"
      ? buildStoreHandle(user.uid, userData, user.email || "")
      : undefined;

  const publicPayload = {
    uid: user.uid,
    role,
    status: "active",
    ...(role === "business"
      ? { dealerVerified: false, dealerVerificationStatus: "pending" as const }
      : {}),
    ...(storeHandle ? { storeHandle } : {}),
    createdAt: serverTimestamp(),
  };
  const privatePayload = {
    uid: user.uid,
    email: normalizedEmail || undefined,
    role,
    status: "active",
    ...(role === "business"
      ? { dealerVerified: false, dealerVerificationStatus: "pending" as const }
      : {}),
    ...(storeHandle ? { storeHandle } : {}),
    ...userData,
    createdAt: serverTimestamp(),
  };
  await Promise.all([
    setDoc(doc(db, PUBLIC_USERS_COLLECTION, user.uid), publicPayload, { merge: true }),
    setDoc(doc(db, PRIVATE_USERS_COLLECTION, user.uid), privatePayload, { merge: true }),
  ]);

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
        phone: userData.businessPhone || userData.phone || "",
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
    (email ? email.split("@")[0] : "store");

  const slug = slugify(String(base)) || "store";
  // As business names are unique, we use the slug directly.
  return slug;
}

/**
 * Checks if email, phone, or business name is already taken in Firestore
 */
async function checkAvailability(email: string, userData: any, role: string, currentUid?: string) {
  const phone = (
    userData.phone ||
    userData.businessPhone ||
    userData.ownerPhone ||
    ""
  ).trim();

  // 1. Check Phone
  if (phone) {
    const usersRef = collection(db, PRIVATE_USERS_COLLECTION);
    
    // Check both potential phone fields
    const q1 = query(usersRef, where("phone", "==", phone));
    const q2 = query(usersRef, where("ownerPhone", "==", phone));
    const q3 = query(usersRef, where("businessPhone", "==", phone));
    
    const [snap1, snap2, snap3] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
      getDocs(q3),
    ]);
    
    const conflictingUser = [...snap1.docs, ...snap2.docs, ...snap3.docs].find(
      (d) => !currentUid || d.id !== currentUid
    );
    
    if (conflictingUser) {
      throw new Error(`The phone number ${phone} is already linked to another account.`);
    }
  }
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
  return false;
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