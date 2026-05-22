"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface AsyncActionOptions<T> {
  /** Toast message on success. Pass `false` to suppress. */
  successMessage?: string | false;
  /** Toast message on error. Pass `false` to suppress. */
  errorMessage?: string | false;
  /** Callback after a successful result. */
  onSuccess?: (data: T) => void;
  /** Callback after a failed result or caught error. */
  onError?: (error: string) => void;
}

/**
 * Eliminates the repeated `isLoading + try/catch + toast` pattern.
 *
 * Works with server actions that return `{ success, data?, error? }`.
 *
 * @example
 * const { execute, isLoading } = useAsyncAction(deleteUserAccount, {
 *   successMessage: "Account deleted",
 *   onSuccess: () => router.push("/"),
 * });
 */
export function useAsyncAction<TArgs extends unknown[], TData = unknown>(
  action: (...args: TArgs) => Promise<{ success: boolean; data?: TData; error?: string }>,
  options: AsyncActionOptions<TData> = {},
) {
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: TArgs) => {
      setIsLoading(true);
      try {
        const res = await action(...args);

        if (res.success) {
          if (options.successMessage !== false) {
            toast.success(options.successMessage ?? "Success");
          }
          options.onSuccess?.(res.data as TData);
          return res;
        }

        const errMsg = res.error || "Something went wrong";
        if (options.errorMessage !== false) {
          toast.error(options.errorMessage ?? errMsg);
        }
        options.onError?.(errMsg);
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred";
        if (options.errorMessage !== false) {
          toast.error(options.errorMessage ?? msg);
        }
        options.onError?.(msg);
        return { success: false as const, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action],
  );

  return { execute, isLoading };
}
