import { httpsCallable } from "firebase/functions";
import { functions } from "~/firebase/functions";
import { doc, setDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";
import type { TierId } from "~/services/pricingService";

export async function startStripeCheckout(planId: Exclude<TierId, "individual_free">) {
  const call = httpsCallable(functions, "createCheckoutSession");
  const res = await call({ planId });
  const url = (res.data as any)?.url;
  if (!url || typeof url !== "string") throw new Error("Stripe checkout URL missing.");
  window.location.assign(url);
}

export async function selectFreeIndividualPlan(uid: string) {
  await setDoc(
    doc(db, "users", uid),
    {
      billing: {
        planId: "individual_free",
        status: "active",
        updatedAt: new Date().toISOString(),
      },
    },
    { merge: true }
  );
}
