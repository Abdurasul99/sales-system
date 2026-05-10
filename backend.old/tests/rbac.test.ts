import { describe, expect, it } from "vitest";

import { getRolePermissions, hasPermission } from "../src/modules/auth/rbac";

describe("RBAC permission templates", () => {
  it("gives owner full access to finance and automation", () => {
    const ownerPermissions = getRolePermissions("OWNER");

    expect(hasPermission(ownerPermissions, "finance.write")).toBe(true);
    expect(hasPermission(ownerPermissions, "automation.manage")).toBe(true);
  });

  it("does not let sales manager approve purchases", () => {
    const salesPermissions = getRolePermissions("SALES_MANAGER");

    expect(hasPermission(salesPermissions, "sales.write")).toBe(true);
    expect(hasPermission(salesPermissions, "purchase.approve")).toBe(false);
  });

  it("keeps viewer read-only", () => {
    const viewerPermissions = getRolePermissions("VIEWER");

    expect(hasPermission(viewerPermissions, "analytics.read")).toBe(true);
    expect(hasPermission(viewerPermissions, "sales.write")).toBe(false);
  });
});
