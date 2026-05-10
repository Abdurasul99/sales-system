# Sales System Repository Contract

## Primary Product

The canonical product in this repository is the business SaaS application in `saas/`.

That application is the source of truth for:
- ERP and CRM domain logic
- web UI and API routes
- Prisma schema and database migrations
- test, verification, and release gates

## Secondary Boundary

Automation assets live under `automation/`.

They are intentionally separated from the product application so the repository has one clear product identity. Automation code may support operations, workflow experiments, or integrations, but it must not redefine:
- the product stack
- the product domain model
- deployment rules for `saas/`

## Engineering Direction

All future feature work should treat `saas/` as the only production application and must follow the rules in `AGENTS.md`, `release-gates.md`, and the task graph workflow under `saas/.meta/`.

## Operational Entry Points

- Product app: `saas/`
- Automation boundary: `automation/`
- Repository rules: `AGENTS.md`
- Domain reference: `domain-map.md`
- Delivery sequencing: `module-roadmap.md`
- Release enforcement: `release-gates.md`
