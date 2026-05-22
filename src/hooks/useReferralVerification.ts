"use client";

import { useState, useCallback, useRef } from "react";
import { verifyReferralCode } from "@/app/actions/referral-actions";
import type { ReferralStatus } from "@/types/auth.types";

/**
 * Encapsulates the referral code verification flow used across
 * SignUpForm, OnboardingModal, and ReferralCodeCard.
 *
 * @example
 * const { verify, status, verifiedCode, isLoading, reset } = useReferralVerification();
 * <ReferralCodeInput status={status} onApply={() => verify(code)} isLoading={isLoading} />
 */
export function useReferralVerification() {
  const [status, setStatus] = useState<ReferralStatus | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastVerified = useRef<string | null>(null);

  const verify = useCallback(async (code: string) => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await verifyReferralCode(code);
      if (res.valid) {
        setStatus({ valid: true, message: `Referred by ${res.referrerName}` });
        setVerifiedCode(code);
        lastVerified.current = code;
      } else {
        setStatus({ valid: false, message: res.message || "Invalid code" });
        setVerifiedCode(null);
        lastVerified.current = null;
      }
    } catch {
      setStatus({ valid: false, message: "Error verifying code" });
      setVerifiedCode(null);
      lastVerified.current = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Call when the input value changes to clear stale status. */
  const handleInputChange = useCallback(
    (currentValue: string | undefined) => {
      if (lastVerified.current && currentValue !== lastVerified.current) {
        setStatus(null);
        setVerifiedCode(null);
        lastVerified.current = null;
      } else if (status && !currentValue) {
        setStatus(null);
      }
    },
    [status],
  );

  const reset = useCallback(() => {
    setStatus(null);
    setVerifiedCode(null);
    lastVerified.current = null;
  }, []);

  return { verify, status, verifiedCode, isLoading, handleInputChange, reset };
}
