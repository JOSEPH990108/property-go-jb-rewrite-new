# Component Cleanup Plan

## Purpose

This plan turns the current component audit into a staged cleanup program. The goal is to make large feature components easier to maintain by extracting small reusable components, shared UI patterns, and domain-specific composition helpers without changing product behavior in one large risky pass.

The cleanup target is not a single over-configurable component system. The target is a consistent component vocabulary:

- small typed primitives for common UI structure,
- domain-specific composition for admin, property, auth, profile, and calculator features,
- config-driven patterns only where the data shape is truly regular,
- render props where entity-specific UI needs flexibility,
- strict behavior preservation during extraction PRs.

## Current Findings

### Largest Component Areas

| Area                         | Files | Approximate Lines | Notes                                                                                           |
| ---------------------------- | ----: | ----------------: | ----------------------------------------------------------------------------------------------- |
| `src/components/admin/`      |    21 |             6,862 | Highest cleanup priority. Contains the largest component and parallel admin UI systems.         |
| `src/components/custom/`     |    29 |             4,290 | Calculator, carousel, feature, referral, and custom UI components have repeated local controls. |
| `src/components/ui/`         |    25 |             1,904 | Shadcn primitives. Do not modify directly except through intentional Shadcn maintenance.        |
| `src/components/auth/`       |     8 |             1,488 | Sign-in and sign-up share phone, OTP, terms, errors, and loading patterns.                      |
| `src/components/properties/` |     8 |             1,245 | Listing, detail, filters, cards, and unit availability need shared property/unit primitives.    |
| `src/components/shared/`     |    16 |             1,114 | Good foundation, but currently underused by admin and tools.                                    |

### Largest Individual Components

| Component                                                    | Approximate Lines | Main Issue                                                                                                        |
| ------------------------------------------------------------ | ----------------: | ----------------------------------------------------------------------------------------------------------------- |
| `src/components/admin/AdminPortal.tsx`                       |             2,679 | Contains dashboard orchestration, entity cards, inspectors, forms, filters, metrics, and local shared components. |
| `src/components/admin/AdminCrudPage.tsx`                     |               690 | Generic CRUD page owns table shell, metadata loading, form dialogs, search, pagination, and delete flow.          |
| `src/components/properties/UnitAvailabilityChart.tsx`        |               522 | Public unit matrix, status theme, selected unit details, legend, and summary are coupled.                         |
| `src/components/custom/feature/tools/DSRCalculator.tsx`      |               519 | Local calculator shell, slider, rows, metrics, and result UI.                                                     |
| `src/components/auth/SignUpForm.tsx`                         |               489 | Sign-up step flow repeats auth shell, phone field, OTP, terms, error, and loading patterns.                       |
| `src/components/custom/feature/tools/MortgageCalculator.tsx` |               477 | Local finance controls overlap with DSR calculator patterns.                                                      |
| `src/components/admin/AdminShell.tsx`                        |               426 | Admin layout frame can lead to nested cards when child pages also own full-page cards.                            |

## Cleanup Principles

1. Preserve behavior first. Most PRs should be extraction-only, with before/after behavior unchanged.
2. Prefer composition over configuration. Avoid a single giant generic component with many flags.
3. Use existing primitives before adding new ones. Build on `BaseCard`, `EmptyState`, `FormDialog`, `StatCard`, and Shadcn components.
4. Keep Shadcn primitives in `src/components/ui/` untouched. Extend them through shared or domain components.
5. Keep page components thin. Move route-specific sections into local components when pages grow beyond simple composition.
6. Avoid card nesting in admin pages. `AdminShell` already frames the page content, so child pages should use sections and item cards intentionally.
7. Use native page scroll by default. Use `ScrollArea` only inside fixed-height bounded regions.
8. Keep server/client boundaries clean. Use `"use client"` only for components that need browser APIs, hooks, or event handlers.

## Target Component Vocabulary

### Shared UI Primitives

Create or extend these under `src/components/shared/` when they are truly cross-domain:

| Component                                    | Purpose                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `SurfaceCard`                                | Standard framed content surface with title, description, action, density, and tone variants.                                  |
| `StateBlock`                                 | Shared empty, loading, success, warning, and error display for list, table, modal, and page contexts.                         |
| `StatusBadge`                                | Typed status badge with variants for published/draft/live, unit availability, import status, DSR risk, and appointment state. |
| `SearchField`                                | Icon search input with controlled value, clear affordance, and size variants.                                                 |
| `FilterChip`                                 | Small toggle chip for filter bars and segmented filters.                                                                      |
| `FilterToolbar`                              | Layout wrapper for search, chips, and action buttons.                                                                         |
| `FieldShell`                                 | Label, helper text, error text, and required marker wrapper for form fields.                                                  |
| `FieldInput` / `FieldSelect` / `FieldSwitch` | Shared field wrappers using Shadcn primitives.                                                                                |

### Admin Components

Create domain components under `src/components/admin/shared/` and feature-specific components under `src/components/admin/portal/` or `src/components/admin/project-wizard/`:

| Component               | Purpose                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `AdminPageHeader`       | Standard admin title, subtitle, and actions row.                                      |
| `AdminSection`          | Unframed section wrapper that works inside `AdminShell`.                              |
| `AdminTableShell`       | Shared table container with toolbar, empty state, loading state, and pagination slot. |
| `AdminTableToolbar`     | Search, filters, import/export, and create action layout.                             |
| `AdminRowActions`       | Edit/delete/view action cluster.                                                      |
| `AdminRecordFormDialog` | Entity create/edit dialog wrapper built on `FormDialog`.                              |
| `AdminEntityListCard`   | Selectable card for property, agent, developer, and future entity lists.              |
| `AdminEntityInspector`  | Right-side or detail-panel inspector with stat grid and actions.                      |

### Property And Unit Components

Create or consolidate under `src/components/properties/`:

| Component               | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `PropertyMediaFrame`    | Image/gallery placeholder and media frame logic.                      |
| `PropertySpecGrid`      | Reusable spec/tile layout for listing and detail pages.               |
| `PropertySpecTile`      | Label/value tile for bedrooms, baths, area, tenure, type, and price.  |
| `UnitStatusBadge`       | Property/unit-specific adapter over shared `StatusBadge`.             |
| `UnitStatusLegend`      | Consistent legend across public unit chart and admin unit management. |
| `TowerAvailabilityGrid` | Reusable grid shell for unit availability displays.                   |
| `UnitDetailPanel`       | Selected unit details and CTA area.                                   |

### Calculator Components

Create under `src/components/custom/feature/tools/shared/`:

| Component              | Purpose                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `CalculatorShell`      | Common page/tool shell for finance calculators.                         |
| `CalculatorSection`    | Section frame with title, optional icon, description, and content.      |
| `SliderNumberField`    | Slider plus numeric input with currency/percentage formatting.          |
| `CalculatorMetricCard` | Result summary tile.                                                    |
| `BreakdownRow`         | Label/value row with optional highlight, note, and negative formatting. |
| `SegmentedModeToggle`  | Compact mode switch for calculator options.                             |

### Auth And Profile Components

Create under `src/components/auth/shared/` and `src/components/profile/shared/` where useful:

| Component            | Purpose                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| `AuthStepShell`      | Shared title, description, error area, and footer for sign-in/sign-up steps. |
| `PhoneNumberField`   | Country selector plus phone input composition.                               |
| `OtpEntryStep`       | OTP entry shell and resend/verify states.                                    |
| `TermsGate`          | Terms acceptance state and modal trigger pattern.                            |
| `ProfileCardSection` | Reusable profile card layout for form-like profile sections.                 |

## Phased Execution Plan

### Phase 0: Safety And Baseline

Deliverables:

- Confirm latest `staging` is clean before each cleanup branch.
- Keep each PR scoped to one feature area or one shared primitive group.
- Run at minimum `npm run format:check`, `npm run lint -- --max-warnings=0`, `npm run typecheck`, and targeted tests for every PR.
- Use screenshots for UI-sensitive admin, property, auth, and calculator changes.

Exit criteria:

- No behavior changes in extraction-only PRs.
- No unrelated visual restyling mixed into structural cleanup.

### Phase 1: Shared Primitive Foundation

Goal: create the small shared pieces that future refactors can move toward.

Suggested PR scope:

- Add `SurfaceCard` or extend `BaseCard` with surface variants.
- Add `StateBlock` and migrate `EmptyState` to use it internally.
- Add typed `StatusBadge` variants.
- Add `SearchField`, `FilterChip`, and `FilterToolbar`.
- Add `FieldShell` and basic field wrappers.

Avoid in this phase:

- Large admin rewrites.
- Moving business logic.
- Re-theming the app.

Validation:

- Unit/component tests for reusable primitives where practical.
- Visual smoke check for pages that consume migrated primitives.

### Phase 2: AdminPortal Presentational Extraction

Goal: reduce `AdminPortal.tsx` size and isolate its implicit design system.

Suggested PR scope:

- Move local `MetricCard`, `SurfaceCard`, `SearchField`, `FilterChip`, `EmptyState`, and `FieldShell` equivalents into admin/shared or shared primitives.
- Extract entity list cards into `src/components/admin/portal/`.
- Extract entity inspectors into `src/components/admin/portal/`.
- Extract property, agent, and developer form field groups into `src/components/admin/forms/`.

Exit criteria:

- `AdminPortal.tsx` should drop below roughly 1,500 lines after the first extraction wave.
- No CRUD behavior changes.
- Existing admin interactions still work.

### Phase 3: Admin Table And Dialog Unification

Goal: remove parallel table/dialog implementations.

Suggested PR scope:

- Introduce `AdminTableShell`, `AdminTableToolbar`, `AdminRowActions`, and `AdminRecordFormDialog`.
- Migrate `AdminCrudPage.tsx` and `DynamicDataTable.tsx` gradually.
- Reduce card-in-card page composition inside `AdminShell`.

Exit criteria:

- Generic admin CRUD pages share the same toolbar, table frame, empty state, and dialog action layout.
- Admin pages do not wrap full page content in nested decorative cards unless there is a specific reason.

### Phase 4: Status, State, And Feedback Standardization

Goal: make the app speak one visual language for status and feedback.

Suggested PR scope:

- Migrate local empty states to `StateBlock`/`EmptyState` variants.
- Migrate import, appointment, property, unit, and DSR status UI to typed `StatusBadge` adapters.
- Standardize inline alerts for bulk import, auth, and profile errors.

Exit criteria:

- No feature area hand-rolls a new status color map unless it has a typed adapter.
- Empty/loading/error UI has consistent density variants for table, list, modal, and full-page contexts.

### Phase 5: Calculator Tool Kit

Goal: make finance tools consistent and easier to extend.

Suggested PR scope:

- Add `CalculatorShell`, `CalculatorSection`, `SliderNumberField`, `CalculatorMetricCard`, and `BreakdownRow`.
- Migrate `MortgageCalculator.tsx` first.
- Migrate `DSRCalculator.tsx` second.
- Keep calculation hooks and business logic unchanged.

Exit criteria:

- Mortgage and DSR calculators share controls, section framing, result rows, and metric cards.
- Tool-specific logic remains local or in hooks, not hidden inside generic UI components.

### Phase 6: Property And Unit Availability Components

Goal: align public property views and admin unit workflows.

Suggested PR scope:

- Extract unit status theme, legend, summary chips, tower grid, and detail panel from `UnitAvailabilityChart.tsx`.
- Share unit status primitives with `src/app/admin/units/page.tsx`.
- Extract property spec tiles for card/detail reuse.

Exit criteria:

- Public and admin unit states use the same status vocabulary.
- Property listing and detail pages share core spec and media primitives.

### Phase 7: Auth And Profile Flow Cleanup

Goal: reduce duplicated auth/profile step UI without changing authentication behavior.

Suggested PR scope:

- Extract `AuthStepShell`, `PhoneNumberField`, `OtpEntryStep`, and `TermsGate`.
- Migrate repeated sign-in/sign-up phone and OTP UI.
- Keep better-auth, OTP, and role redirect logic untouched unless a separate auth task approves it.

Exit criteria:

- Sign-in and sign-up share common phone/OTP/terms UI.
- Auth business rules remain unchanged.

## PR Sizing Rules

Each cleanup PR should follow these limits unless there is a strong reason:

- Prefer fewer than 15 touched files.
- Prefer fewer than 700 changed lines.
- Keep one domain per PR.
- Avoid mixing extraction, restyling, and behavior changes.
- If a PR changes shared primitives, migrate only one or two consumers in the same PR.

## Test Strategy

Minimum checks for every cleanup PR:

```bash
npm run format:check
npm run lint -- --max-warnings=0
npm run typecheck
npm run test
```

Run `npm run build` for any PR that touches App Router pages, server/client boundaries, imports, or shared components used by routes.

Add or update focused tests when:

- a shared component has conditional rendering,
- a form primitive owns validation/error display,
- a table/dialog abstraction changes user interaction,
- a calculator control changes input formatting or numeric value flow.

Use Playwright or manual screenshot checks for:

- admin dashboard and CRUD pages,
- property listing and detail pages,
- auth sign-in/sign-up flows,
- calculators,
- unit availability views.

## Suggested Branch Sequence

Start each branch from latest `staging` until this cleanup cycle is accepted:

```bash
git checkout staging
git pull origin staging
git checkout -b ai/component-primitives
```

Suggested branch order:

1. `ai/component-cleanup-plan`
2. `ai/component-primitives`
3. `ai/admin-portal-extraction`
4. `ai/admin-table-unification`
5. `ai/status-state-standardization`
6. `ai/calculator-toolkit`
7. `ai/property-unit-components`
8. `ai/auth-profile-flow-cleanup`

## Definition Of Done

The cleanup program is successful when:

- large components are decomposed into readable route/domain components,
- `AdminPortal.tsx`, `AdminCrudPage.tsx`, calculators, and unit availability are smaller and easier to reason about,
- shared primitives are used consistently across admin, public, auth, profile, and tools,
- component folders have clear ownership,
- CI/local gates remain clean,
- no product behavior changes are introduced without explicit feature approval.
