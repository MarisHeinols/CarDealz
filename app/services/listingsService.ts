import { collection, getDocs, getDoc, query, where, doc, updateDoc, increment, serverTimestamp, limit, startAfter, orderBy, getCountFromServer, type DocumentSnapshot, type QueryConstraint } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { CarListingDetailsJson, CarListingSummary } from "~/types/types";

function normalizeCondition(cond: string): string {
  const map: Record<string, string> = {
    jauna: "new",
    mazlietota: "slightly_used",
    pirmas_iemaksas_auto: "first_payment",
    lietota: "used",
  };
  return map[cond] || cond;
}

// Helper to convert Firestore document data to our Summary type
export function mapListingToSummary(id: string, data: any): CarListingSummary {
  const firstImg = Array.isArray(data.images) ? data.images[0] : null;
  return {
    id,
    make: data.make || "",
    model: data.model || "",
    year: data.year || 0,
    mileage: data.mileage || 0,
    price: data.price || 0,
    conditionTier: normalizeCondition(data.conditionTier || "used"),
    location: data.location || "",
    color: data.color || "",
    marketRange: data.marketRange || { min: 0, max: 0 },
    thumbnailUrl: firstImg?.thumbnailUrl || firstImg?.url || data.thumbnailUrl || "",
    viewCount: data.viewCount || 0,
    leadCount: typeof data.leadCount === "number" ? data.leadCount : 0,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    isOnSale: data.isOnSale || false,
    salePrice: data.salePrice,
    status: data.status || "published",
    sellerId: data.sellerId || "",
    sellerName: data.seller?.name || "",
    isDealer: data.seller?.isDealer || false,
    isSold: data.isSold || false,
    soldAt: data.soldAt?.toDate ? data.soldAt.toDate().toISOString() : data.soldAt,
  } as CarListingSummary;
}

export async function getAllListings(): Promise<CarListingSummary[]> {
  const listingsRef = collection(db, "listings");
  const q = query(
    listingsRef,
    where("deleted", "==", false),
    where("isSold", "==", false),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  const results: CarListingSummary[] = [];
  snapshot.forEach(doc => {
    results.push(mapListingToSummary(doc.id, doc.data()));
  });
  return results;
}

export type PaginatedListingsResult = {
  listings: CarListingSummary[];
  lastVisible: DocumentSnapshot | null;
  totalCount: number;
};

export async function getPaginatedListings(
  pageSize: number,
  lastVisible?: DocumentSnapshot | null,
  filters?: Partial<CarListingSummary>,
  sortBy: string = "createdAt",
  sortDir: "asc" | "desc" = "desc"
): Promise<PaginatedListingsResult> {
  const listingsRef = collection(db, "listings");

  // We intentionally paginate by `createdAt` only.
  // Using additional `orderBy` fields (or ordering by other fields) with multiple `where` clauses
  // quickly requires composite indexes and breaks the UI with "query requires an index".
  // The UI already applies sorting on the current page client-side.
  const firestoreSortBy = "createdAt";
  const firestoreSortDir: "asc" | "desc" = "desc";

  const constraints: QueryConstraint[] = [
    where("deleted", "==", false),
    where("isSold", "==", false),
    where("status", "==", "published"),
    orderBy(firestoreSortBy, firestoreSortDir)
  ];

  if (filters?.make && filters.make !== "all") {
    constraints.push(where("make", "==", filters.make));
  }

  // Note: Firestore requires specific indexes for complex queries.
  // We keep the Firestore query simple to avoid index setup errors.

  const countQuery = query(listingsRef, ...constraints);
  const countSnapshot = await getCountFromServer(countQuery);
  const totalCount = countSnapshot.data().count;

  if (lastVisible) {
    constraints.push(startAfter(lastVisible));
  }
  constraints.push(limit(pageSize));

  const q = query(listingsRef, ...constraints);
  const snapshot = await getDocs(q);

  const listings: CarListingSummary[] = [];
  snapshot.forEach((doc) => {
    listings.push(mapListingToSummary(doc.id, doc.data()));
  });

  return {
    listings,
    lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    totalCount
  };
}

/**
 * Fetch all listings (including sold) for analytics/stats.
 * Filters out deleted listings.
 */
export async function getAllListingsForStats(): Promise<CarListingSummary[]> {
  const listingsRef = collection(db, "listings");
  const snapshot = await getDocs(listingsRef);
  const results: CarListingSummary[] = [];
  snapshot.forEach((d) => {
    const data = d.data();
    if (data.deleted !== true) {
      results.push(mapListingToSummary(d.id, data));
    }
  });
  return results;
}

export async function getListingsByOwner(
  userId: string,
  options: { includeSold?: boolean } = { includeSold: false }
): Promise<CarListingSummary[]> {
  const listingsRef = collection(db, "listings");
  // In Firebase, we can't easily compound != and == without an index and possibly logic issues.
  // Best to query by sellerId and filter out deleted locally.
  const q = query(listingsRef, where("sellerId", "==", userId));
  const snapshot = await getDocs(q);

  const results: CarListingSummary[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.deleted) {
      if (data.isSold) {
        if (!options.includeSold) return; // Hide from normal views

        // Check if sold > 12 months ago
        if (data.soldAt) {
          const soldDateMs = data.soldAt.toDate ? data.soldAt.toDate().getTime() : new Date(data.soldAt).getTime();
          const twelveMonthsMs = 12 * 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - soldDateMs > twelveMonthsMs) {
            // Asynchronously flag as deleted for next time
            deleteListingFromDb(doc.id).catch(console.error);
            return; // Skip adding to results
          }
        }
      }
      results.push(mapListingToSummary(doc.id, data));
    }
  });

  results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  return results;
}

export async function markAsSale(listingId: string, salePrice: number) {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    isOnSale: true,
    salePrice,
  });
}

export async function stopSale(listingId: string) {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    isOnSale: false,
    salePrice: null,
  });
}

export async function markListingAsSold(listingId: string, soldPrice: number) {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    isSold: true,
    soldAt: serverTimestamp(),
    soldPrice: soldPrice,
    isOnSale: false,
    salePrice: null
  });
}

export async function updateListingStatus(listingId: string, status: "draft" | "published" | "closed") {
  const listingRef = doc(db, "listings", listingId);
  await updateDoc(listingRef, {
    status: status
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
  if (!listingId || typeof listingId !== "string" || !listingId.trim()) {
    return null;
  }
  const listingRef = doc(db, "listings", listingId);
  const snapshot = await getDoc(listingRef);
  if (snapshot.exists() && !snapshot.data().deleted) {
    const data = snapshot.data();
    const result = {
      ...data,
      id: snapshot.id,
      conditionTier: normalizeCondition(data.conditionTier),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      soldAt: data.soldAt?.toDate ? data.soldAt.toDate().toISOString() : data.soldAt,
      marketRangeUpdatedAt: data.marketRangeUpdatedAt?.toDate
        ? data.marketRangeUpdatedAt.toDate().toISOString()
        : data.marketRangeUpdatedAt,
    };
    
    // Strip all undefined fields deeply to prevent React Router SSR 500 serialization crashes.
    return JSON.parse(JSON.stringify(result));
  }
  return null;
}

const UNIQUE_VIEW_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Increments viewCount once per viewer per time window using Cloud Function.
 * Works for both authenticated and anonymous users.
 */
export async function recordUniqueListingView(listingId: string, _viewerUid?: string | null): Promise<void> {
  if (typeof window === "undefined") return;
  if (!listingId) return;

  // Use localStorage to reduce duplicate calls within the same session
  const storageKey = `balticauto.viewed.${listingId}`;
  const lastRaw = window.localStorage.getItem(storageKey);
  const last = lastRaw ? Number(lastRaw) : 0;
  if (Number.isFinite(last) && last > 0 && Date.now() - last < UNIQUE_VIEW_WINDOW_MS) {
    return; // Already recorded recently in this browser
  }

  try {
    const functions = await import("~/firebase/functions");
    const { httpsCallable } = await import("firebase/functions");
    const recordView = httpsCallable(functions.functions, "recordListingView");
    await recordView({ listingId });
    window.localStorage.setItem(storageKey, String(Date.now()));
  } catch (err) {
    console.error("Failed to record listing view:", err);
  }
}
