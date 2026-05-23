// src/components/auth/SignUpForm.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthStepShell } from "@/components/auth/shared/AuthStepShell";
import { PhoneNumberField } from "@/components/auth/shared/PhoneNumberField";
import { OTPStep } from "@/components/auth/shared/OTPStep";
import { ReferralCodeInput } from "@/components/auth/shared/ReferralCodeInput";
import { GoogleSignInButton } from "@/components/auth/shared/GoogleSignInButton";
import { TermsCheckbox } from "@/components/auth/shared/TermsCheckbox";
import { authClient } from "@/lib/auth-client";
import { useGlobalLoaderStore } from "@/stores/global-loader-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { phoneSchema } from "@/lib/schemas/phone-schema";
import { buildE164PhoneNumber } from "@/lib/phone-utils";
import { useReferralVerification } from "@/hooks/useReferralVerification";
import { updateProfileAfterSignup, verifyPhoneOtp } from "@/app/actions/auth-actions";
import { verifyReferralCode } from "@/app/actions/referral-actions";
import type {
  SignUpStep,
  PhoneFormData,
  DetailsFormData,
  ReferralFormData,
} from "@/types/auth.types";

// --- Zod schemas ---

const detailsSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
});

const referralSchema = z.object({
  referralCode: z.string().optional(),
});

// ---

interface SignUpFormProps {
  isModal?: boolean;
}

function SignUpFormContent({ isModal = false }: SignUpFormProps) {
  const [step, setStep] = useState<SignUpStep>("PHONE");
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [isRememberMe, setIsRememberMe] = useState(true);
  const [tempName, setTempName] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { show, hide } = useGlobalLoaderStore();
  const { setAuthMode } = useUIStore();
  const referral = useReferralVerification();

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    control: controlPhone,
    getValues: getValuesPhone,
    formState: { errors: errorsPhone },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: { country: "MY", phone: "" },
  });

  const {
    register: registerDetails,
    handleSubmit: handleSubmitDetails,
    formState: { errors: errorsDetails },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    mode: "onChange",
    defaultValues: { name: "" },
  });

  const {
    register: registerReferral,
    handleSubmit: handleSubmitReferral,
    watch: watchReferral,
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referralCode: "" },
  });

  const watchedReferralCode = watchReferral("referralCode");

  const handleReferralInputChange = referral.handleInputChange;

  useEffect(() => {
    handleReferralInputChange(watchedReferralCode);
  }, [watchedReferralCode, handleReferralInputChange]);

  const getFullPhoneNumber = () => {
    const data = getValuesPhone();
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
    show("Sending OTP...", "Creating your account");
    const fullPhone = getFullPhoneNumber();

    try {
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
    show("Verifying...", "Setting up profile");
    const fullPhone = getFullPhoneNumber();

    try {
      const res = await verifyPhoneOtp(fullPhone, otp, isRememberMe);

      if (!res.success) {
        setError(res.error || "Invalid OTP");
        setIsLoading(false);
        hide();
        return;
      }

      if (res.isNewUser) {
        setStep("DETAILS");
        hide();
      } else {
        await authClient.getSession();
        const destination = res.redirectTo || callbackUrl;

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
      }
    } catch {
      setError("Verification failed.");
      hide();
    } finally {
      setIsLoading(false);
    }
  };

  const onNameSubmit = (data: DetailsFormData) => {
    setTempName(data.name);
    setStep("REFERRAL");
  };

  const onReferralSubmit = async (data: ReferralFormData) => {
    setIsLoading(true);
    setError(null);
    show("Finalizing...", "Updating your profile");

    if (data.referralCode && !referral.verifiedCode) {
      const res = await verifyReferralCode(data.referralCode);
      if (!res.valid) {
        setError(res.message || "Invalid referral code");
        setIsLoading(false);
        hide();
        return;
      }
    }

    try {
      const updateRes = await updateProfileAfterSignup({
        name: tempName,
        referralCode: data.referralCode,
      });

      if (!updateRes.success) {
        setError(updateRes.error || "Failed to update profile");
        setIsLoading(false);
        hide();
        return;
      }

      await authClient.getSession();
      const destination = updateRes.redirectTo || callbackUrl;

      if (isModal) {
        if (destination !== "/") {
          window.location.href = destination;
        } else {
          window.location.reload();
        }
      } else {
        show("All Set!", "Redirecting...");
        window.location.href = destination;
      }
    } catch {
      setError("Failed to update profile.");
      setIsLoading(false);
      hide();
    }
  };

  const handleSkipReferral = () => onReferralSubmit({ referralCode: "" });

  const handleGoogleSignIn = async () => {
    if (!isTermsAccepted) {
      setTermsError("Please review and accept the Terms & Conditions before continuing.");
      return;
    }
    setTermsError(null);
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });
  };

  // --- OTP step ---
  if (step === "OTP") {
    return (
      <OTPStep
        phoneNumber={getFullPhoneNumber()}
        value={otp}
        onChange={setOtp}
        onSubmit={onVerifyOtp}
        onBack={() => setStep("PHONE")}
        backLabel="Wrong number? Back to Details"
        isLoading={isLoading}
        error={error}
        isModal={isModal}
      />
    );
  }

  // --- Name step ---
  if (step === "DETAILS") {
    return (
      <div
        className={cn(
          "flex min-h-[500px] w-full flex-1 flex-col items-center justify-center",
          !isModal && "no-scrollbar overflow-y-auto lg:w-1/2",
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">What&apos;s your name?</h1>
            <p className="text-muted-foreground text-sm">Please provide your full name.</p>
          </div>

          <form onSubmit={handleSubmitDetails(onNameSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name*</Label>
              <Input {...registerDetails("name")} placeholder="John Doe" />
              {errorsDetails.name && (
                <p className="text-destructive text-xs">{errorsDetails.name.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- Referral step ---
  if (step === "REFERRAL") {
    return (
      <div
        className={cn(
          "flex min-h-[500px] w-full flex-1 flex-col items-center justify-center",
          !isModal && "no-scrollbar overflow-y-auto lg:w-1/2",
        )}
      >
        <div className="mx-auto w-full max-w-md space-y-6 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Got a Referral Code?</h1>
            <p className="text-muted-foreground text-sm">
              Enter it below to claim your rewards, or skip this step.
            </p>
          </div>

          <form onSubmit={handleSubmitReferral(onReferralSubmit)} className="space-y-4">
            <ReferralCodeInput
              inputProps={registerReferral("referralCode")}
              value={watchedReferralCode}
              onApply={() => referral.verify(watchedReferralCode || "")}
              isLoading={referral.isLoading}
              status={referral.status}
            />

            {error && (
              <p className="text-destructive bg-destructive/10 rounded p-2 text-center text-sm">
                {error}
              </p>
            )}

            <div className="space-y-2 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading || referral.isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Completing..." : "Complete Signup"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleSkipReferral}
                disabled={isLoading || referral.isLoading}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Phone step (initial) ---
  return (
    <AuthStepShell title="Sign Up" description="Create a passwordless account." isModal={isModal}>
      <div className="space-y-5">
        <GoogleSignInButton onClick={handleGoogleSignIn} label="Sign up with Google" />

        <div className="text-muted-foreground relative py-2 text-center text-sm">
          <span className="bg-background relative z-10 px-2">Or with Phone</span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
        </div>

        <form onSubmit={handleSubmitPhone(onRequestOtp)}>
          <div className="space-y-4">
            <PhoneNumberField
              control={controlPhone}
              register={registerPhone}
              error={errorsPhone.phone}
            />

            <TermsCheckbox
              id="signup-terms"
              checked={isTermsAccepted}
              onCheckedChange={(checked) => {
                setIsTermsAccepted(checked);
                if (checked) {
                  setTermsError(null);
                }
              }}
              description="You must accept our corporate terms and conditions to proceed with registration or login via any method."
              requiredError={termsError}
            />

            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="signup-remember"
                checked={isRememberMe}
                onCheckedChange={(checked) => setIsRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="signup-remember"
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
          Already have an account?{" "}
          {isModal ? (
            <button
              onClick={() => setAuthMode("signin")}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              Sign In
            </button>
          ) : (
            <Link href="/signin" className="text-primary font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </AuthStepShell>
  );
}

export default function SignUpForm(props: SignUpFormProps) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <SignUpFormContent {...props} />
    </Suspense>
  );
}
