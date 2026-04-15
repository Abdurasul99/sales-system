import { describe, expect, it } from "vitest";
import {
  calculateAverageDailySales,
  calculateStockHealth,
} from "@/lib/inventory/intelligence";

describe("calculateAverageDailySales", () => {
  it("divides recent demand by the selected time window", () => {
    expect(calculateAverageDailySales(90, 30)).toBe(3);
  });

  it("rounds to one decimal place", () => {
    expect(calculateAverageDailySales(10, 6)).toBe(1.7);
  });

  it("guards against invalid inputs", () => {
    expect(calculateAverageDailySales(-10, 0)).toBe(0);
  });
});

describe("calculateStockHealth", () => {
  it("marks empty stock as out of stock", () => {
    const result = calculateStockHealth({
      quantity: 0,
      reorderPoint: 12,
      targetStockLevel: 40,
    });

    expect(result.stockStatus).toBe("OUT_OF_STOCK");
    expect(result.suggestedReorderQty).toBe(40);
  });

  it("marks stock below safety stock as critical", () => {
    const result = calculateStockHealth({
      quantity: 4,
      minStockLevel: 5,
      safetyStockLevel: 6,
      reorderPoint: 10,
      targetStockLevel: 30,
      avgDailySales: 2,
      leadTimeDays: 5,
    });

    expect(result.stockStatus).toBe("CRITICAL");
    expect(result.dynamicReorderPoint).toBe(16);
    expect(result.suggestedReorderQty).toBeGreaterThan(0);
  });

  it("marks stock between safety and reorder point as reorder", () => {
    const result = calculateStockHealth({
      quantity: 18,
      safetyStockLevel: 8,
      reorderPoint: 20,
      targetStockLevel: 40,
      avgDailySales: 1,
      leadTimeDays: 5,
    });

    expect(result.stockStatus).toBe("REORDER");
    expect(result.suggestedReorderQty).toBe(22);
  });

  it("marks excessive stock as overstock", () => {
    const result = calculateStockHealth({
      quantity: 120,
      targetStockLevel: 50,
      reorderPoint: 20,
      avgDailySales: 1,
      leadTimeDays: 7,
    });

    expect(result.stockStatus).toBe("OVERSTOCK");
    expect(result.suggestedReorderQty).toBe(0);
  });

  it("calculates coverage days from available stock", () => {
    const result = calculateStockHealth({
      quantity: 30,
      reservedQty: 5,
      avgDailySales: 2.5,
      targetStockLevel: 50,
      reorderPoint: 12,
    });

    expect(result.availableQty).toBe(25);
    expect(result.coverageDays).toBe(10);
    expect(result.daysUntilStockout).toBe(10);
  });
});
