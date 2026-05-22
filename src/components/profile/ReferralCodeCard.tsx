// src\components\profile\ReferralCodeCard.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { BaseCard } from "@/components/shared/base-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ValidationStatus } from "@/components/shared/ValidationStatus";
import { useReferralVerification } from "@/hooks/useReferralVerification";
import { applyReferralOnSignup } from "@/app/actions/referral-actions";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useRouter } from "next/navigation";

const referralSchema = z.object({
  referralCode: z.string().min(1, "Please enter a code"),
});

type ReferralData = z.infer<typeof referralSchema>;

interface ReferralCodeCardProps {
    userId: string;
}

export function ReferralCodeCard({ userId }: ReferralCodeCardProps) {
  const router = useRouter();
  const { verify, status, verifiedCode, isLoading: isVerifying, handleInputChange } = useReferralVerification();

  const { execute: applyReferral, isLoading: isApplying } = useAsyncAction(
    (code: string) => applyReferralOnSignup(userId, code),
    {
      successMessage: "Referral code applied successfully!",
      onSuccess: () => router.refresh(),
    },
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReferralData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      referralCode: "",
    },
  });

  const watchedReferralCode = watch("referralCode");

  useEffect(() => {
    handleInputChange(watchedReferralCode);
  }, [watchedReferralCode, handleInputChange]);

  const onSubmit = async (data: ReferralData) => {
    if (!verifiedCode) {
      await verify(data.referralCode);
    }
    await applyReferral(data.referralCode);
  };

  const isLoading = isVerifying || isApplying;

  return (
    <BaseCard
      title="Add Referral Code"
      description="Did someone refer you? Enter their code to link your account."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
              <Label>Referral Code</Label>
              <div className="flex gap-2">
                  <Input
                      {...register("referralCode")}
                      placeholder="Enter code"
                      className={status?.valid ? "border-green-500 focus-visible:ring-green-500" : ""}
                  />
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => verify(watchedReferralCode || "")}
                      disabled={isLoading || !watchedReferralCode}
                  >
                      Apply
                  </Button>
              </div>
              {status && <ValidationStatus valid={status.valid} message={status.message} />}
              {errors.referralCode && <p className="text-destructive text-xs">{errors.referralCode.message}</p>}
          </div>

          <Button type="submit" disabled={isLoading || !status?.valid}>
              {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
              Save Referral
          </Button>
      </form>
    </BaseCard>
  );
}
