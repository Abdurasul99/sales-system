# Release Gates

Release readiness is fail-closed.

## Mandatory Checks

Every release candidate must pass:
- `lint`
- `typecheck`
- `test:unit`
- `test:integration`
- `test:e2e`
- `verify`
- `release:check`

## Required Evidence

The repository must contain:
- `saas/.meta/feature-intake.md`
- `saas/.meta/task-graph.md`
- `saas/.release/review.json`

The review record must confirm:
- schema validation passed when schema changed
- API validation passed when API paths changed
- UI smoke validation passed when pages or components changed
- unit tests passed
- integration tests passed
- smoke validation passed
- RBAC review completed when authorization changed
- audit log review completed when critical mutations changed
- tenant isolation review completed when tenant-aware behavior changed
- branch isolation review completed when branch-aware behavior changed
- inventory integrity review completed when stock logic changed
- financial integrity review completed when money logic changed

## Prohibited Shortcuts

- no `prisma db push` in normal delivery workflows
- no schema mutation during build
- no production-readiness claim without evidence files
- no skipped verification silently marked as passed
