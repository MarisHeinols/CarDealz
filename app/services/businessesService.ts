import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { UserProfileDoc } from "~/services/usersService";

const PUBLIC_USERS_COLLECTION = "publicUsers";
const PRIVATE_USERS_COLLECTION = "privateUsers";

export async function getBusinessUsers(): Promise<UserProfileDoc[]> {
  const usersRef = collection(db, PUBLIC_USERS_COLLECTION);
  // Single-field query — no composite index needed.
  // Filter dealerVerified client-side to avoid index dependency.
  const q = query(usersRef, where("role", "==", "business"));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...(d.data() as any) }) as UserProfileDoc)
    .filter((u: any) => u.dealerVerified === true);
}

export async function getAllBusinessUsers(): Promise<UserProfileDoc[]> {
  const usersRef = collection(db, PRIVATE_USERS_COLLECTION);
  const q = query(usersRef, where("role", "==", "business"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })) as UserProfileDoc[];
}

