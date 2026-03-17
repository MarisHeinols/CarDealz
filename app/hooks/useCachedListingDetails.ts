import { useEffect, useMemo, useState } from "react";
import { getListingDetails } from "~/services/listingsService";
import {
  cacheKeyListingDetails,
  getCache,
  isFresh,
  setCache,
} from "~/services/listingsCache";

type Result<T> = {
  listing: T | null;
  loading: boolean;
  refreshing: boolean;
  lastUpdatedAt: number | null;
};

const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

export function useCachedListingDetails<T = any>(
  listingId: string,
  ttlMs: number = DEFAULT_TTL_MS
): Result<T> {
  const key = useMemo(() => cacheKeyListingDetails(listingId), [listingId]);
  const cached = getCache<T>(key);

  const [listing, setListing] = useState<T | null>((cached?.value as T) ?? null);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(
    cached?.ts ?? null
  );

  useEffect(() => {
    const existing = getCache<T>(key);
    if (existing?.value) {
      setListing(existing.value);
      setLastUpdatedAt(existing.ts);
      setLoading(false);
    } else {
      setListing(null);
      setLoading(true);
    }

    if (isFresh(existing, ttlMs)) return;

    let cancelled = false;
    setRefreshing(true);
    getListingDetails(listingId)
      .then((data) => {
        if (cancelled) return;
        setListing(data as T);
        setCache(key, data);
        const updated = getCache<T>(key);
        setLastUpdatedAt(updated?.ts ?? Date.now());
      })
      .catch((err) => console.error(err))
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

  return { listing, loading, refreshing, lastUpdatedAt };
}

