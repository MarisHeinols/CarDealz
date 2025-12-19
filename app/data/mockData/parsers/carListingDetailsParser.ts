import type { CarListingDetailsJson, CarListingDetails } from "~/types/types";
import { isCondition } from "./guards/conditions";
import { isCarFeature } from "./guards/carFeature";

export function parseCarListingDetails(
  json: unknown
): CarListingDetails[] {
  if (!Array.isArray(json)) {
    throw new Error("Invalid listings data");
  }

  return json.map((l) => {
    const item = l as CarListingDetailsJson;

    if (!isCondition(item.condition)) {
      throw new Error(`Invalid condition: ${item.condition}`);
    }

    const features = Array.isArray(item.features)
      ? item.features.filter(isCarFeature)
      : [];

    return {
      ...item,
      condition: item.condition,
      features,
      lastViewed: new Date(item.lastViewed),
      createdAt: new Date(item.createdAt),
    };
  });
}