// src\components\profile\ReferralCodeCard.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { BaseCard } from "@/components/shared/base-card";
import { Button } from "@/components/ui/button";
import { ReferralCodeInput } from "@/components/auth/shared/ReferralCodeInput";
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
  const {
    verify,
    status,
    verifiedCode,
    isLoading: isVerifying,
    handleInputChange,
  } = useReferralVerification();

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
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
        <ReferralCodeInput
          label="Referral Code"
          inputProps={register("referralCode")}
          value={watchedReferralCode}
          onApply={() => verify(watchedReferralCode || "")}
          isLoading={isLoading}
          status={status}
          error={errors.referralCode?.message}
        />

        <Button type="submit" disabled={isLoading || !status?.valid}>
          {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
          Save Referral
        </Button>
      </form>
    </BaseCard>
  );
}
