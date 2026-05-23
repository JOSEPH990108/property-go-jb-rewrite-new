---
description: "Use when working on authentication, login, signup, OTP, Google OAuth, session management, role-based access, or middleware. Covers better-auth config and auth gotchas."
applyTo:
  [
    "src/lib/auth*",
    "middleware.ts",
    "src/app/(auth)/**",
    "src/components/auth/**",
    "src/app/actions/auth-*",
  ]
---

# Authentication System

## Stack

- **better-auth** for all auth flows (email/password, Google OAuth, phone OTP)
- Server config: `src/lib/auth.ts`
- Client: `src/lib/auth-client.ts`
- Redirect logic: `src/lib/auth-redirect.ts`
- Middleware: `middleware.ts` (cookie-based route protection)

## Key Behaviors

- Phone OTP signup creates temp email: `{phoneNumber}@temp.propertygo.com`
- Google OAuth has `allowDifferentEmails: true` to support linking phone accounts with different Google emails
- Session: 30-day expiry, daily refresh
- Middleware checks `better-auth.session_token` and `pgb-role` cookies

## Role-Based Redirects

- SUPER_ADMIN / ADMIN → `/admin/dashboard`
- AGENT → `/agent/dashboard`
- USER / default → `/`

## OTP Gotchas

- better-auth may return partial user data from OTP verification
- Resolve role in order: verified user id → session user id → DB lookup by phone
- SignInForm redirect: `res.redirectTo || callbackUrl`

## Terms & Conditions

- T&C modal opens when checking terms checkbox from unchecked state
- "I Understand" disabled until user scrolls to end of terms content
- Validation happens on Continue/Google click, not on checkbox toggle
