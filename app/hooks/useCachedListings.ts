import { useEffect, useMemo, useState } from "react";
import type { CarListingSummary } from "~/types/types";
import {
  cacheKeyAllListings,
  cacheKeyOwnerListings,
  getCache,
  isFresh,
  setCache,
} from "~/services/listingsCache";
import { getAllListings, getListingsByOwner } from "~/services/listingsService";

type Result = {
  listings: CarListingSummary[];
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
};

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute: keeps UI fast but stays reasonably up-to-date

export function useAllListingsCached(ttlMs: number = DEFAULT_TTL_MS): Result {
  const cacheKey = useMemo(() => cacheKeyAllListings(), []);
  return useCachedListings(cacheKey, () => getAllListings(), ttlMs);
}

export function useOwnerListingsCached(
  userId: string | null | undefined,
  ttlMs: number = DEFAULT_TTL_MS
): Result {
  const cacheKey = useMemo(
    () => (userId ? cacheKeyOwnerListings(userId) : null),
    [userId]
  );
  return useCachedListings(
    cacheKey,
    () => (userId ? getListingsByOwner(userId) : Promise.resolve([])),
    ttlMs
  );
}

function useCachedListings(
  cacheKey: string | null,
  fetcher: () => Promise<CarListingSummary[]>,
  ttlMs: number
): Result {
  const cached = cacheKey ? getCache<CarListingSummary[]>(cacheKey) : null;
  const [listings, setListings] = useState<CarListingSummary[]>(
    cached?.value ?? []
  );
  const [loading, setLoading] = useState<boolean>(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(
    cached?.ts ?? null
  );

  useEffect(() => {
    if (!cacheKey) {
      setListings([]);
      setLoading(false);
      setRefreshing(false);
      setLastUpdatedAt(null);
      return;
    }

    const existing = getCache<CarListingSummary[]>(cacheKey);
    if (existing?.value) {
      setListings(existing.value);
      setLastUpdatedAt(existing.ts);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // If cache is fresh, skip immediate re-fetch.
    if (isFresh(existing, ttlMs)) return;

    let cancelled = false;
    setRefreshing(true);
    fetcher()
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        setCache(cacheKey, data);
        const updated = getCache<CarListingSummary[]>(cacheKey);
        setLastUpdatedAt(updated?.ts ?? Date.now());
      })
      .catch((err) => {
        // Non-fatal: keep cached data if any.
        console.error(err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ttlMs]);

  return { listings, loading, refreshing, lastUpdatedAt };
}

