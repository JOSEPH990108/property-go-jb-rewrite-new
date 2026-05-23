---
description: "Use when writing or updating unit tests, E2E tests, or test utilities. Covers Vitest, Testing Library, and Playwright patterns."
applyTo: ["tests/**", "**/*.test.ts", "**/*.test.tsx"]
---

# Testing Conventions

- Unit tests live in `tests/` directory, mirroring `src/` structure
- File naming: `*.test.ts` for logic, `*.test.tsx` for components
- Framework: Vitest with jsdom environment
- Component tests: use `@testing-library/react` — query by role/label, avoid implementation details
- Run tests: `npx vitest run` (all), `npx vitest run tests/path/to/file.test.ts` (single)
- Mock server actions and DB calls — don't hit real database in unit tests
- E2E tests: Playwright with default config
- Bulk import tests validate CSV parsing (RFC 4180), header normalization (BOM, casing), and Zod schemas
