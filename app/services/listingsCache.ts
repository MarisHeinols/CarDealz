import type { CarListingSummary } from "~/types/types";

type CacheEntry<T> = {
  ts: number;
  value: T;
};

const memory = new Map<string, CacheEntry<any>>();
const inflight = new Map<string, Promise<any>>();

const LS_PREFIX = "balticauto.cache.";

function now() {
  return Date.now();
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getCache<T>(key: string): CacheEntry<T> | null {
  const inMem = memory.get(key) as CacheEntry<T> | undefined;
  if (inMem) return inMem;

  const raw = typeof window !== "undefined" ? window.localStorage.getItem(LS_PREFIX + key) : null;
  const parsed = safeJsonParse<CacheEntry<T>>(raw);
  if (parsed && typeof parsed.ts === "number") {
    memory.set(key, parsed as CacheEntry<any>);
    return parsed;
  }
  return null;
}

export function setCache<T>(key: string, value: T): void {
  const entry: CacheEntry<T> = { ts: now(), value };
  memory.set(key, entry as CacheEntry<any>);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
    }
  } catch {
    // ignore storage quota / privacy errors
  }
}

export function invalidateCache(key: string): void {
  memory.delete(key);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_PREFIX + key);
    }
  } catch {}
}

/**
 * Executes a fetcher and deduplicates simultaneous requests for the same key.
 */
export async function getOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  maxAgeMs: number = 0
): Promise<T> {
  const existing = getCache<T>(key);
  if (isFresh(existing, maxAgeMs)) {
    return existing!.value;
  }

  const existingInflight = inflight.get(key);
  if (existingInflight) {
    return existingInflight;
  }

  const fetchPromise = fetcher().finally(() => {
    inflight.delete(key);
  });
  
  inflight.set(key, fetchPromise);
  
  const result = await fetchPromise;
  setCache(key, result);
  return result;
}

export function isFresh(entry: CacheEntry<any> | null, maxAgeMs: number): boolean {
  if (!entry) return false;
  return now() - entry.ts <= maxAgeMs;
}

export function cacheKeyAllListings() {
  return "listings.all";
}

export function cacheKeyOwnerListings(userId: string) {
  return `listings.owner.${userId}`;
}

export function cacheKeyListingDetails(listingId: string) {
  return `listing.details.${listingId}`;
}

export function cacheKeyListingsAllForStats() {
  return "listings.allForStats";
}

export function cacheKeyBusinessUsers() {
  return "businesses.all";
}

export function cacheKeyStoreSettings(uid: string) {
  return `store.settings.${uid}`;
}

export function cacheKeyStoreReviews(uid: string) {
  return `store.reviews.${uid}`;
}

// Helpful narrow types for the common cached shapes
export type CachedListings = CacheEntry<CarListingSummary[]>;

// (Listing details are cached as `any` because the Firestore shape is currently not strongly typed.)

