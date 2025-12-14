import type { CarListing, CarListingJson } from "~/types/types";

const CONDITIONS = ["new", "used", "certified"] as const;

function isCondition(
  value: string
): value is CarListing["condition"] {
  return CONDITIONS.includes(value as any);
}

export function parseCarListings(
  data: CarListingJson[]
): CarListing[] {
  return data.map((l) => {
    if (!isCondition(l.condition)) {
      throw new Error(`Invalid condition: ${l.condition}`);
    }

    return {
      ...l,
      condition: l.condition,
      lastViewed: new Date(l.lastViewed),
    };
  });
}