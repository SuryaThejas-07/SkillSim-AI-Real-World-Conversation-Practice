/**
 * useAPIOptimization - React hook for efficient API usage
 * Handles request deduplication, caching, and rate limiting
 */

import { useRef, useCallback } from "react";

interface APIRequest {
  key: string;
  timestamp: number;
  result?: any;
  error?: Error;
}

export const useAPIOptimization = () => {
  const requestCacheRef = useRef<Map<string, APIRequest>>(new Map());
  const pendingRequestsRef = useRef<Map<string, Promise<any>>>(new Map());
  const lastCallTimeRef = useRef<number>(0);

  /**
   * Request deduplication - avoid duplicate concurrent API calls
   * If same request is pending, return the same promise
   */
  const dedupedAPICall = useCallback(
    async <T,>(
      key: string,
      apiFunction: () => Promise<T>,
      cacheDurationMs: number = 60000 // Default 1 minute cache
    ): Promise<T> => {
      // Check if request is already pending
      if (pendingRequestsRef.current.has(key)) {
        return pendingRequestsRef.current.get(key)!;
      }

      // Check if cached and still valid
      const cached = requestCacheRef.current.get(key);
      if (
        cached &&
        Date.now() - cached.timestamp < cacheDurationMs &&
        cached.result
      ) {
        return cached.result;
      }

      // Execute API call
      const promise = apiFunction()
        .then((result) => {
          requestCacheRef.current.set(key, {
            key,
            timestamp: Date.now(),
            result,
          });
          pendingRequestsRef.current.delete(key);
          return result;
        })
        .catch((error) => {
          requestCacheRef.current.set(key, {
            key,
            timestamp: Date.now(),
            error,
          });
          pendingRequestsRef.current.delete(key);
          throw error;
        });

      pendingRequestsRef.current.set(key, promise);
      return promise;
    },
    []
  );

  /**
   * Rate limiting - ensure minimum delay between API calls
   */
  const rateLimitedAPICall = useCallback(
    async <T,>(
      key: string,
      apiFunction: () => Promise<T>,
      minDelayMs: number = 500
    ): Promise<T> => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      if (timeSinceLastCall < minDelayMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, minDelayMs - timeSinceLastCall)
        );
      }

      lastCallTimeRef.current = Date.now();
      return dedupedAPICall(key, apiFunction);
    },
    [dedupedAPICall]
  );

  /**
   * Clear cache entry
   */
  const clearCache = useCallback((key?: string) => {
    if (key) {
      requestCacheRef.current.delete(key);
    } else {
      requestCacheRef.current.clear();
    }
  }, []);

  /**
   * Get cache stats (for debugging)
   */
  const getCacheStats = useCallback(() => {
    return {
      cachedRequests: requestCacheRef.current.size,
      pendingRequests: pendingRequestsRef.current.size,
    };
  }, []);

  return {
    dedupedAPICall,
    rateLimitedAPICall,
    clearCache,
    getCacheStats,
  };
};
