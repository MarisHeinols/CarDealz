import type { CarListingSummary } from "~/types/types";

type CacheEntry<T> = {
  ts: number;
  value: T;
};

const memory = new Map<string, CacheEntry<any>>();

const LS_PREFIX = "cardealz.cache.";

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

// Helpful narrow types for the common cached shapes
export type CachedListings = CacheEntry<CarListingSummary[]>;

// (Listing details are cached as `any` because the Firestore shape is currently not strongly typed.)

