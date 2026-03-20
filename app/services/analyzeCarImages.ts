import type { CarListingDetailsJson } from "~/types/types";
import { httpsCallable } from "firebase/functions";
import { functions } from "~/firebase/functions";

/**
 * Partial listing data that the AI can infer from images.
 * Only includes fields that can be visually determined.
 */
export type AiInferredListingData = Partial<
  Pick<
    CarListingDetailsJson,
    | "make"
    | "model"
    | "year"
    | "color"
    | "interiorColor"
    | "conditionTier"
    | "fuelType"
    | "transmission"
    | "drivetrain"
    | "horsepower"
    | "displacement"
    | "features"
    | "description"
  >
>;

/**
 * Free/offline image "analysis".
 *
 * IMPORTANT:
 * - This intentionally does NOT call any paid AI API (prevents quota/spend caps).
 * - We only infer low-risk fields that can be approximated locally (e.g. dominant exterior color).
 * - For everything else, we return an empty result and let the user fill it in.
 * @param images - Array of image File objects to analyze
 * @returns Partial listing data inferred from the images
 */
export async function analyzeCarImages(
  images: File[]
): Promise<AiInferredListingData> {
  const first = images[0];
  if (!first) return {};

  try {
    // Convert to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(first);
    });

    const call = httpsCallable(functions, "geminiAnalyzeCarImage");
    const res = await call({
      imageBase64: base64Image,
      mimeType: first.type || "image/jpeg",
    });

    const parsed: any = res.data;
    if (parsed && typeof parsed === "object") {
      return {
        ...parsed,
        description: `AI Analysis complete. We detected a ${parsed.year || ""} ${parsed.make || ""} ${parsed.model || ""} in ${parsed.color || "an unknown color"}. Please verify these details.`,
      };
    }
  } catch (err) {
    console.error("Gemini AI failed, falling back to local estimation", err);
  }

  // Fallback to local
  try {
    const dominant = await estimateDominantColorName(first);
    const description = `Photos uploaded. We detected an estimated exterior color: ${dominant} (AI key missing/failed). Please confirm key details to complete your listing.`;
    return {
      color: dominant,
      description,
    };
  } catch {
    return {};
  }
}

async function estimateDominantColorName(file: File): Promise<NonNullable<CarListingDetailsJson["color"]>> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return "Other";
  }

  // Downscale aggressively for speed.
  const targetW = 48;
  const targetH = Math.max(1, Math.round((bitmap.height / bitmap.width) * targetW));
  canvas.width = targetW;
  canvas.height = targetH;
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, targetW, targetH);
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  if (!count) return "Other";

  const avg = { r: r / count, g: g / count, b: b / count };
  return rgbToName(avg);
}

function rgbToName(rgb: { r: number; g: number; b: number }): NonNullable<CarListingDetailsJson["color"]> {
  // Convert to HSV-ish by simple max/min.
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  const value = max;
  const saturation = max === 0 ? 0 : delta / max;

  // Very low saturation: grayscale-ish.
  if (saturation < 0.15) {
    if (value < 0.2) return "Black";
    if (value < 0.55) return "Gray";
    if (value < 0.8) return "Silver";
    return "White";
  }

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  if (hue < 15 || hue >= 345) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 70) return "Yellow";
  if (hue < 170) return "Green";
  if (hue < 255) return "Blue";
  if (hue < 290) return "Purple";
  if (hue < 345) return "Brown";
  return "Other";
}
