# PropertyGo JB — Copilot Instructions

## Project Overview

PropertyGo JB is a **Malaysian real-estate platform** (Johor Bahru focus) built for property search, agent management, appointment booking, and a referral rewards system.

## Tech Stack

| Layer        | Technology                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------ |
| Framework    | **Next.js 16** (App Router, Turbopack)                                                     |
| Language     | **TypeScript 5.9** (strict mode)                                                           |
| UI           | **React 19**, **Shadcn/ui** (new-york style, stone base), **Radix UI**, **Tailwind CSS 4** |
| Database     | **PostgreSQL** via **Drizzle ORM** 0.41                                                    |
| Auth         | **better-auth** (email/password, Google OAuth, phone OTP via Twilio)                       |
| State        | **Zustand** stores (`src/stores/`)                                                         |
| Forms        | **React Hook Form** + **Zod 4** validation                                                 |
| Animations   | **Framer Motion**                                                                          |
| Testing      | **Vitest** (unit), **Playwright** (E2E), **@testing-library/react**                        |
| File uploads | **UploadThing**                                                                            |
| Hosting      | **Vercel**                                                                                 |

## Architecture

```
src/
  app/              # Next.js App Router (pages, layouts, route groups)
    actions/        # Server actions (auth, admin, appointments, bulk-import, referral, property)
    api/            # API routes (auth catch-all, cron jobs)
    admin/          # Admin panel (dashboard, CRUD, bulk import)
    agent/          # Agent portal
    (main)/         # Public-facing routes (property listings, profile, calculator)
    (auth)/         # Auth pages
  components/
    ui/             # Shadcn primitives (DO NOT modify directly — use CLI to add new ones)
    admin/          # Admin-specific components
    auth/           # Login/signup/OTP modals
    properties/     # Property cards, filters, detail views
    custom/         # Domain-specific composites (referral, appointment)
    shared/         # Cross-cutting: GlobalLoader, ScrollLoginTrigger
    layout/         # Header, footer, sidebars
  db/
    schema.ts       # Drizzle schema (single file, all tables)
    index.ts        # DB singleton — keep typed as concrete Drizzle instance (never `| any`)
    seeds/          # Seed data for lookup tables
  lib/              # Shared utilities, business logic, configs
  hooks/            # Custom React hooks
  services/         # External service integrations (exchange rates)
  stores/           # Zustand global state stores
  types/            # Shared TypeScript types
```

## Code Conventions

### General

- Use `cn()` from `src/lib/utils.ts` for merging Tailwind classes (clsx + tailwind-merge).
- Currency formatting: use `formatCurrency()` from `src/lib/utils.ts` (MYR).
- Dates in KL timezone: use `getKLDate()` from `src/lib/utils.ts`.
- Imports: prefer `@/` path alias (maps to `src/`).

### Server Actions

- All server actions live in `src/app/actions/`.
- Use `"use server"` directive at the top of action files.
- Validate inputs with Zod before database operations.
- Return `{ success, data?, error? }` pattern for action results.

### Components

- Shadcn UI primitives in `src/components/ui/` — extend via composition, don't modify source files.
- New reusable components go in `src/components/shared/` or domain-specific folders.
- Use Radix UI controlled components with `undefined` (not empty string) for unselected state.

### Database

- Schema is in a single file: `src/db/schema.ts`.
- Use Drizzle's relational query API for reads, standard insert/update/delete for writes.
- Lookup tables use `code` fields as stable identifiers for bulk import foreign key resolution.
- Keep `src/db/index.ts` typed as the concrete Drizzle instance — adding `| any` breaks query inference.

### Authentication

- Phone OTP creates temp emails: `{phoneNumber}@temp.propertygo.com`.
- Google OAuth allows linking different emails (`allowDifferentEmails: true`).
- Role-based redirects: SUPER_ADMIN/ADMIN → `/admin/dashboard`, AGENT → `/agent/dashboard`.
- Middleware protects `/admin/*` and `/agent/*` routes via cookie-based role checks.
- OTP role resolution order: verified user id → session user id → DB lookup by phone.

### Forms & Validation

- Use React Hook Form with `@hookform/resolvers/zod`.
- Zod schemas live alongside their domain logic (e.g., `src/lib/bulk-import-schema.ts`).
- ESLint rule `react-hooks/set-state-in-effect` is enabled — avoid syncing server props into client state via useEffect. Prefer server props as source of truth.

### Bulk Import System

- CSV parsing is RFC 4180 compliant with BOM handling and header canonicalization.
- Entity config registry: `src/lib/bulk-import-config.ts`.
- File input accepts `.csv` plus common MIME types (`text/csv`, `application/csv`, `application/vnd.ms-excel`, `text/plain`, empty).
- Foreign keys resolved via lookup table `code` fields, not raw IDs.

### Testing

- Unit tests: `tests/` directory, run with `npx vitest run`.
- Test files follow pattern: `*.test.ts` / `*.test.tsx`.
- Use `@testing-library/react` for component tests.
- E2E: Playwright in default config.

## Build & Run

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm start            # Serve production build (requires rebuild after code changes)
npx drizzle-kit push # Push schema to DB
npx drizzle-kit generate  # Generate migration SQL
npx vitest run       # Run unit tests
```

## Key Gotchas

- `npm start` serves previously built `.next` output — code edits are invisible until `npm run build`.
- Onboarding referral modal uses persisted daily dismissal scoped by user ID and KL date.
- Terms & Conditions modal requires scroll-to-bottom before acceptance is enabled.
- Profile page promotes temp phone emails to linked Google verified email when available.
