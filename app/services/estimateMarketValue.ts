import type { CarListingDetailsJson } from "~/types/types";

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
    condition,
    fuelType,
    transmission,
    drivetrain,
    horsepower,
    displacement,
    features,
    location,
    price,
  } = listing;

  const nowYear = new Date().getFullYear();
  const y = typeof year === "number" && Number.isFinite(year) ? year : nowYear;
  const ageYears = Math.max(0, nowYear - y);
  const km = typeof mileage === "number" && Number.isFinite(mileage) ? mileage : 0;

  // Baseline: if a price exists, anchor to it; otherwise use a conservative default.
  const anchor = typeof price === "number" && Number.isFinite(price) && price > 0 ? price : 22000;

  // Depreciation (very rough): ~12% per year, plus mileage penalty beyond 15k km/yr.
  const yearFactor = Math.pow(0.88, Math.min(ageYears, 20));
  const expectedKm = ageYears * 15000;
  const mileageOver = Math.max(0, km - expectedKm);
  const mileagePenalty = Math.min(0.35, mileageOver / 200000); // cap at -35%

  // Condition adjustment
  const cond = condition || "used";
  const conditionFactor =
    cond === "new" ? 1.06 : cond === "certified" ? 1.03 : 1.0;

  // Drivetrain adjustment
  const dt = drivetrain || "";
  const drivetrainFactor = dt === "awd" || dt === "4wd" ? 1.03 : 1.0;

  // Feature richness (small bump)
  const featureCount = Array.isArray(features) ? features.length : 0;
  const featureFactor = 1 + Math.min(0.04, featureCount * 0.002); // up to +4%

  // Powertrain nuance (tiny adjustment)
  const fuel = fuelType || "";
  const fuelFactor = fuel === "electric" ? 1.02 : fuel === "hybrid" ? 1.01 : 1.0;

  // Transmission nuance (tiny adjustment)
  const trans = transmission || "";
  const transFactor = trans === "manual" ? 0.99 : 1.0;

  // Performance proxy (tiny)
  const hp = typeof horsepower === "number" && Number.isFinite(horsepower) ? horsepower : 0;
  const perfFactor = hp >= 300 ? 1.01 : 1.0;

  // Engine displacement proxy (tiny)
  const disp =
    typeof displacement === "number" && Number.isFinite(displacement) ? displacement : 0;
  const dispFactor = disp >= 3000 ? 1.005 : 1.0;

  // Location is currently not used in the heuristic, but we mention it in the verdict.
  const computedMid =
    anchor *
    yearFactor *
    (1 - mileagePenalty) *
    conditionFactor *
    drivetrainFactor *
    featureFactor *
    fuelFactor *
    transFactor *
    perfFactor *
    dispFactor;

  const mid = clampMoney(computedMid);
  const spreadPct = 0.12; // +/-12% range
  const min = clampMoney(mid * (1 - spreadPct));
  const max = clampMoney(mid * (1 + spreadPct));

  const recommendedSellPrice = clampMoney(mid * 1.01);
  const dealRating = getDealRating(price, min, max);

  const verdict = buildVerdict({
    make,
    model,
    year: y,
    mileage: km,
    condition: cond,
    drivetrain: dt,
    location,
    featureCount,
    dealRating,
    mid,
    min,
    max,
    price,
  });

  return { min, max, recommendedSellPrice, verdict, dealRating };
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
  condition?: string;
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
      ? `Listing price is $${Math.round(input.price).toLocaleString()}.`
      : "No listing price was provided.";

  return `${name} (${input.year ?? "?"}, ${input.condition ?? "used"}, ${mileagePart}) ${locationPart} is estimated around $${input.mid.toLocaleString()} (range $${input.min.toLocaleString()}–$${input.max.toLocaleString()}). ${dealLine} ${dtPart}, and the ${featuresPart}. ${pricePart}`;
}
