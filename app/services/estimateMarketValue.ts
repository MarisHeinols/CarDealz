import type { CarListingDetailsJson } from "~/types/types";
import { httpsCallable } from "firebase/functions";
import { functions } from "~/firebase/functions";

export interface MarketValuationResult {
  min: number;
  max: number;
  recommendedSellPrice: number;
  verdict: string;
  dealRating: "good" | "fair" | "above_market";
}

/**
 * Free/offline market value estimator.
 *
 * IMPORTANT:
 * - This intentionally does NOT call any paid AI API (prevents quota/spend caps).
 * - The result is a heuristic estimate and should be treated as guidance only.
 */
export async function estimateMarketValue(
  listing: Partial<CarListingDetailsJson>
): Promise<MarketValuationResult> {
  const {
    make,
    model,
    year,
    mileage,
    conditionTier,
    fuelType,
    transmission,
    drivetrain,
    horsepower,
    displacement,
    features,
    location,
    price,
  } = listing;

  if (!make || !model) {
    throw new Error("AI Input error: Make and Model are required for AI estimate.");
  }

  try {
    const call = httpsCallable(functions, "geminiEstimateMarketValue");
    const res = await call({ listing });
    const parsed: any = res.data;

    const min = clampMoney(parsed.min);
    const max = clampMoney(parsed.max);
    const recommendedSellPrice = clampMoney(parsed.recommendedSellPrice);
    const dealRating = getDealRating(price, min, max);

    return {
      min,
      max,
      recommendedSellPrice,
      verdict: parsed.verdict || "AI analysis complete.",
      dealRating,
    };
  } catch (err) {
    console.warn("Gemini AI valuation failed:", err);
    throw new Error(`AI Valuation failed: ${err instanceof Error ? err.message : String(err)}`);
  }


}

function clampMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value / 50) * 50);
}

function getDealRating(
  price: unknown,
  min: number,
  max: number
): MarketValuationResult["dealRating"] {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return "fair";
  }
  if (price < min) return "good";
  if (price > max) return "above_market";
  return "fair";
}

function buildVerdict(input: {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  conditionTier?: string;
  drivetrain?: string;
  location?: string;
  featureCount: number;
  dealRating: MarketValuationResult["dealRating"];
  mid: number;
  min: number;
  max: number;
  price?: number;
}): string {
  const name =
    input.make && input.model
      ? `${input.make} ${input.model}`
      : "This vehicle";

  const mileagePart =
    typeof input.mileage === "number" && input.mileage > 0
      ? `${Math.round(input.mileage).toLocaleString()} km`
      : "unknown mileage";

  const dtPart =
    input.drivetrain === "awd" || input.drivetrain === "4wd"
      ? "AWD/4WD adds a small premium"
      : "drivetrain impact is minimal";

  const featuresPart =
    input.featureCount > 0
      ? `feature set (${input.featureCount} listed) slightly lifts the estimate`
      : "limited feature info keeps the estimate conservative";

  const locationPart = input.location ? `in ${input.location}` : "in your area";

  let dealLine = "This looks fairly priced against the estimate.";
  if (input.dealRating === "good") dealLine = "This looks like a good deal versus the estimate.";
  if (input.dealRating === "above_market")
    dealLine = "This appears priced above the estimated market range.";

  const pricePart =
    typeof input.price === "number" && input.price > 0
      ? `Listing price is €${Math.round(input.price).toLocaleString()}.`
      : "No listing price was provided.";

  return `${name} (${input.year ?? "?"}, ${input.conditionTier ?? "used"}, ${mileagePart}) ${locationPart} is estimated around €${input.mid.toLocaleString()} (range €${input.min.toLocaleString()}–€${input.max.toLocaleString()}). ${dealLine} ${dtPart}, and the ${featuresPart}. ${pricePart}`;
}
