"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ServerQueryResult<T> {
  /** Resolved data (null until first successful fetch). */
  data: T | null;
  /** True while the initial or subsequent fetch is in-flight. */
  isLoading: boolean;
  /** Error message from the last failed fetch, if any. */
  error: string | null;
  /** Re-run the query manually (e.g. after a mutation). */
  refetch: () => void;
}

/**
 * Eliminates the `useState(data) + useState(loading) + useEffect(fetch)` pattern
 * for server action data-fetching.
 *
 * Automatically fetches on mount and exposes `refetch` for manual re-fetching.
 *
 * @example
 * const { data: stats, isLoading } = useServerQuery(getReferralStats);
 *
 * // With args — wrap in useCallback to keep reference stable:
 * const fetcher = useCallback(() => listRecords(tableName, page), [tableName, page]);
 * const { data, isLoading, refetch } = useServerQuery(fetcher);
 */
export function useServerQuery<T>(
  action: () => Promise<{ success: boolean; data?: T; error?: string }>,
): ServerQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await action();
      if (!mountedRef.current) return;
      if (res.success && res.data !== undefined) {
        setData(res.data);
      } else {
        setError(res.error || "Something went wrong");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [action]);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
    };
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
}
