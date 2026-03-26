import { useCallback, useEffect, useMemo, useState } from "react";
import type { CarListingSummary } from "~/types/types";
import {
  cacheKeyAllListings,
  cacheKeyOwnerListings,
  getCache,
  getOrFetch,
  isFresh,
} from "~/services/listingsCache";
import { getAllListings, getListingsByOwner } from "~/services/listingsService";

type Result = {
  listings: CarListingSummary[];
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  error: string | null;
  refresh: () => Promise<void>;
};

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute: keeps UI fast but stays reasonably up-to-date

export function useAllListingsCached(ttlMs: number = DEFAULT_TTL_MS): Result {
  const cacheKey = useMemo(() => cacheKeyAllListings(), []);
  const fetcher = useCallback(() => getAllListings(), []);
  return useCachedListings(cacheKey, fetcher, ttlMs);
}

export function useOwnerListingsCached(
  userId: string | null | undefined,
  ttlMs: number = DEFAULT_TTL_MS
): Result {
  const cacheKey = useMemo(
    () => (userId ? cacheKeyOwnerListings(userId) : null),
    [userId]
  );
  const fetcher = useCallback(
    () => (userId ? getListingsByOwner(userId!) : Promise.resolve([])),
    [userId]
  );
  return useCachedListings(cacheKey, fetcher, ttlMs);
}

function useCachedListings(
  cacheKey: string | null,
  fetcher: () => Promise<CarListingSummary[]>,
  ttlMs: number
): Result {
  const [listings, setListings] = useState<CarListingSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cacheKey) {
      setListings([]);
      setLoading(false);
      setRefreshing(false);
      setLastUpdatedAt(null);
      setError(null);
      return;
    }

    const cached = getCache<CarListingSummary[]>(cacheKey);
    if (cached) {
      setListings(cached.value);
      setLastUpdatedAt(cached.ts);
      setLoading(false);
      
      // If fresh, we don't need to refresh
      if (isFresh(cached, ttlMs)) {
        setRefreshing(false);
        return;
      }
    }

    let cancelled = false;
    setRefreshing(true);
    
    // getOrFetch handles deduplication if multiple components call this simultaneously
    getOrFetch(cacheKey, fetcher, ttlMs)
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        const updated = getCache<CarListingSummary[]>(cacheKey);
        setLastUpdatedAt(updated?.ts ?? Date.now());
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(`Error fetching for ${cacheKey}:`, err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
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
  }, [cacheKey, ttlMs]); // fetcher removed from deps because it's either stable or we only care about cacheKey changes

  const refresh = async () => {
    if (!cacheKey) return;
    setRefreshing(true);
    try {
      const data = await fetcher();
      setListings(data);
      setError(null);
      setLastUpdatedAt(Date.now());
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setRefreshing(false);
    }
  };

  return { listings, loading, refreshing, lastUpdatedAt, error, refresh };
}

