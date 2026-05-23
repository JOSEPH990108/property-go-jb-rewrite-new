// src/components/custom/referral/ReferralDashboard.tsx
"use client";

import { useCallback } from "react";
import { ReferralStats } from "./ReferralStats";
import { ReferralLink } from "./ReferralLink";
import { ReferralHistory } from "./ReferralHistory";
import { MilestoneTracker } from "./MilestoneTracker";
import {
  getReferralStats,
  getReferralHistory,
  getMilestoneTiers,
} from "@/app/actions/referral-actions";
import { useServerQuery } from "@/hooks/useServerQuery";
import { Loader2 } from "lucide-react";
import type { ReferralStatsData, ReferralReward, MilestoneTier } from "@/types/referral.types";

export default function ReferralDashboard() {
  const { data: stats, isLoading: loadingStats } =
    useServerQuery<ReferralStatsData>(getReferralStats);

  const getHistory = useCallback(async () => {
    const res = await getReferralHistory();
    return { ...res, data: res.data as unknown as ReferralReward[] };
  }, []);
  const { data: history, isLoading: loadingHistory } = useServerQuery<ReferralReward[]>(getHistory);

  const getTiers = useCallback(async () => {
    const res = await getMilestoneTiers();
    return { ...res, data: res.data as unknown as MilestoneTier[] };
  }, []);
  const { data: milestones, isLoading: loadingMilestones } =
    useServerQuery<MilestoneTier[]>(getTiers);

  const loading = loadingStats || loadingHistory || loadingMilestones;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load referral data.</div>;
  }

  return (
    <div className="space-y-6">
      {milestones && milestones.length > 0 && (
        <MilestoneTracker tiers={milestones} currentReferrals={stats.referralsCount} />
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ReferralLink referralCode={stats.referralCode} />
          <ReferralStats referralsCount={stats.referralsCount} rewardsCount={stats.rewardsCount} />
        </div>
        <div className="h-full">
          <ReferralHistory history={history ?? []} />
        </div>
      </div>
    </div>
  );
}
