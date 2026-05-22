'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { Gift, Ticket, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MilestoneTier } from '@/types/referral.types';

interface MilestoneTrackerProps {
  tiers: MilestoneTier[];
  currentReferrals: number;
}

function getRewardPreview(tier: MilestoneTier) {
  if (tier.rewardType === 'PHYSICAL_GIFT' && tier.gift) {
    return {
      label: tier.gift.name,
      sublabel: `Est. value: RM${tier.gift.estimatedValue ?? '0'}`,
      imageUrl: tier.gift.imageUrl,
    };
  }
  if (tier.rewardType === 'VOUCHER' && tier.voucher) {
    return {
      label: tier.voucher.name,
      sublabel: `RM${tier.voucher.denomination} ${tier.voucher.type.replace(/_/g, ' ')}`,
      imageUrl: tier.voucher.imageUrl,
    };
  }
  return {
    label: tier.name,
    sublabel: tier.rewardAmount ? `RM${tier.rewardAmount}` : 'Reward',
    imageUrl: null,
  };
}

export function MilestoneTracker({ tiers, currentReferrals }: MilestoneTrackerProps) {
  if (tiers.length === 0) return null;

  const maxRequired = Math.max(...tiers.map(t => t.minReferrals ?? 0));
  const progressPercent = maxRequired > 0
    ? Math.min((currentReferrals / maxRequired) * 100, 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestone Rewards</CardTitle>
          <CardDescription>
            Invite friends & unlock gifts! You have {currentReferrals} referral{currentReferrals !== 1 ? 's' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress bar track */}
          <div className="relative pt-2 pb-10">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            {/* Milestone nodes */}
            <div className="absolute inset-x-0 top-0 flex items-start">
              {tiers.map((tier, i) => {
                const minRef = tier.minReferrals ?? 0;
                const leftPercent = maxRequired > 0
                  ? (minRef / maxRequired) * 100
                  : (i / (tiers.length - 1 || 1)) * 100;
                const isUnlocked = currentReferrals >= minRef;
                const preview = getRewardPreview(tier);

                return (
                  <Tooltip key={tier.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="absolute flex flex-col items-center -translate-x-1/2 focus:outline-none group"
                        style={{ left: `${leftPercent}%` }}
                      >
                        {/* Circle node */}
                        <motion.div
                          className={cn(
                            'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300 shadow-sm',
                            isUnlocked
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'bg-background border-muted-foreground/30 text-muted-foreground'
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 + i * 0.12 }}
                          whileHover={{ scale: 1.15 }}
                        >
                          {isUnlocked ? (
                            <Check className="w-4 h-4" />
                          ) : tier.rewardType === 'PHYSICAL_GIFT' ? (
                            <Gift className="w-3.5 h-3.5" />
                          ) : tier.rewardType === 'VOUCHER' ? (
                            <Ticket className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </motion.div>

                        {/* Label below */}
                        <span className={cn(
                          'mt-1.5 text-[10px] font-medium leading-tight text-center max-w-[72px]',
                          isUnlocked ? 'text-primary' : 'text-muted-foreground'
                        )}>
                          {minRef} referral{minRef !== 1 ? 's' : ''}
                        </span>
                      </button>
                    </TooltipTrigger>

                    {/* Hover popup with gift preview */}
                    <TooltipContent
                      side="top"
                      sideOffset={8}
                      className="w-56 p-0 overflow-hidden rounded-lg shadow-lg"
                    >
                      {preview.imageUrl && (
                        <div className="relative h-32 w-full bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview.imageUrl}
                            alt={preview.label}
                            className="h-full w-full object-cover"
                          />
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <p className="text-sm font-semibold">{preview.label}</p>
                        <p className="text-xs text-muted-foreground">{preview.sublabel}</p>
                        {tier.description && (
                          <p className="text-xs text-muted-foreground italic">{tier.description}</p>
                        )}
                        <div className="pt-1">
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                              <Check className="w-3 h-3" /> Unlocked
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {minRef - currentReferrals} more referral{minRef - currentReferrals !== 1 ? 's' : ''} to unlock
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
