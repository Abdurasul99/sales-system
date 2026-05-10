# Task Graph

Update this file for every non-trivial feature or refactor.

| Task ID | Owner | Domain | Module | Depends On | Status | Verification | Retry Budget | Done Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REPO-001 | platform | repository-governance | repository-contract | none | DONE | root docs updated, automation moved under automation/ | 1 | canonical product path and repo identity are explicit |
| REPO-002 | platform | planning | operating-docs | REPO-001 | DONE | AGENTS.md, domain-map.md, module-roadmap.md, release-gates.md, planning-contract.md, erp-agent-playbook.md | 1 | planning and ERP safety expectations are documented |
| REPO-003 | platform | planning | feature-intake-and-task-graph | REPO-002 | DONE | npm run plan:check | 2 | planning artifacts validate without placeholders |
| REPO-004 | platform | release-engineering | build-and-verification | REPO-003 | DONE | npm run lint, npm run typecheck, npm run test:unit, npm run test:integration | 2 | deterministic verification passes from repo entrypoints |
| REPO-005 | platform | release-engineering | database-and-release-gates | REPO-004 | DONE | npm run db:validate, npm run test:e2e, npm run release:check | 2 | release pipeline fails only on real open risks |
