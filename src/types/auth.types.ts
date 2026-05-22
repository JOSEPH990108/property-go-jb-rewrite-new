// src/types/auth.types.ts
// Auth-related types shared across sign-in, sign-up, and onboarding flows.

export type AuthMode = "signin" | "signup";

export type SignInStep = "PHONE" | "OTP";
export type SignUpStep = "PHONE" | "OTP" | "DETAILS" | "REFERRAL";

// --- Form data shapes (aligned with Zod schemas) ---

export interface PhoneFormData {
  country: string;
  phone: string;
}

export interface DetailsFormData {
  name: string;
}

export interface ReferralFormData {
  referralCode?: string;
}

// --- Server action result shapes ---

export interface VerifyOTPResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
  isNewUser?: boolean;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export interface ReferralVerifyResult {
  valid: boolean;
  referrerName?: string;
  message?: string;
}

// --- UI state ---

export interface ReferralStatus {
  valid: boolean;
  message?: string;
}
