import { describe, expect, it } from "vitest";

import { calculateSalesTotals } from "../src/modules/sales/sales-domain";

describe("sales domain", () => {
  it("calculates subtotal, order total, and margin", () => {
    const result = calculateSalesTotals(
      [
        { quantity: 2, unitPrice: 100, costPrice: 70, discount: 10 },
        { quantity: 1, unitPrice: 50, costPrice: 25, discount: 0 }
      ],
      5,
      15
    );

    expect(result.subtotal).toBe(250);
    expect(result.total).toBe(260);
    expect(result.marginAmount).toBe(75);
    expect(result.lines[0]?.total).toBe(190);
  });
});
