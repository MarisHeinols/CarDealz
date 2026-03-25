import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import { httpsCallable } from "firebase/functions";
import { functions } from "~/firebase/functions";
import type {
  LeadDoc,
  LeadPreferredContactMethod,
  LeadStatus,
} from "~/types/types";

export type CreateLeadInput = {
  listingId: string;
  dealerId: string;

  buyerUid?: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  preferredContactMethod: LeadPreferredContactMethod;
  message: string;
};

function mapLeadDoc(id: string, data: any): LeadDoc {
  return {
    id,
    listingId: String(data.listingId || ""),
    dealerId: String(data.dealerId || ""),
    buyerUid: data.buyerUid ? String(data.buyerUid) : undefined,
    buyerName: String(data.buyerName || ""),
    buyerEmail: data.buyerEmail ? String(data.buyerEmail) : undefined,
    buyerPhone: data.buyerPhone ? String(data.buyerPhone) : undefined,
    preferredContactMethod: (data.preferredContactMethod || "email") as LeadPreferredContactMethod,
    message: String(data.message || ""),
    status: (data.status || "new") as LeadStatus,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : String(data.createdAt || ""),
  };
}

export async function createLead(input: CreateLeadInput): Promise<LeadDoc> {
  const call = httpsCallable(functions, "createLeadSecure");
  const res = await call({
    listingId: input.listingId,
    dealerId: input.dealerId,
    buyerUid: input.buyerUid || null,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail || null,
    buyerPhone: input.buyerPhone || null,
    preferredContactMethod: input.preferredContactMethod,
    message: input.message,
  });

  const data = (res.data || {}) as any;
  const leadId = String(data.leadId || "").trim();
  const createdAtIso = String(data.createdAtIso || "").trim();
  if (!leadId) {
    throw new Error("Lead creation failed.");
  }

  return {
    id: leadId,
    listingId: input.listingId,
    dealerId: input.dealerId,
    buyerUid: input.buyerUid,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    buyerPhone: input.buyerPhone,
    preferredContactMethod: input.preferredContactMethod,
    message: input.message,
    status: "new",
    createdAt: createdAtIso || new Date().toISOString(),
  };
}

export async function getLeadsByDealer(dealerId: string): Promise<LeadDoc[]> {
  const ref = collection(db, "leads");
  const q = query(ref, where("dealerId", "==", dealerId));
  const snap = await getDocs(q);
  const items: LeadDoc[] = [];
  snap.forEach((d) => items.push(mapLeadDoc(d.id, d.data())));

  // Sort client-side to avoid requiring composite indexes.
  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return items;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  const leadRef = doc(db, "leads", leadId);
  await setDoc(
    leadRef,
    {
      status,
      updatedAtIso: new Date().toISOString(),
    } as any,
    { merge: true }
  );
}

export async function getLeadsByListing(listingId: string): Promise<LeadDoc[]> {
  const ref = collection(db, "leads");
  const q = query(ref, where("listingId", "==", listingId));
  const snap = await getDocs(q);
  const items: LeadDoc[] = [];
  snap.forEach((d) => items.push(mapLeadDoc(d.id, d.data())));

  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return items;
}

export async function deleteLead(leadId: string, listingId?: string): Promise<void> {
  const leadRef = doc(db, "leads", leadId);
  await deleteDoc(leadRef);

  if (listingId) {
    try {
      await updateDoc(doc(db, "listings", listingId), {
        leadCount: increment(-1),
      } as any);
    } catch (e) {
      console.error("Failed to decrement leadCount", e);
    }
  }
}
