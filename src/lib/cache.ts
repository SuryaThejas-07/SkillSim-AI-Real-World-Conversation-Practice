/**
 * Cache utility for localStorage-based caching
 * Caches character data, user progress, and other frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = "skillsim_cache_";
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB

const getCacheKey = (key: string): string => `${CACHE_PREFIX}${key}`;

const isExpired = (entry: CacheEntry<any>): boolean => {
  const now = Date.now();
  return now - entry.timestamp > entry.ttl;
};

const estimateSize = (obj: any): number => {
  return new Blob([JSON.stringify(obj)]).size;
};

const getCacheSize = (): number => {
  if (typeof localStorage === "undefined") return 0;
  let size = 0;
  for (let key in localStorage) {
    if (key.startsWith(CACHE_PREFIX)) {
      size += localStorage[key].length * 2; // UTF-16
    }
  }
  return size;
};

const pruneCache = () => {
  // Remove oldest entries if cache exceeds size limit
  if (typeof localStorage === "undefined") return;

  let size = getCacheSize();
  if (size > MAX_CACHE_SIZE) {
    const entries: [string, number][] = [];

    for (let key in localStorage) {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const entry = JSON.parse(localStorage[key]) as CacheEntry<any>;
          entries.push([key, entry.timestamp]);
        } catch {
          // Invalid entry, mark for deletion
          entries.push([key, 0]);
        }
      }
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1] - b[1]);

    // Remove oldest entries until size is acceptable
    for (const [key] of entries) {
      if (size <= MAX_CACHE_SIZE * 0.8) break; // Remove until 80% capacity
      localStorage.removeItem(key);
      size = getCacheSize();
    }
  }
};

export const cache = {
  // Set a value in cache
  set: <T>(key: string, value: T, ttl: number = DEFAULT_TTL) => {
    if (typeof localStorage === "undefined") return;

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    try {
      const cacheKey = getCacheKey(key);
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      pruneCache();
    } catch (err) {
      console.warn("Failed to set cache", err);
    }
  },

  // Get a value from cache
  get: <T>(key: string): T | null => {
    if (typeof localStorage === "undefined") return null;

    try {
      const cacheKey = getCacheKey(key);
      const stored = localStorage.getItem(cacheKey);

      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);

      if (isExpired(entry)) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (err) {
      console.warn("Failed to get cache", err);
      return null;
    }
  },

  // Remove a specific cache entry
  remove: (key: string) => {
    if (typeof localStorage === "undefined") return;
    const cacheKey = getCacheKey(key);
    localStorage.removeItem(cacheKey);
  },

  // Clear all cache
  clear: () => {
    if (typeof localStorage === "undefined") return;
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  },

  // Get cache info for debugging
  getInfo: () => ({
    size: getCacheSize(),
    maxSize: MAX_CACHE_SIZE,
    percentage: (getCacheSize() / MAX_CACHE_SIZE) * 100,
  }),

  // Set-if-not-exists pattern
  setIfMissing: <T>(key: string, value: T, ttl?: number) => {
    if (cache.get<T>(key) === null) {
      cache.set(key, value, ttl);
      return true;
    }
    return false;
  },
};
