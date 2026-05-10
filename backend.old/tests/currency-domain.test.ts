import { describe, expect, it } from "vitest";

import {
  calculateExchangeDifference,
  convertFromBase,
  convertToBase
} from "../src/modules/currencies/currency-domain";

describe("currency domain", () => {
  it("converts sale amount to base currency", () => {
    expect(convertToBase(100, 12650)).toBe(1265000);
  });

  it("converts from base into transaction currency", () => {
    expect(convertFromBase(1265000, 12650)).toBe(100);
  });

  it("captures exchange difference between expected and actual settlement", () => {
    expect(calculateExchangeDifference(1265000, 1270000)).toBe(5000);
  });
});
