export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export type ReleaseReview = {
  schemaChanged: boolean;
  schemaValidated: boolean;
  migrationPresent: boolean;
  apiChanged: boolean;
  apiValidated: boolean;
  uiChanged: boolean;
  uiValidated: boolean;
  unitTestsPassed: boolean;
  integrationTestsPassed: boolean;
  smokeValidated: boolean;
  authorizationChanged: boolean;
  rbacReviewed: boolean;
  criticalMutationChanged: boolean;
  auditLogReviewed: boolean;
  tenantImpact: boolean;
  tenantIsolationReviewed: boolean;
  branchImpact: boolean;
  branchIsolationReviewed: boolean;
  inventoryImpact: boolean;
  inventoryIntegrityReviewed: boolean;
  financialImpact: boolean;
  financialIntegrityReviewed: boolean;
  openRisks: string[];
};

export type TaskGraphRow = {
  id: string;
  owner: string;
  domain: string;
  module: string;
  dependsOn: string;
  status: TaskStatus;
  verification: string;
  retryBudget: string;
  doneCriteria: string;
};

const ALLOWED_STATUSES = new Set<TaskStatus>(["PENDING", "IN_PROGRESS", "DONE", "BLOCKED"]);
const PLACEHOLDER_VALUE = "REPLACE-ME";

export function parseTaskGraph(markdown: string): TaskGraphRow[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 10)
    .map((cells) => ({
      id: cells[1],
      owner: cells[2],
      domain: cells[3],
      module: cells[4],
      dependsOn: cells[5],
      status: cells[6] as TaskStatus,
      verification: cells[7],
      retryBudget: cells[8],
      doneCriteria: cells[9],
    }))
    .filter((row) => row.id && row.id !== "Task ID" && !/^[-:]+$/.test(row.id));
}

export function validateTaskGraph(rows: TaskGraphRow[]): string[] {
  const errors: string[] = [];

  if (rows.length === 0) {
    errors.push("Task graph must contain at least one task row.");
    return errors;
  }

  for (const row of rows) {
    if (
      row.id === "TEMPLATE-ONLY" ||
      row.owner === PLACEHOLDER_VALUE ||
      row.domain === PLACEHOLDER_VALUE ||
      row.module === PLACEHOLDER_VALUE
    ) {
      errors.push("Task graph still contains template placeholders.");
    }
    if (!ALLOWED_STATUSES.has(row.status)) {
      errors.push(`Task ${row.id} has invalid status ${row.status}.`);
    }
    if (!row.domain) {
      errors.push(`Task ${row.id} is missing domain ownership.`);
    }
    if (!row.module) {
      errors.push(`Task ${row.id} is missing module ownership.`);
    }
    if (row.status !== "DONE") {
      errors.push(`Task ${row.id} is not complete.`);
    }
    if (!row.verification || row.verification === PLACEHOLDER_VALUE) {
      errors.push(`Task ${row.id} is missing verification evidence.`);
    }
    if (!row.retryBudget || row.retryBudget === PLACEHOLDER_VALUE) {
      errors.push(`Task ${row.id} is missing retry budget.`);
    }
    if (!row.doneCriteria || row.doneCriteria === PLACEHOLDER_VALUE) {
      errors.push(`Task ${row.id} is missing done criteria.`);
    }
  }

  return errors;
}

export function validateFeatureIntake(markdown: string): string[] {
  const requiredSections = [
    "- User goal:",
    "- Business outcome:",
    "- In scope:",
    "- Out of scope:",
    "- Impacted domains:",
    "- Impacted routes/pages:",
    "- Schema impact:",
    "- Tenant impact:",
    "- Branch impact:",
    "- Stock or financial impact:",
    "- Required validation:",
  ];
  const errors: string[] = [];

  if (!markdown.trim()) {
    return ["Feature intake is empty."];
  }

  for (const section of requiredSections) {
    if (!markdown.includes(section)) {
      errors.push(`Feature intake is missing required section: ${section}`);
    }
  }

  if (markdown.includes(PLACEHOLDER_VALUE)) {
    errors.push("Feature intake still contains template placeholders.");
  }

  return errors;
}

export function validateReleaseReview(review: ReleaseReview): string[] {
  const errors: string[] = [];

  if (review.schemaChanged && !review.schemaValidated) {
    errors.push("Schema changed but schema validation is not complete.");
  }
  if (review.schemaChanged && !review.migrationPresent) {
    errors.push("Schema changed but no migration is recorded.");
  }
  if (review.apiChanged && !review.apiValidated) {
    errors.push("API changed but API validation is not complete.");
  }
  if (review.uiChanged && !review.uiValidated) {
    errors.push("UI changed but UI validation is not complete.");
  }
  if (!review.unitTestsPassed) {
    errors.push("Unit tests are not marked as passed.");
  }
  if (!review.integrationTestsPassed) {
    errors.push("Integration tests are not marked as passed.");
  }
  if (!review.smokeValidated) {
    errors.push("Smoke or e2e validation is not marked as passed.");
  }
  if (review.authorizationChanged && !review.rbacReviewed) {
    errors.push("RBAC review is required but not completed.");
  }
  if (review.criticalMutationChanged && !review.auditLogReviewed) {
    errors.push("Audit log review is required but not completed.");
  }
  if (review.tenantImpact && !review.tenantIsolationReviewed) {
    errors.push("Tenant isolation review is required but not completed.");
  }
  if (review.branchImpact && !review.branchIsolationReviewed) {
    errors.push("Branch isolation review is required but not completed.");
  }
  if (review.inventoryImpact && !review.inventoryIntegrityReviewed) {
    errors.push("Inventory integrity review is required but not completed.");
  }
  if (review.financialImpact && !review.financialIntegrityReviewed) {
    errors.push("Financial integrity review is required but not completed.");
  }
  if (review.openRisks.length > 0) {
    errors.push(`Open risks remain: ${review.openRisks.join(", ")}`);
  }

  return errors;
}
