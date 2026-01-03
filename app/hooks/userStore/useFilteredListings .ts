import { useMemo } from "react";
import type { CarListingSummary, ListingsFiltersState } from "~/types/types";

export const filterListings = (
  listings: CarListingSummary[],
  filters: ListingsFiltersState
) => {
  return listings.filter((l) => {
    /* Search */
    if (filters.search) {
      const keywords = filters.search
        .toLowerCase()
        .split(" ")
        .filter(Boolean);

      const searchable = `${l.make} ${l.model} ${l.color} ${l.location}`.toLowerCase();

      if (!keywords.every((k) => searchable.includes(k))) {
        return false;
      }
    }

    if (filters.brand !== "all" && l.make !== filters.brand) return false;
    if (filters.year !== "all" && String(l.year) !== filters.year) return false;
    if (
      filters.condition !== "all" &&
      l.condition !== filters.condition
    )
      return false;
    if (
      filters.color !== "all" &&
      l.color.toLowerCase() !== filters.color.toLowerCase()
    )
      return false;

    if (filters.priceFrom && l.price < +filters.priceFrom) return false;
    if (filters.priceTo && l.price > +filters.priceTo) return false;
    if (filters.mileageFrom && l.mileage < +filters.mileageFrom)
      return false;
    if (filters.mileageTo && l.mileage > +filters.mileageTo)
      return false;

    return true;
  });
};

export const useFilteredListings = (
  listings: CarListingSummary[],
  filters: ListingsFiltersState
) =>
  useMemo(() => filterListings(listings, filters), [listings, filters]);
