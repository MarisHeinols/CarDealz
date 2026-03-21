import { doc, updateDoc, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { deleteUser, type User } from "firebase/auth";
import { db } from "~/firebase/fireStore";

const USERS_COLLECTION = "users";
const LISTINGS_COLLECTION = "listings";

/**
 * Disables a user's account by setting a disabled flag.
 * This should hide their store and listings from public view.
 */
export async function disableAccount(uid: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    status: "disabled",
    disabledAt: new Date().toISOString(),
  });

  // Also mark all their listings as draft or disabled
  const listingsRef = collection(db, LISTINGS_COLLECTION);
  const q = query(listingsRef, where("sellerId", "==", uid));
  const snap = await getDocs(q);
  
  const batch = writeBatch(db);
  snap.forEach((d) => {
    batch.update(d.ref, { status: "draft" }); // Hide from public by making them drafts
  });
  await batch.commit();
}

/**
 * Permanently deletes a user's account and hides their data.
 * Note: Re-authentication may be required by Firebase if the user session is old.
 */
export async function permanentDeleteAccount(user: User): Promise<void> {
  const uid = user.uid;

  // 1. Mark all listings as deleted
  const listingsRef = collection(db, LISTINGS_COLLECTION);
  const q = query(listingsRef, where("sellerId", "==", uid));
  const snap = await getDocs(q);
  
  const batch = writeBatch(db);
  snap.forEach((d) => {
    batch.update(d.ref, { deleted: true, deletedAt: new Date().toISOString() });
  });
  
  // 2. Mark user doc as deleted
  batch.update(doc(db, USERS_COLLECTION, uid), { 
    deleted: true, 
    deletedAt: new Date().toISOString(),
    email: `deleted_${Date.now()}@deleted.com` // Scramble email for privacy/reuse
  });
  
  await batch.commit();

  // 3. Delete from Firebase Auth (This must be the last step)
  await deleteUser(user);
}
