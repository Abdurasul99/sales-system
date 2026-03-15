import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Rate limiter logic (extracted for testing) ---

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string, now = Date.now()): boolean {
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

describe("Login rate limiter", () => {
  beforeEach(() => {
    loginAttempts.clear();
  });

  it("allows first attempt", () => {
    expect(checkRateLimit("1.2.3.4")).toBe(true);
  });

  it("allows up to RATE_LIMIT attempts", () => {
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect(checkRateLimit("1.2.3.4")).toBe(true);
    }
  });

  it("blocks after RATE_LIMIT attempts", () => {
    for (let i = 0; i < RATE_LIMIT; i++) checkRateLimit("5.5.5.5");
    expect(checkRateLimit("5.5.5.5")).toBe(false);
  });

  it("resets after window expires", () => {
    const ip = "6.6.6.6";
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) checkRateLimit(ip, now);
    // After window passes
    const futureNow = now + RATE_WINDOW_MS + 1;
    expect(checkRateLimit(ip, futureNow)).toBe(true);
  });

  it("tracks different IPs independently", () => {
    for (let i = 0; i < RATE_LIMIT; i++) checkRateLimit("7.7.7.7");
    expect(checkRateLimit("7.7.7.7")).toBe(false);
    expect(checkRateLimit("8.8.8.8")).toBe(true); // different IP not blocked
  });
});

// --- Discount clamping logic ---

describe("Discount clamping", () => {
  function clampDiscount(val: number, type: "PERCENTAGE" | "FIXED"): number {
    if (type === "PERCENTAGE") return Math.min(100, Math.max(0, val));
    return Math.max(0, val);
  }

  it("clamps percentage to 0-100", () => {
    expect(clampDiscount(-10, "PERCENTAGE")).toBe(0);
    expect(clampDiscount(150, "PERCENTAGE")).toBe(100);
    expect(clampDiscount(50, "PERCENTAGE")).toBe(50);
  });

  it("clamps fixed to >= 0", () => {
    expect(clampDiscount(-500, "FIXED")).toBe(0);
    expect(clampDiscount(999999, "FIXED")).toBe(999999);
  });
});

// --- closingBalance validation ---

describe("Closing balance validation", () => {
  function validateClosingBalance(val: unknown): boolean {
    const n = Number(val ?? 0);
    return !isNaN(n) && n >= 0;
  }

  it("accepts valid numbers", () => {
    expect(validateClosingBalance(0)).toBe(true);
    expect(validateClosingBalance(50000)).toBe(true);
  });

  it("rejects NaN", () => {
    expect(validateClosingBalance("abc")).toBe(false);
  });

  it("rejects negative", () => {
    expect(validateClosingBalance(-100)).toBe(false);
  });

  it("accepts null/undefined as 0", () => {
    expect(validateClosingBalance(null)).toBe(true);
    expect(validateClosingBalance(undefined)).toBe(true);
  });
});

// --- Amount validation (FinanceTable) ---

describe("Finance amount validation", () => {
  function isValidAmount(val: string): boolean {
    const n = parseFloat(val);
    return !isNaN(n) && n > 0;
  }

  it("accepts valid positive number", () => {
    expect(isValidAmount("1000")).toBe(true);
    expect(isValidAmount("0.5")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidAmount("")).toBe(false);
  });

  it("rejects alphabetic input", () => {
    expect(isValidAmount("abc")).toBe(false);
  });

  it("rejects zero", () => {
    expect(isValidAmount("0")).toBe(false);
  });

  it("rejects negative", () => {
    expect(isValidAmount("-500")).toBe(false);
  });
});
