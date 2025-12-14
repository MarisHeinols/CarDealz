import type { CarListing, SortDir, SortKey } from "~/types/types";

export function matchesQuery(listing: CarListing, query: string) {
  if (!query) return true;

  const haystack = [
    listing.make,
    listing.model,
    listing.year,
    listing.mileage === 0 ? "new" : listing.mileage,
    listing.condition,
    listing.price,
    listing.color,
    listing.location,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function sortListings(
  data: CarListing[],
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
