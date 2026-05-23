# PropertyGo JB Agent Guide

This repository uses AI agents as a structured software delivery team. Agents must follow the documentation-first SDLC in `docs/AI_AGENT_WORKFLOW.md` before implementing any product change.

## Project Stack

- Next.js App Router with TypeScript and React.
- Tailwind CSS 4, Shadcn/ui, Radix UI, and Framer Motion.
- PostgreSQL with Drizzle ORM.
- Better Auth with Google OAuth and phone OTP.
- Cloudflare R2 or another real configured storage provider for staging/UAT, preprod, and production file storage.
- Local/mock storage and mock OTP are allowed only for local development.

## Branch Workflow

Every new requirement or feature must start from latest `preprod`:

```bash
git checkout preprod
git pull origin preprod
git checkout -b ai/<short-feature-name>
```

Do not start feature work from `staging`, `main`, or old feature branches. `rewrite/cleanup-20260523` is only a feature branch and must not be treated as the long-term source branch.

When the AI workflow is complete and all gates pass, open a PR into `staging` for human UAT. Do not PR feature work directly into `preprod` or `main`. Promotion from `staging` to `preprod` and `main` is a separate release process.

## When Implementation Is Allowed

Implementation may begin only after:

1. Project Manager planning is complete.
2. UI/UX planning is complete when UI is affected.
3. Database planning is complete when data model or persistence is affected.
4. QA/Test Strategy planning is complete.
5. Security & Environment planning is complete for auth, storage, uploads, integrations, secrets, roles, or environment-dependent behavior.
6. Decision AI Agent writes `APPROVED_FOR_NEXT_STAGE` with an average score of at least 8.5 and no category below 8.

Implementation must stop and return to planning when requirements are vague, environment behavior is unclear, a critical security issue exists, the Decision AI Agent rejects a stage, or the requested implementation would violate the approved plan.

## Coding Rules

- Keep changes scoped to approved tasks.
- Follow existing project instructions in `.github/copilot-instructions.md` and `.github/instructions/`.
- Prefer reusable modules, shared utilities, services, and provider/interface patterns.
- Avoid duplicated logic and hardcoded business rules.
- Document justified exceptions.
- Never expose secrets in code, markdown, logs, terminal output, commits, or PR text.
- Keep environment-specific behavior behind validated configuration and provider selection.

## Environment Rules

Application code must use this dependency direction:

```text
App code -> Service -> Provider interface -> Environment-selected provider
```

Local development may use local/mock providers when needed. Staging/UAT, preprod, and production must use real integrations where required. Mock/local-only logic must not leak into non-local environments.

## AI Approval Workflow

Use the stages in `docs/DEVELOPMENT_LIFECYCLE.md`:

1. Idea Intake.
2. Product Requirement Planning.
3. UI/UX Planning.
4. Database Planning.
5. Decision Review.
6. Development Planning.
7. Implementation.
8. AI Testing.
9. AI Code Review.
10. Environment Readiness Review.
11. Final Completion Report.
12. Pull Request to `staging`.

Rejected work must loop back to the named agent with exact improvement instructions. Human UAT starts only after the AI workflow marks the work complete and the PR is opened into `staging`.

## UI/UX Screenshot References

Reference images belong under `docs/references/ui-ux/`, not public frontend folders. Update `docs/references/ui-ux/REFERENCE_INDEX.md` for every reference. Extract reusable patterns only; do not copy competitor logos, protected assets, brand identity, or exact text.

## Required Checks

Before AI completion, run applicable checks. At minimum for documentation-only work, run:

```bash
npm run format:check
npm run lint
npm run typecheck
```

For product or test changes, also run applicable unit tests, build, and E2E checks.
