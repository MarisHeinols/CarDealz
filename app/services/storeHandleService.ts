import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { cacheKeyStoreUidByHandle, getAnyCachedValue, setCachedValue } from "~/services/storeCache";

export async function resolveStoreUidByHandle(handleOrUid: string): Promise<string | null> {
  const h = (handleOrUid || "").trim();
  if (!h) return null;

  // Backwards compatibility: if someone passes a UID, we can just use it.
  // Firebase Auth UIDs are typically 28+ chars; this is a heuristic.
  if (h.length >= 20 && !h.includes("/")) {
    return h;
  }

  const cached = getAnyCachedValue<string>(cacheKeyStoreUidByHandle(h));
  if (cached) return cached;

  try {
    const slugRef = doc(db, "businessNames", h.toLowerCase());
    const slugSnap = await getDoc(slugRef);
    if (slugSnap.exists()) {
      const uid = slugSnap.data()?.uid;
      if (uid) {
        setCachedValue(cacheKeyStoreUidByHandle(h), uid);
        return uid;
      }
    }
  } catch (e) {
    console.warn("Handle resolution via businessNames failed, falling back to query", e);
  }

  // Fallback (for older accounts that might not have businessNames entry)
  // This might fail if rules are tightened, but it's a safety net.
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("storeHandle", "==", h));
  const snap = await getDocs(q);
  const first = snap.docs[0];
  if (!first) return null;
  setCachedValue(cacheKeyStoreUidByHandle(h), first.id);
  return first.id;
}

export async function getStoreHandleForUid(uid: string): Promise<string | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return typeof data.storeHandle === "string" && data.storeHandle.trim()
    ? data.storeHandle.trim()
    : null;
}

