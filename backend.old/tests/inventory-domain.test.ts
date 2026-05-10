import { describe, expect, it } from "vitest";

import {
  InventoryError,
  calculateAvailability,
  issueInventory,
  receiveInventory,
  reserveInventory
} from "../src/modules/inventory/inventory-domain";

describe("inventory domain", () => {
  it("calculates available stock after reservations", () => {
    expect(calculateAvailability({ onHand: 120, reserved: 20 })).toBe(100);
  });

  it("reserves stock only when there is enough available quantity", () => {
    const updated = reserveInventory({ onHand: 50, reserved: 10 }, 15);

    expect(updated).toEqual({ onHand: 50, reserved: 25 });
    expect(calculateAvailability(updated)).toBe(25);
  });

  it("throws when reservation exceeds available stock", () => {
    expect(() => reserveInventory({ onHand: 50, reserved: 45 }, 10)).toThrow(
      InventoryError
    );
  });

  it("receives stock into the warehouse", () => {
    expect(receiveInventory({ onHand: 4, reserved: 1 }, 8)).toEqual({
      onHand: 12,
      reserved: 1
    });
  });

  it("issues stock and releases linked reservation first", () => {
    expect(issueInventory({ onHand: 10, reserved: 3 }, 2)).toEqual({
      onHand: 8,
      reserved: 1
    });
  });
});
