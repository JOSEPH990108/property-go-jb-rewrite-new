"use client";

// src/components/auth/shared/OTPStep.tsx
// Reusable OTP verification step.
// Used by both SignInForm and SignUpForm to avoid duplicating the OTP UI.

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "flex flex-col flex-1 w-full items-center justify-center min-h-[500px]",
        !isModal && "lg:w-1/2 overflow-y-auto no-scrollbar"
      )}
    >
      <div className="w-full max-w-md mx-auto space-y-6 text-center px-4">
        <h1 className="text-2xl font-semibold">Verify Phone Number</h1>
        <p className="text-muted-foreground text-sm">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{phoneNumber}</span>
        </p>

        <div className="flex justify-center py-6">
          <InputOTP maxLength={6} value={value} onChange={onChange}>
            <InputOTPGroup>
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p className="text-destructive text-sm bg-destructive/10 p-2 rounded">
            {error}
          </p>
        )}

        <Button
          onClick={onSubmit}
          className="w-full"
          disabled={isLoading || value.length < 6}
        >
          {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
          {isLoading ? "Verifying..." : submitLabel}
        </Button>

        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
