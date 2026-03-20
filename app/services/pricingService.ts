import { doc, getDoc } from "firebase/firestore";
import { db } from "~/firebase/fireStore";

export type TierId =
  | "individual_free"
  | "individual_plus"
  | "business_starter"
  | "business_starter_pro"
  | "business_scale"
  | "business_scale_pro";

export type BillingInterval = "month";

export type TierDefinition = {
  id: TierId;
  title: string;
  priceEur: number;
  interval: BillingInterval;
  listingLimit: number;
  adsFree: boolean;
  role: "individual" | "business";
  highlight?: boolean;
  descriptionLines: string[];
};

export type PricingConfig = {
  saleEnabled?: boolean;
  saleEndsAt?: string;
  tiers: TierDefinition[];
};

const DEFAULT_PRICING: PricingConfig = {
  tiers: [
    {
      id: "individual_free",
      title: "Individual (Free)",
      priceEur: 0,
      interval: "month",
      listingLimit: 3,
      adsFree: false,
      role: "individual",
      descriptionLines: [
        "3 listings/year included",
        "Max 10 listings/year (individual cap)",
        "Standard ads",
      ],
    },
    {
      id: "individual_plus",
      title: "Individual Plus",
      priceEur: 4.99,
      interval: "month",
      listingLimit: 10,
      adsFree: false,
      role: "individual",
      highlight: true,
      descriptionLines: [
        "Up to 10 listings/year",
        "Standard ads",
        "All data & customization features (while active)",
      ],
    },
    {
      id: "business_starter",
      title: "Business Starter",
      priceEur: 15,
      interval: "month",
      listingLimit: 10,
      adsFree: false,
      role: "business",
      descriptionLines: [
        "Up to 10 active listings",
        "Ads shown on profile",
        "All data & customization features",
      ],
    },
    {
      id: "business_starter_pro",
      title: "Business Starter Pro",
      priceEur: 20,
      interval: "month",
      listingLimit: 10,
      adsFree: true,
      role: "business",
      descriptionLines: [
        "Up to 10 active listings",
        "No ads on profile",
        "All data & customization features",
      ],
    },
    {
      id: "business_scale",
      title: "Business Scale",
      priceEur: 30,
      interval: "month",
      listingLimit: 150,
      adsFree: false,
      role: "business",
      descriptionLines: [
        "Up to 150 active listings",
        "Ads shown on profile",
        "All data & customization features",
      ],
    },
    {
      id: "business_scale_pro",
      title: "Business Scale Pro",
      priceEur: 35,
      interval: "month",
      listingLimit: 150,
      adsFree: true,
      role: "business",
      highlight: true,
      descriptionLines: [
        "Up to 150 active listings",
        "No ads on profile",
        "All data & customization features",
      ],
    },
  ],
};

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const snap = await getDoc(doc(db, "config", "pricing"));
    const data: any = snap.exists() ? snap.data() : null;
    if (data && Array.isArray(data.tiers)) {
      return {
        saleEnabled: Boolean(data.saleEnabled),
        saleEndsAt: typeof data.saleEndsAt === "string" ? data.saleEndsAt : undefined,
        tiers: data.tiers,
      } as PricingConfig;
    }
  } catch {
    // ignore and fall back
  }

  return DEFAULT_PRICING;
}
