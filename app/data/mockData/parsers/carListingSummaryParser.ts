import type {CarListingJson, CarListingSummary } from "~/types/types";
import { isCondition } from "./guards/conditions";

export function parseCarListings(
  data: CarListingJson[]
): CarListingSummary[] {
  return data.map((l) => {
    if (!isCondition(l.condition)) {
      throw new Error(`Invalid condition: ${l.condition}`);
    }

    return {
      ...l,
      condition: l.condition,
      thumbnailUrl: l.thumbnailUrl,
    };
  });
}