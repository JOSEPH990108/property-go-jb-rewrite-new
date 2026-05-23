// src/components/auth/OnboardingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReferralCodeInput } from "@/components/auth/shared/ReferralCodeInput";
import { useGlobalLoaderStore } from "@/stores/global-loader-store";
import { useReferralVerification } from "@/hooks/useReferralVerification";
import {
  updateProfileAfterSignup,
  getOnboardingStatus,
  dismissOnboardingForToday as dismissOnboardingForTodayAction,
} from "@/app/actions/auth-actions";
import { verifyReferralCode } from "@/app/actions/referral-actions";
import { getKLDate } from "@/lib/utils";
import type { ReferralFormData } from "@/types/auth.types";

const referralSchema = z.object({
  referralCode: z.string().optional(),
});

const ONBOARDING_DISMISSED_STORAGE_KEY = "onboarding-dismissed-today";

function getOnboardingDismissedDate(): string | null {
  try {
    return window.localStorage.getItem(ONBOARDING_DISMISSED_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistOnboardingDismissal() {
  try {
    window.localStorage.setItem(ONBOARDING_DISMISSED_STORAGE_KEY, getKLDate());
  } catch {
    // Ignore storage failures.
  }
}

function clearOnboardingDismissal() {
  try {
    window.localStorage.removeItem(ONBOARDING_DISMISSED_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export default function OnboardingModal() {
  const { data: session, isPending } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissedToday, setIsDismissedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("User");

  const router = useRouter();
  const { show, hide } = useGlobalLoaderStore();
  const referral = useReferralVerification();

  const { register, handleSubmit, watch } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: { referralCode: "" },
  });

  const watchedReferralCode = watch("referralCode");

  // Sync dismissed state with session
  useEffect(() => {
    if (!session?.user) {
      setIsDismissedToday(false);
      return;
    }
    setIsDismissedToday(getOnboardingDismissedDate() === getKLDate());
  }, [session]);

  // Check onboarding status from DB
  useEffect(() => {
    let isCancelled = false;

    if (isPending || isDismissedToday) {
      if (isDismissedToday) setIsOpen(false);
      return;
    }

    if (!session?.user) {
      setIsOpen(false);
      return;
    }

    const hasDismissedToday = getOnboardingDismissedDate() === getKLDate();
    if (hasDismissedToday) {
      setIsDismissedToday(true);
      setIsOpen(false);
      return () => {
        isCancelled = true;
      };
    }

    getOnboardingStatus().then((res) => {
      if (isCancelled) return;

      if (getOnboardingDismissedDate() === getKLDate()) {
        setIsDismissedToday(true);
        setIsOpen(false);
        return;
      }

      if (res.success && res.completed === false && res.userName && !res.dismissedToday) {
        setUserName(res.userName);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [session, isPending, isDismissedToday]);

  // Reset referral status when code changes
  useEffect(() => {
    referral.handleInputChange(watchedReferralCode);
  }, [watchedReferralCode, referral.handleInputChange]);

  const onSubmit = async (data: ReferralFormData) => {
    setIsLoading(true);
    setError(null);
    show("Finalizing...", "Setting up your account");

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
        name: userName,
        referralCode: data.referralCode,
      });

      if (!updateRes.success) {
        setError(updateRes.error || "Failed to update profile");
        setIsLoading(false);
        hide();
        return;
      }

      clearOnboardingDismissal();
      setIsDismissedToday(false);
      setIsOpen(false);
      hide();
      router.refresh();
    } catch {
      setError("Failed to complete setup.");
      setIsLoading(false);
      hide();
    }
  };

  const handleSkip = () => onSubmit({ referralCode: "" });

  const handleDismiss = async () => {
    setIsDismissedToday(true);
    setIsOpen(false);
    persistOnboardingDismissal();

    if (session?.user) {
      setIsDismissing(true);
      try {
        await dismissOnboardingForTodayAction();
      } finally {
        setIsDismissing(false);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      return;
    }
    handleDismiss();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <button
            type="button"
            aria-label="Close referral modal"
            onClick={handleDismiss}
            disabled={isDismissing}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground focus:ring-accent absolute top-4 right-4 rounded-lg p-1.5 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle>One Last Thing!</DialogTitle>
          <DialogDescription>
            Do you have a referral code? Enter it below to claim your rewards.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <ReferralCodeInput
            inputProps={register("referralCode")}
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
              {isLoading ? "Completing..." : "Complete Setup"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleSkip}
              disabled={isLoading || referral.isLoading}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
