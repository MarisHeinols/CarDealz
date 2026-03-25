import { doc, updateDoc, writeBatch, collection, query, where, getDocs } from "firebase/firestore";
import { deleteUser, type User } from "firebase/auth";
import { db } from "~/firebase/fireStore";

const PUBLIC_USERS_COLLECTION = "publicUsers";
const PRIVATE_USERS_COLLECTION = "privateUsers";
const LEGACY_USERS_COLLECTION = "users";
const LISTINGS_COLLECTION = "listings";

/**
 * Disables a user's account by setting a disabled flag.
 * This should hide their store and listings from public view.
 */
export async function disableAccount(uid: string): Promise<void> {
  const payload = {
    status: "disabled",
    disabledAt: new Date().toISOString(),
  };
  await Promise.all([
    updateDoc(doc(db, PUBLIC_USERS_COLLECTION, uid), payload),
    updateDoc(doc(db, PRIVATE_USERS_COLLECTION, uid), payload),
  ]);

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
 * Re-activates a user's account.
 */
export async function reActivateAccount(uid: string): Promise<void> {
  const payload = {
    status: "active",
    reactivatedAt: new Date().toISOString(),
  };
  await Promise.all([
    updateDoc(doc(db, PUBLIC_USERS_COLLECTION, uid), payload),
    updateDoc(doc(db, PRIVATE_USERS_COLLECTION, uid), payload),
  ]);
}

/**
 * Permanently deletes a user's account and all associated data from the database.
 */
export async function permanentDeleteAccount(user: User): Promise<void> {
  const uid = user.uid;
  const batch = writeBatch(db);

  // 1. HARD DELETE all listings
  const listingsSnap = await getDocs(query(collection(db, LISTINGS_COLLECTION), where("sellerId", "==", uid)));
  listingsSnap.forEach((d) => batch.delete(d.ref));

  // 2. HARD DELETE all leads directed to/from this user
  const leadsInSnap = await getDocs(query(collection(db, "leads"), where("dealerId", "==", uid)));
  leadsInSnap.forEach((d) => batch.delete(d.ref));
  const leadsOutSnap = await getDocs(query(collection(db, "leads"), where("buyerUid", "==", uid)));
  leadsOutSnap.forEach((d) => batch.delete(d.ref));

  // 3. HARD DELETE all reviews for/by this user
  const reviewsForSnap = await getDocs(query(collection(db, "storeReviews"), where("storeUid", "==", uid)));
  reviewsForSnap.forEach((d) => batch.delete(d.ref));
  const reviewsBySnap = await getDocs(query(collection(db, "storeReviews"), where("reviewerUid", "==", uid)));
  reviewsBySnap.forEach((d) => batch.delete(d.ref));

  // 4. HARD DELETE business name reservation
  const namesSnap = await getDocs(query(collection(db, "businessNames"), where("uid", "==", uid)));
  namesSnap.forEach((d) => batch.delete(d.ref));

  // 5. HARD DELETE store settings
  batch.delete(doc(db, "storeSettings", uid));

  // 6. HARD DELETE the user document and private metadata
  batch.delete(doc(db, "privateUserMetadata", uid));
  batch.delete(doc(db, PUBLIC_USERS_COLLECTION, uid));
  batch.delete(doc(db, PRIVATE_USERS_COLLECTION, uid));
  batch.delete(doc(db, LEGACY_USERS_COLLECTION, uid));

  // Execute all deletions
  await batch.commit();

  // 7. Finally, delete the account from Firebase Auth
  await deleteUser(user);
}
