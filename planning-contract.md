# Planning Contract

This repository does not allow checklist-only execution for non-trivial work.

## Required Planning Artifacts

Every non-trivial change must update:
- `saas/.meta/feature-intake.md`
- `saas/.meta/task-graph.md`
- `saas/.release/review.json`

## Feature Intake Requirements

The feature intake must define:
- user goal
- business outcome
- in-scope changes
- out-of-scope changes
- impacted domains
- impacted routes, pages, and schema
- required validation layers

## Task Graph Requirements

Each task row must define:
- task ID
- owner
- domain
- module
- dependencies
- status
- verification evidence
- retry budget
- done criteria

## ERP Non-Negotiables

If a change touches inventory, sales, procurement, CRM, finance, or auth, the plan must explicitly state:
- tenant impact
- branch impact
- money or stock integrity impact
- audit logging expectations
- RBAC expectations

## Failure Rule

If the plan artifacts are missing or still contain placeholders, the work is not release-ready.
