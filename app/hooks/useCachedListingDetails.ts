import { useEffect, useMemo, useState } from "react";
import { getListingDetails } from "~/services/listingsService";
import {
  cacheKeyListingDetails,
  getCache,
  isFresh,
  getOrFetch,
} from "~/services/listingsCache";

type Result<T> = {
  listing: T | null;
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
  error: string | null;
};

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

export function useCachedListingDetails<T = any>(
  listingId: string,
  ttlMs: number = DEFAULT_TTL_MS
): Result<T> {
  const key = useMemo(() => cacheKeyListingDetails(listingId), [listingId]);
  const [listing, setListing] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getCache<T>(key);
    if (existing?.value) {
      setListing(existing.value as T);
      setLastUpdatedAt(existing.ts);
      setLoading(false);
      if (isFresh(existing, ttlMs)) return;
    }

    let cancelled = false;
    setRefreshing(true);
    getOrFetch(key, () => getListingDetails(listingId), ttlMs)
      .then((data) => {
        if (cancelled) return;
        setListing(data as T);
        const updated = getCache<T>(key);
        setLastUpdatedAt(updated?.ts ?? Date.now());
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load details");
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
  }, [key, listingId, ttlMs]);

  return { listing, loading, refreshing, lastUpdatedAt, error };
}

