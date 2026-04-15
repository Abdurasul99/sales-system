import { describe, expect, it } from "vitest";
import {
  parseTaskGraph,
  validateFeatureIntake,
  validateReleaseReview,
  validateTaskGraph,
} from "@/lib/release/gates";

describe("release gates", () => {
  it("fails when feature intake still contains placeholders", () => {
    expect(
      validateFeatureIntake(`
- User goal: REPLACE-ME
- Business outcome: REPLACE-ME
- In scope: REPLACE-ME
- Out of scope: REPLACE-ME
- Impacted domains: REPLACE-ME
- Impacted routes/pages: REPLACE-ME
- Schema impact: REPLACE-ME
- Tenant impact: REPLACE-ME
- Branch impact: REPLACE-ME
- Stock or financial impact: REPLACE-ME
- Required validation: REPLACE-ME
`),
    ).toEqual(expect.arrayContaining(["Feature intake still contains template placeholders."]));
  });

  it("fails when the task graph still contains placeholders", () => {
    const rows = parseTaskGraph(`
| Task ID | Owner | Domain | Module | Depends On | Status | Verification | Retry Budget | Done Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TEMPLATE-ONLY | REPLACE-ME | REPLACE-ME | inventory | none | PENDING | REPLACE-ME | REPLACE-ME | REPLACE-ME |
`);

    expect(validateTaskGraph(rows)).toEqual(
      expect.arrayContaining([
        "Task graph still contains template placeholders.",
        "Task TEMPLATE-ONLY is not complete.",
        "Task TEMPLATE-ONLY is missing verification evidence.",
        "Task TEMPLATE-ONLY is missing retry budget.",
        "Task TEMPLATE-ONLY is missing done criteria.",
      ]),
    );
  });

  it("accepts completed task rows with verification evidence", () => {
    const rows = parseTaskGraph(`
| Task ID | Owner | Domain | Module | Depends On | Status | Verification | Retry Budget | Done Criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-001 | backend | inventory | replenishment | SALES-001 | DONE | test:integration,smoke | 2 | api, ui, and stock integrity verified |
`);

    expect(validateTaskGraph(rows)).toEqual([]);
  });

  it("fails release review when required gates are missing", () => {
    const errors = validateReleaseReview({
      schemaChanged: true,
      schemaValidated: false,
      migrationPresent: false,
      apiChanged: true,
      apiValidated: false,
      uiChanged: true,
      uiValidated: false,
      unitTestsPassed: true,
      integrationTestsPassed: false,
      smokeValidated: false,
      authorizationChanged: true,
      rbacReviewed: false,
      criticalMutationChanged: true,
      auditLogReviewed: false,
      tenantImpact: true,
      tenantIsolationReviewed: false,
      branchImpact: true,
      branchIsolationReviewed: false,
      inventoryImpact: true,
      inventoryIntegrityReviewed: false,
      financialImpact: true,
      financialIntegrityReviewed: false,
      openRisks: ["missing smoke validation"],
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "Schema changed but schema validation is not complete.",
        "Schema changed but no migration is recorded.",
        "API changed but API validation is not complete.",
        "UI changed but UI validation is not complete.",
        "Integration tests are not marked as passed.",
        "Smoke or e2e validation is not marked as passed.",
        "RBAC review is required but not completed.",
        "Audit log review is required but not completed.",
        "Tenant isolation review is required but not completed.",
        "Branch isolation review is required but not completed.",
        "Inventory integrity review is required but not completed.",
        "Financial integrity review is required but not completed.",
        "Open risks remain: missing smoke validation",
      ]),
    );
  });
});
