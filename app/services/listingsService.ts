import { collection, getDocs, getDoc, query, where, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { CarListingDetailsJson, CarListingSummary } from "~/types/types";

// Helper to convert Firestore document data to our Summary type
export function mapListingToSummary(id: string, data: any): CarListingSummary {
  return {
    id,
    make: data.make || "",
    model: data.model || "",
    year: data.year || 0,
    mileage: data.mileage || 0,
    price: data.price || 0,
    condition: data.condition || "used",
    location: data.location || "",
    color: data.color || "",
    marketRange: data.marketRange || { min: 0, max: 0 },
    thumbnailUrl: data.images?.[0]?.url || data.thumbnailUrl || "",
    viewCount: data.viewCount || 0,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    isOnSale: data.isOnSale || false,
    salePrice: data.salePrice,
    sellerId: data.sellerId || "",
    sellerName: data.seller?.name || "",
    isDealer: data.seller?.isDealer || false,
  } as CarListingSummary;
}

export async function getAllListings(): Promise<CarListingSummary[]> {
  const listingsRef = collection(db, "listings");
  // Fetch all listings and filter deleted ones client-side.
  // Avoids relying on a Firestore composite index for != queries,
  // and also handles listings created before the `deleted` field was added.
  const snapshot = await getDocs(listingsRef);

  const results: CarListingSummary[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.deleted !== true) {
      results.push(mapListingToSummary(doc.id, data));
    }
  });
  return results;
}

export async function getListingsByOwner(userId: string): Promise<CarListingSummary[]> {
  const listingsRef = collection(db, "listings");
  // In Firebase, we can't easily compound != and == without an index and possibly logic issues.
  // Best to query by sellerId and filter out deleted locally.
  const q = query(listingsRef, where("sellerId", "==", userId));
  const snapshot = await getDocs(q);
  
  const results: CarListingSummary[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.deleted) {
      results.push(mapListingToSummary(doc.id, data));
    }
  });
  return results;
}

export async function markAsSale(listingId: string, salePrice: number) {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    isOnSale: true,
    salePrice
  });
}

export async function updateListingPrice(listingId: string, newPrice: number) {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    price: newPrice,
    isOnSale: false, // Reset sale flag when price changes
    salePrice: null
  });
}

export async function deleteListingFromDb(listingId: string) {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    deleted: true
  });
}

export async function updateListingFields(
  listingId: string,
  updates: Partial<CarListingDetailsJson>
): Promise<void> {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, updates as any);
}

export async function getListingDetails(listingId: string): Promise<any | null> {
  const listingRef = doc(db, "listings", listingId);
  const snapshot = await getDoc(listingRef);
  if (snapshot.exists() && !snapshot.data().deleted) {
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  }
  return null;
}

const UNIQUE_VIEW_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Increments viewCount once per viewer per time window.
 * Viewer key is the logged-in uid when available; otherwise a browser-local anonymous key.
 */
export async function recordUniqueListingView(listingId: string, viewerUid?: string | null): Promise<void> {
  if (typeof window === "undefined") return;
  if (!listingId) return;

  const anonKey = getOrCreateAnonViewerId();
  const viewerKey = viewerUid || anonKey;
  const storageKey = `cardealz.viewed.${listingId}.${viewerKey}`;

  const lastRaw = window.localStorage.getItem(storageKey);
  const last = lastRaw ? Number(lastRaw) : 0;
  if (Number.isFinite(last) && last > 0 && Date.now() - last < UNIQUE_VIEW_WINDOW_MS) {
    return;
  }

  // Mark locally first to avoid double counts if user refreshes quickly.
  window.localStorage.setItem(storageKey, String(Date.now()));

  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    viewCount: increment(1),
    lastViewed: serverTimestamp(),
  } as any);
}

function getOrCreateAnonViewerId(): string {
  try {
    const key = "cardealz.anonViewerId";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id = `anon_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    return "anon";
  }
}
