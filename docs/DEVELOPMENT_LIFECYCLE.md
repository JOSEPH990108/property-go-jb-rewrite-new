# Development Lifecycle

## 1. Start From Preprod

```bash
git checkout preprod
git pull origin preprod
git checkout -b ai/<short-feature-name>
```

## 2. Plan Before Building

Create or update planning notes for product, UI/UX, database, QA, security/environment, and observability as applicable. The Decision AI Agent must approve the planning package before implementation starts.

## 3. Implement Approved Work Only

The Developer AI Agent follows the approved plan, keeps changes scoped, uses shared modules and providers, and avoids unrelated refactors.

## 4. Test and Review

Run applicable checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

The QA/Test Strategy AI Agent confirms coverage. The Decision AI Agent reviews the implementation. The Security & Environment AI Agent confirms integration readiness.

## 5. Completion Report

The final AI report must include:

- Completed work.
- Files changed.
- Risks and unresolved decisions.
- Tests run and results.
- Environment readiness result.
- Human UAT notes.
- Final status.

Use `AI_READY_FOR_STAGING_UAT` only when every gate passes.

## 6. PR Into Staging

After `AI_READY_FOR_STAGING_UAT`, create or prepare a PR into `staging`:

```bash
gh pr create --base staging --head <current-branch> --title "[AI SDLC] <feature or workflow name>" --body "<body>"
```

The PR body must include Summary, AI planning status, AI decision score, Tests run, Environment readiness result, UAT notes for human testers, and Risks and rollback notes.

Do not automatically promote from `staging` to `preprod` or `main` for feature work.
