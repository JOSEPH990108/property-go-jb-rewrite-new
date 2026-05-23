# Tech Stack Rules

## Core Stack

- Framework: Next.js App Router.
- Language: TypeScript in strict mode.
- UI: React, Tailwind CSS 4, Shadcn/ui, Radix UI, Framer Motion.
- Database: PostgreSQL with Drizzle ORM.
- Auth: Better Auth with Google OAuth and phone OTP.
- File storage: Cloudflare R2 or another real configured provider outside local development.
- Testing: Vitest, Testing Library, and Playwright.

## Implementation Rules

- Prefer existing repo patterns over new abstractions.
- Use `@/` imports where appropriate.
- Use `cn()` for class merging and shared formatting utilities from `src/lib/utils.ts`.
- Compose Shadcn primitives; do not modify `src/components/ui/` directly unless explicitly approved.
- Keep Drizzle schema in `src/db/schema.ts`.
- Keep `src/db/index.ts` typed as the concrete Drizzle instance.
- Validate inputs with Zod for server actions and API handlers.
- Return server action results as `{ success, data?, error? }`.
- Apply auth, role, ownership, and environment checks before sensitive operations.

## Required Check Commands

Run these before AI completion when applicable:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

For documentation-only changes, `format:check`, `lint`, and `typecheck` are the default minimum checks.
