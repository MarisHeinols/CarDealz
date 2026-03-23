import { doc, getDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { cacheKeyUserProfile, getAnyCachedValue, setCachedValue } from "~/services/storeCache";

export type UserProfileDoc = {
  uid: string;
  email?: string;
  role?: "individual" | "business";
  status?: "active" | "disabled";
  storeHandle?: string;

  // business verification
  dealerVerified?: boolean;
  dealerVerificationStatus?: "pending" | "approved" | "rejected";

  // individual
  name?: string;
  surname?: string;
  phone?: string;
  country?: string;

  // business
  ownerName?: string;
  ownerSurname?: string;
  ownerPhone?: string;
  businessName?: string;
  storeName?: string;
  businessPhone?: string;
  address?: string;
  city?: string;
  registrationNumber?: string;
  website?: string;

  // billing
  billing?: {
    planId: string;
    subscriptionId?: string;
    status: "active" | "past_due" | "unpaid" | "canceled" | "incomplete" | "incomplete_expired" | "trialing";
    updatedAt: string;
  };
};

export async function getUserProfile(uid: string, forceRefresh = false): Promise<UserProfileDoc | null> {
  if (!forceRefresh) {
    const cached = getAnyCachedValue<UserProfileDoc>(cacheKeyUserProfile(uid));
    if (cached) return cached;
  }
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const value = { uid: snap.id, ...(snap.data() as any) } as UserProfileDoc;
  setCachedValue(cacheKeyUserProfile(uid), value);
  return value;
}

