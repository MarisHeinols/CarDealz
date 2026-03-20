import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { UserProfileDoc } from "~/services/usersService";

export async function getBusinessUsers(): Promise<UserProfileDoc[]> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "business"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })) as UserProfileDoc[];
}

