export const PERMISSIONS = [
  "organization.manage",
  "company.manage",
  "branch.manage",
  "warehouse.manage",
  "role.manage",
  "user.manage",
  "catalog.manage",
  "customer.manage",
  "supplier.manage",
  "crm.manage",
  "sales.read",
  "sales.write",
  "sales.approve",
  "purchase.read",
  "purchase.write",
  "purchase.approve",
  "inventory.read",
  "inventory.write",
  "inventory.reserve",
  "finance.read",
  "finance.write",
  "analytics.read",
  "documents.manage",
  "automation.manage"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const SYSTEM_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: [...PERMISSIONS],
  GENERAL_MANAGER: [
    "company.manage",
    "branch.manage",
    "warehouse.manage",
    "catalog.manage",
    "customer.manage",
    "supplier.manage",
    "crm.manage",
    "sales.read",
    "sales.write",
    "sales.approve",
    "purchase.read",
    "purchase.write",
    "purchase.approve",
    "inventory.read",
    "inventory.write",
    "inventory.reserve",
    "finance.read",
    "analytics.read",
    "documents.manage"
  ],
  SALES_MANAGER: [
    "customer.manage",
    "crm.manage",
    "sales.read",
    "sales.write",
    "inventory.read",
    "inventory.reserve",
    "documents.manage",
    "analytics.read"
  ],
  PROCUREMENT_MANAGER: [
    "supplier.manage",
    "purchase.read",
    "purchase.write",
    "purchase.approve",
    "inventory.read",
    "inventory.write",
    "catalog.manage",
    "analytics.read",
    "documents.manage"
  ],
  WAREHOUSE_MANAGER: [
    "warehouse.manage",
    "inventory.read",
    "inventory.write",
    "inventory.reserve",
    "catalog.manage",
    "documents.manage"
  ],
  FINANCE_MANAGER: [
    "finance.read",
    "finance.write",
    "sales.read",
    "purchase.read",
    "analytics.read",
    "documents.manage"
  ],
  ACCOUNTANT: [
    "finance.read",
    "sales.read",
    "purchase.read",
    "analytics.read"
  ],
  OPERATOR: [
    "sales.read",
    "sales.write",
    "purchase.read",
    "inventory.read"
  ],
  VIEWER: ["analytics.read", "sales.read", "purchase.read", "inventory.read"]
};

export function getRolePermissions(roleCode: string): Permission[] {
  return SYSTEM_ROLE_PERMISSIONS[roleCode] ?? [];
}

export function hasPermission(userPermissions: string[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission);
}
