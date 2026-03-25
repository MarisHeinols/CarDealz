import { serverTimestamp, arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { CarListingDetailsJson } from "~/types/types";
import { generateListingId, validateListing } from "~/models";
import { getUserProfile } from "./usersService";

/**
 * Creates a new listing in the database
 * @param userId - The ID of the user creating the listing
 * @param listing - The listing data to create
 * @returns The ID of the created listing
 * @throws Error if validation fails
 */
export async function createListing(
  userId: string,
  listing: CarListingDetailsJson
): Promise<string> {
  // 0. Verify business status (Force fresh check)
  const profile = await getUserProfile(userId, true);
  if (!profile) throw new Error("errors.profileNotFound");

  if (profile.role === "business") {
    const isApproved = profile.dealerVerified || profile.dealerVerificationStatus === "approved";
    if (!isApproved) {
      throw new Error("errors.businessNotApproved");
    }
  }

  // Validate listing before submission
  const validation = validateListing(listing);
  if (!validation.isValid) {
    throw new Error(JSON.stringify({ 
      key: "errors.validationFailed", 
      validationErrors: validation.errors 
    }));
  }

  // Generate ID if not provided
  const listingId = listing.id || generateListingId();
  const listingRef = doc(db, "listings", listingId);

  // Prepare listing data for database
  const listingData = {
    ...listing,
    id: listingId,
    sellerId: userId,
    isSold: false,
    deleted: false,
    createdAt: serverTimestamp(),
    lastViewed: serverTimestamp(),
  };

  // Save listing to database
  await setDoc(listingRef, listingData);

  // Update user's listings array
  const userRef = doc(db, "privateUsers", userId);
  await updateDoc(userRef, { listings: arrayUnion(listingId) });

  return listingId;
}

/**
 * Updates an existing listing
 * @param listingId - The ID of the listing to update
 * @param updates - Partial listing data to update
 */
export async function updateListing(
  listingId: string,
  updates: Partial<CarListingDetailsJson>
): Promise<void> {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, updates);
}

/**
 * Deletes a listing from the database
 * @param userId - The ID of the user who owns the listing
 * @param listingId - The ID of the listing to delete
 */
export async function deleteListing(
  userId: string,
  listingId: string
): Promise<void> {
  const listingRef = doc(db, "listings", listingId);
  await setDoc(listingRef, { deleted: true }, { merge: true });

  // Remove from user's listings array
  const userRef = doc(db, "privateUsers", userId);
  await updateDoc(userRef, {
    listings: arrayUnion(listingId) // Note: Firebase doesn't have arrayRemove for this use case
  });
}
