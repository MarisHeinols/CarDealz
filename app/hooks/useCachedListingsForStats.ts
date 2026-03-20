import { useEffect, useMemo, useState } from "react";
import type { CarListingSummary } from "~/types/types";
import { getCache, isFresh, setCache, cacheKeyListingsAllForStats } from "~/services/listingsCache";
import { getAllListingsForStats } from "~/services/listingsService";

type Result = {
  listings: CarListingSummary[];
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
};

const DEFAULT_TTL_MS = 60 * 1000;

export function useAllListingsForStatsCached(ttlMs: number = DEFAULT_TTL_MS): Result {
  const cacheKey = useMemo(() => cacheKeyListingsAllForStats(), []);
  const cached = getCache<CarListingSummary[]>(cacheKey);
  const [listings, setListings] = useState<CarListingSummary[]>(cached?.value ?? []);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(cached?.ts ?? null);

  useEffect(() => {
    const existing = getCache<CarListingSummary[]>(cacheKey);
    if (existing?.value) {
      setListings(existing.value);
      setLastUpdatedAt(existing.ts);
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (isFresh(existing, ttlMs)) return;

    let cancelled = false;
    setRefreshing(true);
    getAllListingsForStats()
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        setCache(cacheKey, data);
        const updated = getCache<CarListingSummary[]>(cacheKey);
        setLastUpdatedAt(updated?.ts ?? Date.now());
      })
      .catch(console.error)
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

  return { listings, loading, refreshing, lastUpdatedAt };
}

