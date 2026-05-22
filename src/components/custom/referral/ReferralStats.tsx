// src\components\custom\referral\ReferralStats.tsx
'use client';

import { Users, Trophy } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';

interface ReferralStatsProps {
  referralsCount: number;
  rewardsCount: number;
}

export function ReferralStats({ referralsCount, rewardsCount }: ReferralStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatCard
        title="Friends Invited"
        value={referralsCount}
        description="Total registered friends"
        icon={Users}
        delay={0.1}
      />
      <StatCard
        title="Rewards Earned"
        value={rewardsCount}
        description="Pending & Eligible Rewards"
        icon={Trophy}
        delay={0.2}
      />
    </div>
  );
}
