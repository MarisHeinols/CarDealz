import { useMemo, useState } from "react";
import type { CarListingSummary, ListingsFiltersState, SortKey, SortDir } from "~/types/types";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  const [internalSortKey, setInternalSortKey] = useState<SortKey>("year");
  const [internalSortDir, setInternalSortDir] = useState<SortDir>("desc");
  
  const sortKey = options?.sortKey ?? internalSortKey;
  const sortDir = options?.sortDir ?? internalSortDir;
  
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((l) => {
      // 🔍 search
      const rawSearch = (filters.search || "").toLowerCase().trim();
      const searchTokens = rawSearch ? rawSearch.split(/\s+/) : [];

      const colorTranslated = l.color
        ? t(`carValues.color_${l.color}`, { defaultValue: String(l.color) })
        : "";
      const conditionTranslated = l.conditionTier
        ? t(`carValues.condition_${l.conditionTier}`, {
            defaultValue: String(l.conditionTier),
          })
        : "";

      const searchableText = [
        l.make,
        l.model,
        l.year,
        l.color,
        colorTranslated,
        l.conditionTier,
        conditionTranslated,
        l.location,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch =
        searchTokens.length === 0 ||
        searchTokens.every((token) =>
          searchableText.includes(token)
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
  }, [data, filters, t, i18n.language]);

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

  const suggestedRows = useMemo(() => {
    if (sorted.length > 0) return [] as CarListingSummary[];
    if (!data.length) return [] as CarListingSummary[];

    const hasAnyFilter = Boolean(
      (filters.search || "").trim() ||
        (filters.brand && filters.brand !== "all") ||
        (filters.model || "").trim() ||
        (filters.year && filters.year !== "all") ||
        (filters.conditionTier && filters.conditionTier !== "all") ||
        (filters.color && filters.color !== "all") ||
        (filters.priceFrom || "").trim() ||
        (filters.priceTo || "").trim() ||
        (filters.mileageFrom || "").trim() ||
        (filters.mileageTo || "").trim() ||
        (filters.country && filters.country !== "all") ||
        (filters.city || "").trim(),
    );
    if (!hasAnyFilter) return [] as CarListingSummary[];

    const targetYear =
      filters.year && filters.year !== "all" ? Number(filters.year) : null;
    const minPrice = (filters.priceFrom || "").trim()
      ? Number(filters.priceFrom)
      : null;
    const maxPrice = (filters.priceTo || "").trim() ? Number(filters.priceTo) : null;
    const targetPrice =
      minPrice !== null && maxPrice !== null
        ? (minPrice + maxPrice) / 2
        : minPrice ?? maxPrice ?? null;

    const scored = data
      .map((l) => {
        let score = 0;

        if (filters.color && filters.color !== "all" && l.color === filters.color) {
          score += 8;
        }

        if (
          filters.conditionTier &&
          filters.conditionTier !== "all" &&
          l.conditionTier === filters.conditionTier
        ) {
          score += 6;
        }

        if (filters.brand && filters.brand !== "all") {
          if (String(l.make).toLowerCase() === String(filters.brand).toLowerCase()) {
            score += 7;
          }
        }

        if ((filters.model || "").trim()) {
          if (String(l.model).toLowerCase().includes(String(filters.model).trim().toLowerCase())) {
            score += 5;
          }
        }

        if (targetYear !== null && Number.isFinite(targetYear)) {
          const diff = Math.abs(Number(l.year) - targetYear);
          score += Math.max(0, 6 - diff);
        }

        if (targetPrice !== null && Number.isFinite(targetPrice)) {
          const diff = Math.abs(Number(l.price) - targetPrice);
          const normalized = Math.min(diff / 5000, 10);
          score += Math.max(0, 5 - normalized);
        }

        // Small boost for matching translated search tokens (helps for localized words like colors)
        const rawSearch = (filters.search || "").toLowerCase().trim();
        if (rawSearch) {
          const tokens = rawSearch.split(/\s+/).filter(Boolean);
          const colorTranslated = l.color
            ? t(`carValues.color_${l.color}`, { defaultValue: String(l.color) })
            : "";
          const conditionTranslated = l.conditionTier
            ? t(`carValues.condition_${l.conditionTier}`, {
                defaultValue: String(l.conditionTier),
              })
            : "";
          const hay = [
            l.make,
            l.model,
            l.year,
            l.color,
            colorTranslated,
            l.conditionTier,
            conditionTranslated,
            l.location,
          ]
            .join(" ")
            .toLowerCase();
          const matches = tokens.reduce((acc, tok) => acc + (hay.includes(tok) ? 1 : 0), 0);
          score += Math.min(matches, 4);
        }

        return { l, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.l);

    return scored.slice(0, PAGE_SIZE);
  }, [data, filters, sorted.length, t, i18n.language]);

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
    suggestedRows,
    total: sorted.length,
    page,
    pageCount,
    sortKey,
    sortDir,
    setPage,
    toggleSort,
  };
}
