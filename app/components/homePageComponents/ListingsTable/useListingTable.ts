import { useMemo, useState } from "react";
import type { CarListingSummary, ListingsFiltersState, SortKey, SortDir } from "~/types/types";

export const defaultFilters: ListingsFiltersState = {
  search: "",
  brand: "all",
  year: "all",
  conditionTier: "all",
  color: "all",
  priceFrom: "",
  priceTo: "",
  mileageFrom: "",
  mileageTo: "",
  country: "all",
  city: "",
  model: ""
};

// Removed local SortKey/SortDir types in favor of global ones in ~/types/types

const PAGE_SIZE = 10;

export function useListingsTable(
  data: CarListingSummary[],
  filters: ListingsFiltersState,
  options?: {
    sortKey: SortKey;
    sortDir: SortDir;
    onSort: (key: SortKey, dir: SortDir) => void;
  }
) {
  const [internalSortKey, setInternalSortKey] = useState<SortKey>("year");
  const [internalSortDir, setInternalSortDir] = useState<SortDir>("desc");
  
  const sortKey = options?.sortKey ?? internalSortKey;
  const sortDir = options?.sortDir ?? internalSortDir;
  
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((l) => {
      // 🔍 search
      const searchTokens = filters.search
        .toLowerCase()
        .trim()
        .split(/\s+/);

      const searchMatch =
        searchTokens.length === 0 ||
        searchTokens.every((token) =>
          [
            l.make,
            l.model,
            l.year,
            l.color,
            l.conditionTier,
            l.location,
          ]
            .join(" ")
            .toLowerCase()
            .includes(token)
        );
      if (!searchMatch) return false;

      if (
        filters.brand &&
        filters.brand.toLowerCase() !== "all" &&
        l.make.toLowerCase() !== filters.brand.toLowerCase()
      )
        return false;

      if (
        filters.model &&
        filters.model.trim() !== "all" &&
        filters.model.trim() !== "" &&
        l.model.toLowerCase() !== filters.model.trim().toLowerCase()
      )
        return false;

      if (filters.year !== "all" && l.year !== Number(filters.year))
        return false;

      if (
        filters.conditionTier !== "all" &&
        l.conditionTier !== filters.conditionTier
      )
        return false;

      if (filters.color !== "all" && l.color !== filters.color)
        return false;

      if (filters.priceFrom && l.price < Number(filters.priceFrom))
        return false;

      if (filters.priceTo && l.price > Number(filters.priceTo))
        return false;

      if (
        filters.mileageFrom &&
        l.mileage < Number(filters.mileageFrom)
      )
        return false;

      if (
        filters.mileageTo &&
        l.mileage > Number(filters.mileageTo)
      )
        return false;

      // Country filter: location is stored as "City, Country"
      if (filters.country && filters.country !== "all") {
        const locationLower = (l.location || "").toLowerCase();
        const countryLower = filters.country.toLowerCase();
        if (!locationLower.includes(countryLower)) return false;
      }

      // City filter
      if (filters.city) {
        const locationLower = (l.location || "").toLowerCase();
        const cityLower = filters.city.toLowerCase();
        if (!locationLower.includes(cityLower)) return false;
      }

      return true;
    });
  }, [data, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }

      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  function toggleSort(key: SortKey) {
    setPage(1);
    const newDir = key === sortKey && sortDir === "asc" ? "desc" : "asc";
    
    if (options?.onSort) {
      options.onSort(key, newDir);
    } else {
      setInternalSortKey(key);
      setInternalSortDir(newDir);
    }
  }

  return {
    rows,
    total: sorted.length,
    page,
    pageCount,
    sortKey,
    sortDir,
    setPage,
    toggleSort,
  };
}
