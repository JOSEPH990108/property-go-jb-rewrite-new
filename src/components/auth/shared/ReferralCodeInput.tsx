"use client";

// src/components/auth/shared/ReferralCodeInput.tsx
// Reusable referral code input with inline Apply button and validation feedback.
// Used by SignUpForm (REFERRAL step) and OnboardingModal.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationStatus } from "@/components/shared/ValidationStatus";
import type { ReferralStatus } from "@/types/auth.types";

interface ReferralCodeInputProps {
  label?: string;
  /** react-hook-form or plain register result spread onto the input. */
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  /** Current value of the referral code field (to disable Apply when empty). */
  value?: string;
  onApply: () => void;
  isLoading?: boolean;
  status?: ReferralStatus | null;
  error?: string;
}

export function ReferralCodeInput({
  label = "Referral Code (Optional)",
  inputProps,
  value,
  onApply,
  isLoading = false,
  status,
  error,
}: ReferralCodeInputProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          {...inputProps}
          placeholder="Enter code"
          className={status?.valid ? "border-green-500 focus-visible:ring-green-500" : ""}
        />
        <Button type="button" variant="outline" onClick={onApply} disabled={isLoading || !value}>
          Apply
        </Button>
      </div>

      {status && <ValidationStatus valid={status.valid} message={status.message} />}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
