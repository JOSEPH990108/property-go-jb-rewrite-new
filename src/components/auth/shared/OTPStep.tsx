"use client";

// src/components/auth/shared/OTPStep.tsx
// Reusable OTP verification step.
// Used by both SignInForm and SignUpForm to avoid duplicating the OTP UI.

import { Loader2 } from "lucide-react";

import { AuthStepShell } from "@/components/auth/shared/AuthStepShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface OTPStepProps {
  /** The formatted phone number to display (e.g. +60123456789). */
  phoneNumber: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  backLabel?: string;
  submitLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  isModal?: boolean;
}

export function OTPStep({
  phoneNumber,
  value,
  onChange,
  onSubmit,
  onBack,
  backLabel = "Wrong number? Go back",
  submitLabel = "Verify & Sign In",
  isLoading = false,
  error,
  isModal = false,
}: OTPStepProps) {
  return (
    <AuthStepShell
      title="Verify Phone Number"
      description={
        <>
          Enter the 6-digit code sent to{" "}
          <span className="text-foreground font-medium">{phoneNumber}</span>
        </>
      }
      isModal={isModal}
      variant="centered"
    >
      <div className="space-y-6 text-center">
        <div className="flex justify-center py-6">
          <InputOTP maxLength={6} value={value} onChange={onChange}>
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-destructive bg-destructive/10 rounded p-2 text-sm">{error}</p>}

        <Button onClick={onSubmit} className="w-full" disabled={isLoading || value.length < 6}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Verifying..." : submitLabel}
        </Button>

        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm underline"
        >
          {backLabel}
        </button>
      </div>
    </AuthStepShell>
  );
}
