# ERP Agent Playbook

## Why ERP Work Is Different

ERP and CRM changes are not isolated UI tasks. A single change can affect:
- tenant isolation
- branch isolation
- stock integrity
- financial integrity
- debt calculations
- auditability
- permissions

## Required Reasoning Sequence

Before implementation, the agent must identify:
1. domain modules affected
2. data contracts affected
3. user roles affected
4. stock or money movement side effects
5. audit requirements
6. verification layers needed

## Common Drift Risks

- changing UI without checking route contracts
- changing schema without migration discipline
- changing business rules without audit or RBAC review
- declaring analytics features done without source-of-truth validation
- treating multi-tenant data as global by accident

## Required Verification Mapping

- schema change -> Prisma validation + migration evidence + impacted API checks
- route change -> integration tests or route-level verification
- dashboard/page change -> smoke validation
- permission change -> RBAC review
- critical mutation -> audit review
- inventory or finance change -> integrity review
