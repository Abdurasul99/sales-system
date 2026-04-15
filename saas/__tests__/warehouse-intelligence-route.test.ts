import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockGetSessionFromRequest = vi.fn();

const prismaMock = {
  branch: {
    findFirst: vi.fn(),
  },
  inventory: {
    findMany: vi.fn(),
  },
  saleItem: {
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: mockGetSessionFromRequest,
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
}));

function createGetRequest(url: string) {
  return new Request(url, { method: "GET" }) as NextRequest;
}

describe("warehouse intelligence route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized requests", async () => {
    mockGetSessionFromRequest.mockResolvedValue(null);
    const { GET } = await import("@/app/api/warehouse/intelligence/route");

    const response = await GET(createGetRequest("http://localhost/api/warehouse/intelligence"));

    expect(response.status).toBe(401);
  });

  it("returns summary counts and replenishment suggestions", async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      organizationId: "org-1",
      userId: "user-1",
    });
    prismaMock.inventory.findMany.mockResolvedValue([
      {
        id: "inv-1",
        quantity: 0,
        reservedQty: 0,
        branch: { id: "branch-1", name: "Main" },
        product: {
          id: "product-1",
          name: "Out product",
          sku: "OUT-1",
          barcode: null,
          unit: "pcs",
          costPrice: 10,
          sellingPrice: 20,
          minStockLevel: 1,
          safetyStockLevel: 2,
          reorderPoint: 5,
          targetStockLevel: 20,
          leadTimeDays: 3,
          category: { name: "Cat" },
        },
      },
      {
        id: "inv-2",
        quantity: 6,
        reservedQty: 0,
        branch: { id: "branch-1", name: "Main" },
        product: {
          id: "product-2",
          name: "Reorder product",
          sku: "ROP-1",
          barcode: null,
          unit: "pcs",
          costPrice: 15,
          sellingPrice: 30,
          minStockLevel: 2,
          safetyStockLevel: 3,
          reorderPoint: 10,
          targetStockLevel: 25,
          leadTimeDays: 5,
          category: { name: "Cat" },
        },
      },
      {
        id: "inv-3",
        quantity: 90,
        reservedQty: 0,
        branch: { id: "branch-2", name: "Branch 2" },
        product: {
          id: "product-3",
          name: "Overstock product",
          sku: "OVR-1",
          barcode: null,
          unit: "pcs",
          costPrice: 12,
          sellingPrice: 25,
          minStockLevel: 2,
          safetyStockLevel: 2,
          reorderPoint: 8,
          targetStockLevel: 30,
          leadTimeDays: 2,
          category: { name: "Cat" },
        },
      },
    ]);
    prismaMock.saleItem.findMany.mockResolvedValue([
      {
        productId: "product-2",
        quantity: 30,
        sale: { branchId: "branch-1", createdAt: new Date("2026-04-01T10:00:00Z") },
      },
      {
        productId: "product-3",
        quantity: 6,
        sale: { branchId: "branch-2", createdAt: new Date("2026-04-01T10:00:00Z") },
      },
    ]);

    const { GET } = await import("@/app/api/warehouse/intelligence/route");

    const response = await GET(
      createGetRequest("http://localhost/api/warehouse/intelligence?days=30")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary.totalSkus).toBe(3);
    expect(body.summary.outOfStockCount).toBe(1);
    expect(body.summary.reorderCount).toBe(1);
    expect(body.summary.overstockCount).toBe(1);
    expect(body.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ productId: "product-1", stockStatus: "OUT_OF_STOCK" }),
        expect.objectContaining({ productId: "product-2", stockStatus: "REORDER" }),
      ])
    );
  });
});
