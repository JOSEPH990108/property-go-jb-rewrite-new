# Decision Gate Rules

The Decision AI Agent is the automated approval gate for planning, implementation, QA, and environment readiness.

## Score Categories

Score each category from 1 to 10:

- Requirements clarity.
- Technical correctness.
- Security.
- Scalability.
- DRY/reusability.
- Environment separation.
- Maintainability.
- Testing readiness.
- Production readiness.

## Approval Rule

Approval requires all of the following:

- Average score is 8.5 or higher.
- No category is below 8.
- No critical issue exists.
- Required outputs for the stage are present.
- Open risks are documented with owners or next actions.

Approved output must include:

```text
APPROVED_FOR_NEXT_STAGE
```

## Rejection Rule

Reject when any category is below 8, the average is below 8.5, a critical issue exists, or required planning is missing.

Rejected output must include:

```text
REJECTED_NEEDS_IMPROVEMENT
```

Then include what failed, why it failed, which agent must fix it, exact improvement instructions, and the required output after improvement.

## Common Critical Issues

- Vague requirements that cannot be tested.
- Missing environment separation.
- Local/mock provider can run in staging, preprod, or production.
- Secrets, tokens, or credentials exposed.
- Direct provider calls from app code instead of service/provider abstractions.
- Hardcoded business logic without justification.
- Duplicated logic where shared services or utilities should exist.
- Missing auth, role, validation, or ownership checks.
- Missing migration, seed, rollback, or data compatibility notes for database changes.
- Missing test plan for user-facing, backend, auth, storage, or payment-like flows.
