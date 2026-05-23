// src/components/auth/SignInForm.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthStepShell } from "@/components/auth/shared/AuthStepShell";
import {
  AuthMethodDivider,
  AuthModeSwitch,
  RememberMeCheckbox,
} from "@/components/auth/shared/AuthPhoneStepParts";
import { PhoneNumberField } from "@/components/auth/shared/PhoneNumberField";
import { OTPStep } from "@/components/auth/shared/OTPStep";
import { GoogleSignInButton } from "@/components/auth/shared/GoogleSignInButton";
import { TermsCheckbox } from "@/components/auth/shared/TermsCheckbox";
import { authClient } from "@/lib/auth-client";
import { useGlobalLoaderStore } from "@/stores/global-loader-store";
import { useUIStore } from "@/stores/ui-store";
import { phoneSchema } from "@/lib/schemas/phone-schema";
import { buildE164PhoneNumber } from "@/lib/phone-utils";
import {
  canRequestSignInOtp,
  getCurrentUserRedirect,
  verifyPhoneOtpForSignIn,
} from "@/app/actions/auth-actions";
import type { SignInStep, PhoneFormData } from "@/types/auth.types";

interface SignInFormProps {
  isModal?: boolean;
}

function SignInFormContent({ isModal = false }: SignInFormProps) {
  const [step, setStep] = useState<SignInStep>("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isRememberMe, setIsRememberMe] = useState(true);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { show, hide } = useGlobalLoaderStore();
  const { setAuthMode } = useUIStore();

  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: { country: "MY", phone: "" },
  });

  const getFullPhoneNumber = () => {
    const data = getValues();
    return buildE164PhoneNumber(data.country, data.phone);
  };

  const onRequestOtp = async () => {
    if (!isTermsAccepted) {
      setTermsError("Please review and accept the Terms & Conditions before continuing.");
      return;
    }
    setTermsError(null);
    setError(null);
    setIsLoading(true);
    show("Sending OTP...", "Verifying your identity");
    const fullPhone = getFullPhoneNumber();

    try {
      const eligibility = await canRequestSignInOtp(fullPhone);
      if (!eligibility.success) {
        setError(eligibility.error || "Unable to continue sign in");
        hide();
        return;
      }

      const res = await authClient.phoneNumber.sendOtp({ phoneNumber: fullPhone });
      if (res.error) {
        setError(res.error.message || "Failed to send OTP");
        hide();
      } else {
        setStep("OTP");
        hide();
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
      hide();
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    setError(null);
    setIsLoading(true);
    show("Verifying...", "Signing you in");
    const fullPhone = getFullPhoneNumber();

    try {
      const res = await verifyPhoneOtpForSignIn(fullPhone, otp, isRememberMe);

      if (!res.success) {
        setError(res.error || "Invalid OTP");
        setIsLoading(false);
        hide();
        return;
      }

      await authClient.getSession();

      let destination = res.redirectTo || callbackUrl;

      if (destination === "/") {
        const sessionRedirect = await getCurrentUserRedirect();
        if (sessionRedirect.success && sessionRedirect.redirectTo) {
          destination = sessionRedirect.redirectTo;
        }
      }

      if (isModal) {
        if (destination !== "/") {
          window.location.href = destination;
        } else {
          window.location.reload();
        }
      } else {
        show("Success!", "Redirecting...");
        window.location.href = destination;
      }
    } catch {
      setError("Verification failed.");
      hide();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isTermsAccepted) {
      setTermsError("Please review and accept the Terms & Conditions before continuing.");
      return;
    }
    setTermsError(null);
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/api/auth/role-redirect",
    });
  };

  if (step === "OTP") {
    return (
      <OTPStep
        phoneNumber={getFullPhoneNumber()}
        value={otp}
        onChange={setOtp}
        onSubmit={onVerifyOtp}
        onBack={() => setStep("PHONE")}
        isLoading={isLoading}
        error={error}
        isModal={isModal}
      />
    );
  }

  return (
    <AuthStepShell title="Sign In" description="Sign in with your phone number." isModal={isModal}>
      <div className="space-y-5">
        <GoogleSignInButton onClick={handleGoogleSignIn} />

        <AuthMethodDivider />

        <form onSubmit={handleSubmit(onRequestOtp)}>
          <div className="space-y-4">
            <PhoneNumberField control={control} register={register} error={errors.phone} />

            <TermsCheckbox
              id="signin-terms"
              checked={isTermsAccepted}
              onCheckedChange={(checked) => {
                setIsTermsAccepted(checked);
                if (checked) {
                  setTermsError(null);
                }
              }}
              requiredError={termsError}
            />

            <RememberMeCheckbox
              id="signin-remember"
              checked={isRememberMe}
              onCheckedChange={setIsRememberMe}
            />

            {error && (
              <p className="text-destructive bg-destructive/10 rounded p-2 text-center text-sm">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Sending OTP..." : "Continue"}
            </Button>
          </div>
        </form>

        <AuthModeSwitch
          prompt="Don't have an account?"
          actionLabel="Sign Up"
          href="/signup"
          isModal={isModal}
          onModalSwitch={() => setAuthMode("signup")}
        />
      </div>
    </AuthStepShell>
  );
}

export default function SignInForm(props: SignInFormProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <SignInFormContent {...props} />
    </Suspense>
  );
}
