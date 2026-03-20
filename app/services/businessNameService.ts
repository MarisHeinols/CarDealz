import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { slugify } from "~/utils/slugify";

function normalizeBusinessName(name: string) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

/**
 * Reserve a business name to prevent duplicates.
 * Creates `businessNames/{slug}` with the owning uid.
 */
export async function reserveBusinessName(uid: string, businessName: string): Promise<string> {
  const normalized = normalizeBusinessName(businessName);
  const slug = slugify(normalized).toLowerCase();
  if (!slug) {
    throw new Error("Business name is required.");
  }

  const ref = doc(db, "businessNames", slug);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      throw new Error("Business name already exists. Please choose another name.");
    }
    tx.set(ref, {
      uid,
      name: normalized,
      createdAt: serverTimestamp(),
    });
  });

  return slug;
}

