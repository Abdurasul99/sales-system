# AGENTS.md

## Product Identity

- The primary product is `saas/`.
- `automation/` is isolated support material, not the product.
- All architectural decisions must optimize for the long-term maintainability of `saas/`.
- This repository contains repository-side agent contracts and guardrails, not a built-in autonomous orchestrator runtime.

## Fixed Stack

- Next.js App Router
- React with TypeScript
- Prisma
- PostgreSQL
- Zod
- React Query
- Recharts

Do not switch the stack without an explicit migration decision recorded in the repository.

## Delivery Workflow

Every non-trivial change must produce or update:
- `saas/.meta/feature-intake.md`
- `saas/.meta/task-graph.md`
- `saas/.release/review.json`

The agent must also follow the repository prompt discipline in `prompt-contract.md`.

Each task must declare:
- owner
- domain
- affected modules
- dependencies
- verification steps
- retry budget
- completion status

Execution stages must remain explicit:
1. feature intake
2. task graph
3. implementation
4. validation
5. release review

Do not skip from request to implementation without updating planning artifacts.

## Database Rules

- Database changes must be migration-based.
- `prisma db push` is blocked for normal engineering workflows.
- Schema updates are incomplete until:
  - Prisma schema validates
  - a migration exists
  - impacted API paths are verified
  - tests covering the change pass

## Completion Gates

No feature is done until all relevant gates pass:
- schema validation
- API validation
- unit tests
- integration tests
- smoke or e2e validation
- RBAC review for permission-sensitive changes
- audit log review for critical mutations
- tenant isolation review for multi-tenant changes
- branch isolation review for branch-aware changes
- inventory or financial integrity review for stock and money flows

## File Boundaries

- Product code goes under `saas/`.
- Automation code goes under `automation/`.
- Shared repository operating documents stay at the repository root.
- Do not mix automation prompts or workflow assets into the `saas/` runtime.

## Safety Rules

- Fail closed when validation is missing.
- Do not silently rewrite or remove files.
- Do not claim release readiness unless `release:check` passes.
- Do not bypass tests to force completion.
- Do not mutate production schema during build or deploy.
- Do not mark ERP work done unless tenant, branch, audit, and integrity effects were considered.
