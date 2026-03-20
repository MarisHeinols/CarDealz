import type { CarListingSummary, SortDir, SortKey } from "~/types/types";

export function matchesQuery(listing: CarListingSummary, query: string) {
  if (!query) return true;

  const haystack = [
    listing.make,
    listing.model,
    listing.year,
    listing.mileage === 0 ? "new" : listing.mileage,
    listing.conditionTier,
    listing.price,
    listing.color,
    listing.location,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function sortListings(
  data: CarListingSummary[],
  key: SortKey,
  dir: SortDir
) {
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];

    if (typeof av === "number" && typeof bv === "number") {
      return dir === "asc" ? av - bv : bv - av;
    }

    return dir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}
