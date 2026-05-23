// src/types/referral.types.ts
// Shared types for the referral system — used by actions, components, and displays.

export interface ReferralReferee {
  name: string | null;
  image: string | null;
  email: string | null;
}

export interface ReferralGift {
  name: string;
  imageUrl: string | null;
}

export interface ReferralVoucher {
  name: string;
  type: string;
  denomination: string;
}

/** Trigger events that can generate referral rewards. */
export type ReferralTriggerEvent =
  | "ON_REGISTRATION"
  | "ON_BOOKING"
  | "ON_SPA_SIGNED"
  | "ON_VISIT"
  | "MILESTONE";

/** Reward types in the referral system. */
export type ReferralRewardType = "PHYSICAL_GIFT" | "VOUCHER" | "CASH" | "CASHBACK" | "POINTS";

/** A single entry in the referral reward history (returned by getReferralHistory).
 *  Dates may be a JS `Date` from Drizzle or a serialised ISO string when passed across
 *  the server/client boundary — components should normalise via `new Date(createdAt)`.
 */
export interface ReferralReward {
  id: string;
  status: string | null;
  rewardType: string | null;
  triggerEvent: string | null;
  amount: string | null;
  createdAt: Date | string;
  fulfilledAt: Date | string | null;
  referee: ReferralReferee | null;
  gift: ReferralGift | null;
  voucher: ReferralVoucher | null;
}

/** Aggregate stats returned by getReferralStats. */
export interface ReferralStatsData {
  referralCode: string;
  referralsCount: number;
  rewardsCount: number;
}

/** A milestone tier with linked gift/voucher details (from getMilestoneTiers). */
export interface MilestoneTier {
  id: string;
  name: string;
  minReferrals: number | null;
  rewardType: string;
  rewardAmount: string | null;
  description: string | null;
  giftId: string | null;
  voucherId: string | null;
  gift: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    estimatedValue: string | null;
  } | null;
  voucher: {
    id: string;
    name: string;
    type: string;
    denomination: string;
    description: string | null;
    imageUrl: string | null;
  } | null;
}
