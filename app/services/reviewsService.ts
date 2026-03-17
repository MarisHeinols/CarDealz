import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { StoreReview } from "~/types/types";

function tsToIso(v: any): string {
  if (!v) return new Date(0).toISOString();
  if (typeof v === "string") return v;
  const t = v as Timestamp;
  // Firestore Timestamp has toDate()
  if (typeof (t as any).toDate === "function") return (t as any).toDate().toISOString();
  return new Date(0).toISOString();
}

export function storeReviewDocId(storeUid: string, reviewerUid: string): string {
  return `${storeUid}_${reviewerUid}`;
}

export async function getStoreReviews(storeUid: string): Promise<StoreReview[]> {
  const ref = collection(db, "storeReviews");
  // Avoid needing a composite index (storeUid + createdAt) by sorting client-side.
  const q = query(ref, where("storeUid", "==", storeUid));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      storeUid: String(data.storeUid || storeUid),
      reviewerUid: String(data.reviewerUid || ""),
      reviewerName: String(data.reviewerName || "User"),
      rating: Number(data.rating || 0),
      text: String(data.text || ""),
      createdAt: tsToIso(data.createdAt),
      updatedAt: data.updatedAt ? tsToIso(data.updatedAt) : undefined,
    } satisfies StoreReview;
  });
  items.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return items;
}

export async function getMyStoreReview(
  storeUid: string,
  reviewerUid: string
): Promise<StoreReview | null> {
  const id = storeReviewDocId(storeUid, reviewerUid);
  const snap = await getDoc(doc(db, "storeReviews", id));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    storeUid: String(data.storeUid || storeUid),
    reviewerUid: String(data.reviewerUid || reviewerUid),
    reviewerName: String(data.reviewerName || "User"),
    rating: Number(data.rating || 0),
    text: String(data.text || ""),
    createdAt: tsToIso(data.createdAt),
    updatedAt: data.updatedAt ? tsToIso(data.updatedAt) : undefined,
  };
}

export async function upsertStoreReview(input: {
  storeUid: string;
  reviewerUid: string;
  reviewerName: string;
  rating: number;
  text: string;
}): Promise<void> {
  const id = storeReviewDocId(input.storeUid, input.reviewerUid);
  const ref = doc(db, "storeReviews", id);
  const existing = await getDoc(ref);

  const payload = {
    storeUid: input.storeUid,
    reviewerUid: input.reviewerUid,
    reviewerName: input.reviewerName,
    rating: input.rating,
    text: input.text,
    ...(existing.exists()
      ? { updatedAt: serverTimestamp() }
      : { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
  };

  await setDoc(ref, payload, { merge: true });
}

