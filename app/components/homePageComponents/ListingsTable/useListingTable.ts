import { useMemo, useState } from "react";
import type { CarListingSummary, ListingsFiltersState  } from "~/types/types";

export const defaultFilters: ListingsFiltersState  = {
  search: "",
  brand: "all",
  year: "all",
  condition: "all",
  color: "all",
  priceFrom: "",
  priceTo: "",
  mileageFrom: "",
  mileageTo: "",
};

export type SortKey =
  | "make"
  | "model"
  | "year"
  | "mileage"
  | "price"
  | "condition"
  | "color"
  | "location";

export type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function useListingsTable(
  data: CarListingSummary[],
  filters: ListingsFiltersState 
) {
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
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
          l.condition,
          l.location,
        ]
          .join(" ")
          .toLowerCase()
          .includes(token)
      );
      if (!searchMatch) return false;

      if (filters.brand !== "all" && l.make !== filters.brand)
        return false;

      if (filters.year !== "all" && l.year !== Number(filters.year))
        return false;

      if (
        filters.condition !== "all" &&
        l.condition !== filters.condition
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
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
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
