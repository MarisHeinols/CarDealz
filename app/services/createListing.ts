import {  serverTimestamp, arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";


export async function createListing(userId: string, listing: any) {
  const listingId = listing.id || Date.now().toString(); // simple ID
  const listingRef = doc(db, "listings", listingId);

  await setDoc(listingRef, { ...listing, id: listingId, sellerId: userId, createdAt: serverTimestamp()});

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { listings: arrayUnion(listingId) });

  return listingId;
}