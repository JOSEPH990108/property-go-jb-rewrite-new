// src/components/auth/SignInForm.tsx
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/custom/ui/CountrySelector";
import { OTPStep } from "@/components/auth/shared/OTPStep";
import { GoogleSignInButton } from "@/components/auth/shared/GoogleSignInButton";
import { TermsCheckbox } from "@/components/auth/shared/TermsCheckbox";
import { authClient } from "@/lib/auth-client";
import { useGlobalLoaderStore } from "@/stores/global-loader-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
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
    <div
      className={cn(
        "flex w-full flex-1 flex-col",
        !isModal && "no-scrollbar overflow-y-auto lg:w-1/2",
      )}
    >
      <div className="mx-auto mb-5 w-full max-w-md px-4 sm:pt-10">
        {!isModal && (
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to main
          </Link>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-10">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">Sign In</h1>
          <p className="text-muted-foreground text-sm">Sign in with your phone number.</p>
        </div>

        <div className="space-y-5">
          <GoogleSignInButton onClick={handleGoogleSignIn} />

          <div className="text-muted-foreground relative py-2 text-center text-sm">
            <span className="bg-background relative z-10 px-2">Or with Phone</span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onRequestOtp)}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Phone Number*</Label>
                <div className="flex gap-2">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CountrySelect
                        className="h-11"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <Input
                    type="tel"
                    className="h-11 flex-1"
                    {...register("phone")}
                    placeholder="Phone Number"
                  />
                </div>
                {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
              </div>

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

              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="signin-remember"
                  checked={isRememberMe}
                  onCheckedChange={(checked) => setIsRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="signin-remember"
                  className="text-muted-foreground cursor-pointer text-sm font-normal"
                >
                  Keep me logged in
                </Label>
              </div>

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

          <div className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            {isModal ? (
              <button
                onClick={() => setAuthMode("signup")}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            ) : (
              <Link href="/signup" className="text-primary font-medium">
                Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
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
