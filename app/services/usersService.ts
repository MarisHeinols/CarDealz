import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { cacheKeyUserProfile, getAnyCachedValue, setCachedValue } from "~/services/storeCache";

export type UserProfileDoc = {
  uid: string;
  role?: "individual" | "business";
  status?: "active" | "disabled";
  storeHandle?: string;

  // business verification
  dealerVerified?: boolean;
  dealerVerificationStatus?: "pending" | "approved" | "rejected";
};

export type PrivateUserProfileDoc = {
  uid: string;
  email?: string;
  role?: "individual" | "business";
  status?: "active" | "disabled";
  storeHandle?: string;

  // individual
  name?: string;
  surname?: string;
  phone?: string;
  country?: string;

  // business
  businessName?: string;
  storeName?: string;
  businessPhone?: string;
  address?: string;
  city?: string;
  registrationNumber?: string;
  website?: string;

  // business verification
  dealerVerified?: boolean;
  dealerVerificationStatus?: "pending" | "approved" | "rejected";

  // billing
  billing?: {
    planId: string;
    subscriptionId?: string;
    status:
      | "active"
      | "past_due"
      | "unpaid"
      | "canceled"
      | "incomplete"
      | "incomplete_expired"
      | "trialing";
    updatedAt: string;
  };
};

const PUBLIC_USERS_COLLECTION = "publicUsers";
const PRIVATE_USERS_COLLECTION = "privateUsers";
const LEGACY_USERS_COLLECTION = "users";

function toPublicUserDoc(uid: string, data: any): UserProfileDoc {
  return {
    uid,
    role: data?.role,
    status: data?.status,
    storeHandle: data?.storeHandle,
    dealerVerified: data?.dealerVerified,
    dealerVerificationStatus: data?.dealerVerificationStatus,
  };
}

function toPrivateUserDoc(uid: string, data: any): PrivateUserProfileDoc {
  return { uid, ...(data || {}) } as PrivateUserProfileDoc;
}

export async function getUserProfile(uid: string, forceRefresh = false): Promise<UserProfileDoc | null> {
  if (!forceRefresh) {
    const cached = getAnyCachedValue<UserProfileDoc>(cacheKeyUserProfile(uid));
    if (cached) return cached;
  }
  const snap = await getDoc(doc(db, PUBLIC_USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  const value = toPublicUserDoc(snap.id, snap.data());
  setCachedValue(cacheKeyUserProfile(uid), value);
  return value;
}

export async function getPrivateUserProfile(uid: string): Promise<PrivateUserProfileDoc | null> {
  const snap = await getDoc(doc(db, PRIVATE_USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return toPrivateUserDoc(snap.id, snap.data());
}

/**
 * Best-effort migration for older deployments that stored all fields in `users/{uid}`.
 * Runs client-side for the logged-in user only.
 */
export async function migrateLegacyUserDoc(uid: string): Promise<void> {
  const [pubSnap, legacySnap] = await Promise.all([
    getDoc(doc(db, PUBLIC_USERS_COLLECTION, uid)),
    getDoc(doc(db, LEGACY_USERS_COLLECTION, uid)),
  ]);
  if (pubSnap.exists()) return;
  if (!legacySnap.exists()) return;
  const legacy = legacySnap.data() as any;

  const publicPayload = {
    uid,
    role: legacy?.role,
    status: legacy?.status || "active",
    storeHandle: legacy?.storeHandle,
    dealerVerified: legacy?.dealerVerified,
    dealerVerificationStatus: legacy?.dealerVerificationStatus,
    createdAt: legacy?.createdAt || serverTimestamp(),
    migratedAt: serverTimestamp(),
  };

  const privatePayload = {
    ...legacy,
    uid,
    migratedAt: serverTimestamp(),
  };

  await Promise.all([
    setDoc(doc(db, PUBLIC_USERS_COLLECTION, uid), publicPayload, { merge: true }),
    setDoc(doc(db, PRIVATE_USERS_COLLECTION, uid), privatePayload, { merge: true }),
  ]);
}

