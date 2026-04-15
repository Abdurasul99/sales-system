# Feature Intake

Update this file before or during every non-trivial change.

- User goal: audit the repository and harden the AI engineering workflow so ERP work is more reliable and less drift-prone.
- Business outcome: convert soft planning and release rules into enforced contracts that the agent must satisfy before claiming completion.
- In scope: planning artifacts, release evidence, deterministic scripts, repository rules, ERP-oriented delivery guidance, and validation logic.
- Out of scope: full RBAC rewrite, deep domain feature expansion, dependency vulnerability remediation, and external deployment changes.
- Impacted domains: platform, release engineering, planning workflow, multi-tenant ERP delivery discipline.
- Impacted routes/pages: none directly in the product runtime; validation scripts and governance docs only.
- Schema impact: none to the Prisma domain schema; only migration governance and release validation behavior changed.
- Tenant impact: indirect; new rules now require explicit tenant review when future work changes tenant-aware behavior.
- Branch impact: indirect; new rules now require explicit branch review when future work changes branch-aware behavior.
- Stock or financial impact: indirect; new rules now require integrity review when future work changes inventory or money flows.
- Required validation: plan:check, db:validate, lint, typecheck, test:unit, test:integration, test:e2e, release:check.
