import { describe, expect, it } from "vitest";

import {
  buildReplenishmentRecommendation,
  calculateEOQ,
  calculateReorderPoint,
  classifyAbc
} from "../src/modules/analytics/replenishment-domain";

describe("replenishment analytics", () => {
  it("classifies high-revenue products into ABC buckets", () => {
    const result = classifyAbc([
      { productCode: "A-100", annualRevenue: 8000 },
      { productCode: "B-200", annualRevenue: 1500 },
      { productCode: "C-300", annualRevenue: 500 }
    ]);

    expect(result[0]?.bucket).toBe("A");
    expect(result[1]?.bucket).toBe("B");
    expect(result[2]?.bucket).toBe("C");
  });

  it("computes EOQ using the classic Wilson formula", () => {
    expect(
      calculateEOQ({
        annualDemand: 1200,
        orderingCost: 25,
        annualHoldingCost: 4
      })
    ).toBe(122.47);
  });

  it("calculates reorder point from demand, lead time, and safety stock", () => {
    expect(
      calculateReorderPoint({
        averageDailyDemand: 8,
        leadTimeDays: 5,
        safetyStock: 12
      })
    ).toBe(52);
  });

  it("suggests a reorder when available stock falls below reorder point", () => {
    expect(
      buildReplenishmentRecommendation({
        availableStock: 20,
        averageDailyDemand: 6,
        leadTimeDays: 5,
        safetyStock: 10,
        eoq: 80
      })
    ).toEqual({
      reorderPoint: 40,
      suggestedOrderQty: 80,
      needsReorder: true
    });
  });
});
