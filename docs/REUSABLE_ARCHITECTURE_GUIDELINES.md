# Reusable Architecture Guidelines

## Core Rules

- Keep business logic out of UI components when it can live in services, utilities, hooks, or server actions.
- Prefer shared modules over duplicated logic.
- Use provider interfaces for integrations that vary by environment.
- Use typed configuration wrappers for environment variables.
- Keep hardcoded business logic out of implementation unless documented and approved.
- Keep feature code scoped to the module boundary implied by the approved plan.

## Provider Interface Pattern

Use this structure for environment-dependent integrations:

```text
Feature/UI/Action -> Domain service -> Provider interface -> Concrete provider
```

Examples:

- OTP service -> OTP provider interface -> mock provider or real provider.
- Storage service -> storage provider interface -> local provider or Cloudflare R2 provider.
- Notification service -> notification provider interface -> mock provider or real provider.

## Reuse Checklist

- Can an existing utility, service, hook, component, or schema be extended safely?
- Is shared validation defined once?
- Is provider selection centralized?
- Are environment-specific values read from config rather than embedded in business logic?
- Are user-facing states reusable and consistent across loading, empty, error, disabled, and success states?
- Are tests focused on shared behavior rather than implementation details?

## Documentation Expectations

Document important decisions in the relevant planning or handoff notes. Include tradeoffs when choosing a temporary local solution, a hardcoded rule, or an intentionally narrow implementation.
