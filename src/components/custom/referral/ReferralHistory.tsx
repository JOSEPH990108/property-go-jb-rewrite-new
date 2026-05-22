// src/components/custom/referral/ReferralHistory.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift, Ticket, Banknote, Trophy } from 'lucide-react';
import type { ReferralReward } from '@/types/referral.types';

const TRIGGER_LABELS: Record<string, string> = {
  ON_REGISTRATION: 'Registered',
  ON_BOOKING: 'Booked',
  ON_SPA_SIGNED: 'SPA Signed',
  ON_VISIT: 'Visited',
  MILESTONE: 'Milestone',
};

function getRewardLabel(item: ReferralReward): string {
  if (item.gift) return item.gift.name;
  if (item.voucher) return `${item.voucher.name}`;
  if (item.amount) return `RM${item.amount}`;
  return item.rewardType ?? 'Reward';
}

function RewardIcon({ type }: { type: string | null }) {
  switch (type) {
    case 'PHYSICAL_GIFT': return <Gift className="h-3.5 w-3.5" />;
    case 'VOUCHER': return <Ticket className="h-3.5 w-3.5" />;
    case 'CASH': case 'CASHBACK': return <Banknote className="h-3.5 w-3.5" />;
    default: return <Trophy className="h-3.5 w-3.5" />;
  }
}

interface ReferralHistoryProps {
  history: ReferralReward[];
}

export function ReferralHistory({ history }: ReferralHistoryProps) {
  if (history.length === 0) {
      return (
          <div className="text-center py-10 text-muted-foreground">
              <p>No referrals yet. Start inviting friends!</p>
          </div>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral History</CardTitle>
        <CardDescription>Track the status of your invites and rewards.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((item, index) => (
           <motion.div
             key={item.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.3, delay: index * 0.1 }}
             className="flex items-center justify-between p-4 border rounded-lg bg-card"
           >
              <div className="flex items-center space-x-4">
                 <Avatar>
                    <AvatarImage src={item.referee?.image || undefined} />
                    <AvatarFallback>{item.referee?.name?.charAt(0) || '?'}</AvatarFallback>
                 </Avatar>
                 <div>
                     <p className="font-medium">
                       {item.triggerEvent === 'MILESTONE' ? 'Milestone Bonus' : (item.referee?.name || 'Unknown User')}
                     </p>
                     <p className="text-sm text-muted-foreground">
                         {new Date(item.createdAt).toLocaleDateString()}
                     </p>
                 </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                 <Badge
                    variant={
                        item.status === 'ELIGIBLE' ? 'default' :
                        item.status === 'FULFILLED' ? 'secondary' : 'outline'
                    }
                    className="capitalize"
                 >
                    {item.status?.toLowerCase() ?? "unknown"}
                 </Badge>
                 <span className="flex items-center gap-1 text-xs text-muted-foreground">
                     <RewardIcon type={item.rewardType} />
                     {getRewardLabel(item)}
                 </span>
                 <span className="text-xs text-muted-foreground">
                     {TRIGGER_LABELS[item.triggerEvent ?? ''] ?? item.triggerEvent}
                 </span>
              </div>
           </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
