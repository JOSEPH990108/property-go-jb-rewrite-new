# AI Agent Workflow

This workflow defines how AI agents collaborate in PropertyGo JB like a real software development team. It applies to new requirements, feature work, architecture changes, integration work, and meaningful refactors.

## Operating Principle

The AI system must complete planning, decision review, implementation, testing, code review, and environment readiness before human UAT. Human testers receive a PR into `staging` only after the workflow reaches `AI_READY_FOR_STAGING_UAT`.

## Stage Flow

1. **Idea Intake**: The user gives a rough idea. The Project Manager AI Agent expands it into an initial problem statement, affected users, business goals, known constraints, and unknowns.
2. **Product Requirement Planning**: The Project Manager AI Agent creates requirements, user stories, user flows, edge cases, risks, assumptions, task breakdown, dependencies, and handoff notes.
3. **UI/UX Planning**: The UI/UX AI Agent creates page structure, component plan, responsive behavior, UI states, interaction notes, and reference screenshot analysis when references exist.
4. **Database Planning**: The Database Design AI Agent creates schema proposals, relationships, Drizzle notes, migration notes, constraints, indexes, seed notes, and scalability risks.
5. **Decision Review**: The Decision AI Agent reviews Stage 2, Stage 3, and Stage 4. Rejected work returns to the relevant agent. Approved work advances.
6. **Development Planning**: The Developer AI Agent creates an implementation plan, file/module map, reusable service strategy, provider/interface plan, and testing plan.
7. **Implementation**: The Developer AI Agent implements only approved tasks with scoped, reusable, typed changes.
8. **AI Testing**: The QA/Test Strategy AI Agent validates coverage. The Developer AI Agent or Tester AI Agent runs applicable checks.
9. **AI Code Review**: The Decision AI Agent reviews implementation quality, correctness, maintainability, security, and test readiness. Rejected work returns to the Developer AI Agent.
10. **Environment Readiness Review**: The Security & Environment AI Agent verifies local/staging/preprod/production separation, secrets handling, provider abstraction, and integration readiness.
11. **Final Completion Report**: The responsible agent summarizes changes, files, risks, tests, and next steps. Mark `AI_READY_FOR_STAGING_UAT` only if every gate passes.
12. **Pull Request to Staging**: The Release Manager AI Agent creates or prepares a PR from the feature branch into `staging` for human UAT.

## Loop Rules

Rejected work must include:

- `REJECTED_NEEDS_IMPROVEMENT`.
- What failed.
- Why it failed.
- Which agent must fix it.
- Exact improvement instructions.
- Required output after improvement.

Approved work must include `APPROVED_FOR_NEXT_STAGE` and the scorecard from `docs/DECISION_GATE_RULES.md`.

## Completion Rule

Use `AI_READY_FOR_STAGING_UAT` only when planning, implementation, tests, code review, and environment readiness are complete. Otherwise use `NOT_READY_NEEDS_IMPROVEMENT`.
