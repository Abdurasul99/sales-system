import { describe, it, expect } from "vitest";
import {
  formatUzs,
  slugify,
  generateReceiptNumber,
  calcProfit,
  calcProfitMargin,
} from "@/lib/utils";

describe("formatUzs", () => {
  it("formats positive numbers", () => {
    expect(formatUzs(1000000)).toContain("1");
    expect(formatUzs(1000000)).toContain("сум");
  });

  it("handles null/undefined as 0", () => {
    expect(formatUzs(null)).toBe("0 сум");
    expect(formatUzs(undefined)).toBe("0 сум");
  });

  it("handles string numbers", () => {
    expect(formatUzs("500")).toContain("500");
  });
});

describe("slugify", () => {
  it("converts to lowercase with dashes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes non-ASCII special characters", () => {
    // Cyrillic and & are stripped, spaces collapse to dash then trimmed
    expect(slugify("Кофе & Чай")).toBe("");
  });

  it("collapses multiple spaces/dashes", () => {
    expect(slugify("a  b  c")).toBe("a-b-c");
  });

  it("trims leading/trailing dashes", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });
});

describe("generateReceiptNumber", () => {
  it("includes prefix", () => {
    expect(generateReceiptNumber("CHK")).toMatch(/^CHK-/);
  });

  it("generates unique values", () => {
    const a = generateReceiptNumber();
    const b = generateReceiptNumber();
    expect(a).not.toBe(b);
  });

  it("uses default prefix RCP", () => {
    expect(generateReceiptNumber()).toMatch(/^RCP-/);
  });
});

describe("calcProfit", () => {
  it("returns revenue minus cost", () => {
    expect(calcProfit(1000, 600)).toBe(400);
  });

  it("returns negative when cost exceeds revenue", () => {
    expect(calcProfit(500, 700)).toBe(-200);
  });

  it("returns 0 when equal", () => {
    expect(calcProfit(1000, 1000)).toBe(0);
  });
});

describe("calcProfitMargin", () => {
  it("calculates correct margin", () => {
    expect(calcProfitMargin(1000, 600)).toBe(40);
  });

  it("returns 0 when revenue is 0", () => {
    expect(calcProfitMargin(0, 500)).toBe(0);
  });

  it("returns 100 when cost is 0", () => {
    expect(calcProfitMargin(1000, 0)).toBe(100);
  });

  it("handles rounding to 1 decimal", () => {
    expect(calcProfitMargin(3, 1)).toBe(66.7);
  });
});
