---
description: "Use when creating or editing server actions, API handlers, or backend logic. Covers action patterns, Zod validation, and auth checks."
applyTo: "src/app/actions/**"
---
# Server Actions Conventions

- All server actions are in `src/app/actions/` — don't scatter them in component files
- Every action file starts with `"use server"` directive
- Validate ALL inputs with Zod before any database operation
- Return `{ success: boolean, data?: T, error?: string }` — never throw for expected failures
- Auth-gated actions: call `auth.api.getSession({ headers: await headers() })` and early-return if no session
- Admin actions: additionally verify role from session before proceeding
- Use Drizzle's parameterized queries — never interpolate user input into SQL
- Bulk operations: use `db.transaction()` for atomic multi-table writes
- Revalidate paths with `revalidatePath()` after mutations when needed
