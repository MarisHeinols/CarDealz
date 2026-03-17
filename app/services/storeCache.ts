import { getCache, isFresh, setCache } from "~/services/listingsCache";

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function cacheKeyStoreUidByHandle(handle: string) {
  return `store.uidByHandle.${handle}`;
}

export function cacheKeyUserProfile(uid: string) {
  return `user.profile.${uid}`;
}

export function cacheKeyStoreSettings(uid: string) {
  return `store.settings.${uid}`;
}

export function getFreshCachedValue<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
  const entry = getCache<T>(key);
  if (!entry) return null;
  return isFresh(entry, ttlMs) ? entry.value : null;
}

export function getAnyCachedValue<T>(key: string): T | null {
  const entry = getCache<T>(key);
  return entry?.value ?? null;
}

export function setCachedValue<T>(key: string, value: T): void {
  setCache(key, value);
}

