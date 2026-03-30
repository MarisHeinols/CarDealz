import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { cacheKeyStoreUidByHandle, getAnyCachedValue, setCachedValue } from "~/services/storeCache";

const PUBLIC_USERS_COLLECTION = "publicUsers";

export async function resolveStoreUidByHandle(handleOrUid: string): Promise<string | null> {
  const h = (handleOrUid || "").trim();
  if (!h) return null;

  const normalized = h.toLowerCase();

  // Backwards compatibility: if someone passes a UID, we can just use it.
  // Firebase Auth UIDs are typically 28+ chars; this is a heuristic.
  // IMPORTANT: store handles can also be long. Only treat as UID when it's alphanumeric-only.
  if (/^[A-Za-z0-9]{20,}$/.test(h)) {
    return h;
  }

  const cached = getAnyCachedValue<string>(cacheKeyStoreUidByHandle(normalized));
  if (cached) return cached;

  try {
    const slugRef = doc(db, "businessNames", normalized);
    const slugSnap = await getDoc(slugRef);
    if (slugSnap.exists()) {
      const uid = slugSnap.data()?.uid;
      if (uid) {
        setCachedValue(cacheKeyStoreUidByHandle(normalized), uid);
        return uid;
      }
    }
  } catch (e) {
    console.warn("Handle resolution via businessNames failed, falling back to query", e);
  }

  // Fallback (for older accounts that might not have businessNames entry)
  // This might fail if rules are tightened, but it's a safety net.
  const usersRef = collection(db, PUBLIC_USERS_COLLECTION);

  // Firestore string equality is case-sensitive. Try both the raw and normalized handle.
  const handlesToTry = normalized === h ? [h] : [h, normalized];
  for (const candidate of handlesToTry) {
    const q = query(usersRef, where("storeHandle", "==", candidate));
    const snap = await getDocs(q);
    const first = snap.docs[0];
    if (first) {
      setCachedValue(cacheKeyStoreUidByHandle(normalized), first.id);
      return first.id;
    }
  }
  return null;
}

export async function getStoreHandleForUid(uid: string): Promise<string | null> {
  const ref = doc(db, PUBLIC_USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return typeof data.storeHandle === "string" && data.storeHandle.trim()
    ? data.storeHandle.trim()
    : null;
}

