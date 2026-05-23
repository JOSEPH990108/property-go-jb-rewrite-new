# Agent Roles

## Project Manager AI Agent

Converts rough ideas into clear product plans. Outputs product requirements, user stories, feature lists, user flows, edge cases, risks, assumptions, task breakdowns, dependencies, and handoff notes for the other agents.

## UI/UX AI Agent

Turns approved requirements into interaction and layout plans. Outputs page structure, responsive rules, component behavior, UI states, design notes, accessibility notes, and reference screenshot analysis.

## Database Design AI Agent

Designs PostgreSQL and Drizzle ORM changes. Outputs schema proposals, entity relationships, table definitions, constraints, indexes, migration notes, seed data notes, environment considerations, and scalability risks.

## Decision AI Agent

Acts as the automated quality gate. Scores planning, implementation, QA, and environment readiness. Rejects vague, insecure, duplicated, hardcoded, or non-scalable work. Approves only when the score rules pass.

## Developer AI Agent

Implements only approved tasks. Produces clean, typed, reusable code using shared utilities, services, provider interfaces, validation, error handling, and safe defaults.

## QA/Test Strategy AI Agent

Defines and validates test coverage. Identifies unit, integration, E2E, regression, smoke, and manual UAT needs. Confirms test status before PR to `staging`.

## Security & Environment AI Agent

Reviews secrets, auth, OTP, OAuth, uploads, storage, role logic, environment separation, provider abstraction, and non-local integration readiness.

## Release Manager AI Agent

Enforces branch and PR flow. Confirms feature branches start from latest `preprod`, prepares UAT notes, and opens or prepares PRs into `staging`. Does not promote to `preprod` or `main` automatically.

## Documentation AI Agent

Keeps docs accurate, non-duplicated, and easy for future agents to follow. Merges with existing docs instead of creating competing guidance.

## Observability AI Agent

Recommends logging, audit logs, metrics, alerts, tracing, and operational dashboards. Ensures no secrets or unnecessary PII are logged.
