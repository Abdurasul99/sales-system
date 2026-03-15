import { describe, it, expect } from "vitest";

// Sales POS cart calculation logic (mirrors SalesPOS component)
function calcCartTotals(
  cart: Array<{ lineTotal: number }>,
  globalDiscount: number,
  discountType: "PERCENTAGE" | "FIXED"
) {
  const subtotal = cart.reduce((sum, i) => sum + i.lineTotal, 0);
  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * globalDiscount) / 100
      : globalDiscount;
  const total = Math.max(0, subtotal - discountAmount);
  return { subtotal, discountAmount, total };
}

describe("Cart total calculation", () => {
  const cart = [
    { lineTotal: 100_000 },
    { lineTotal: 200_000 },
  ];

  it("subtotal is sum of lineTotals", () => {
    const { subtotal } = calcCartTotals(cart, 0, "PERCENTAGE");
    expect(subtotal).toBe(300_000);
  });

  it("percentage discount is applied correctly", () => {
    const { discountAmount, total } = calcCartTotals(cart, 10, "PERCENTAGE");
    expect(discountAmount).toBe(30_000);
    expect(total).toBe(270_000);
  });

  it("fixed discount is applied correctly", () => {
    const { discountAmount, total } = calcCartTotals(cart, 50_000, "FIXED");
    expect(discountAmount).toBe(50_000);
    expect(total).toBe(250_000);
  });

  it("total is never negative (max discount)", () => {
    const { total } = calcCartTotals(cart, 500_000, "FIXED");
    expect(total).toBe(0);
  });

  it("100% discount results in 0 total", () => {
    const { total } = calcCartTotals(cart, 100, "PERCENTAGE");
    expect(total).toBe(0);
  });

  it("empty cart results in 0", () => {
    const { subtotal, total } = calcCartTotals([], 0, "PERCENTAGE");
    expect(subtotal).toBe(0);
    expect(total).toBe(0);
  });
});

// Inventory deduction logic
describe("Inventory deduction", () => {
  function deductInventory(currentQty: number, soldQty: number): number {
    return Math.max(0, currentQty - soldQty);
  }

  it("deducts quantity correctly", () => {
    expect(deductInventory(100, 30)).toBe(70);
  });

  it("does not go below 0", () => {
    expect(deductInventory(5, 10)).toBe(0);
  });

  it("handles exact deduction", () => {
    expect(deductInventory(10, 10)).toBe(0);
  });
});

// Trial days remaining calculation
describe("Trial days remaining", () => {
  function trialDaysLeft(trialEndsAt: Date, now: Date): number {
    return Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000));
  }

  it("returns correct days remaining", () => {
    const now = new Date("2026-01-01");
    const endsAt = new Date("2026-01-31");
    expect(trialDaysLeft(endsAt, now)).toBe(30);
  });

  it("returns 0 when trial has expired", () => {
    const now = new Date("2026-02-01");
    const endsAt = new Date("2026-01-31");
    expect(trialDaysLeft(endsAt, now)).toBe(0);
  });

  it("returns 1 for last day", () => {
    const now = new Date("2026-01-31T00:00:00Z");
    const endsAt = new Date("2026-01-31T23:59:59Z");
    expect(trialDaysLeft(endsAt, now)).toBe(1);
  });
});
