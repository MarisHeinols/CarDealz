import { useEffect, useMemo, useState } from "react";
import type { CarListingSummary } from "~/types/types";
import { getCache, isFresh, getOrFetch, cacheKeyListingsAllForStats } from "~/services/listingsCache";
import { getAllListingsForStats } from "~/services/listingsService";

type Result = {
  listings: CarListingSummary[];
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  error: string | null;
};

const DEFAULT_TTL_MS = 60 * 1000;

export function useAllListingsForStatsCached(ttlMs: number = DEFAULT_TTL_MS): Result {
  const cacheKey = useMemo(() => cacheKeyListingsAllForStats(), []);
  const [listings, setListings] = useState<CarListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getCache<CarListingSummary[]>(cacheKey);
    if (existing?.value) {
      setListings(existing.value);
      setLastUpdatedAt(existing.ts);
      setLoading(false);
      if (isFresh(existing, ttlMs)) return;
    }

    let cancelled = false;
    setRefreshing(true);
    getOrFetch(cacheKey, () => getAllListingsForStats(), ttlMs)
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        const updated = getCache<CarListingSummary[]>(cacheKey);
        setLastUpdatedAt(updated?.ts ?? Date.now());
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, ttlMs]);

  return { listings, loading, refreshing, lastUpdatedAt, error };
}

