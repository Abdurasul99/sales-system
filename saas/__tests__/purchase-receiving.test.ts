import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockGetSessionFromRequest = vi.fn();

const prismaMock = {
  purchase: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: mockGetSessionFromRequest,
}));

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
}));

function createJsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("purchase receiving route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized requests", async () => {
    mockGetSessionFromRequest.mockResolvedValue(null);
    const { PATCH } = await import("@/app/api/purchases/[id]/route");

    const response = await PATCH(
      createJsonRequest("http://localhost/api/purchases/purchase-1", {
        status: "RECEIVED",
      }),
      { params: { id: "purchase-1" } }
    );

    expect(response.status).toBe(401);
  });

  it("prevents duplicate receiving", async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      organizationId: "org-1",
      userId: "user-1",
    });
    prismaMock.purchase.findFirst.mockResolvedValue({
      id: "purchase-1",
      branchId: "branch-from-purchase",
      status: "RECEIVED",
    });

    const { PATCH } = await import("@/app/api/purchases/[id]/route");

    const response = await PATCH(
      createJsonRequest("http://localhost/api/purchases/purchase-1", {
        status: "RECEIVED",
      }),
      { params: { id: "purchase-1" } }
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Purchase is already received");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("creates missing inventory in the purchase branch and records movement on receive", async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      organizationId: "org-1",
      userId: "user-1",
      branchId: "user-branch-should-not-be-used",
    });
    prismaMock.purchase.findFirst.mockResolvedValue({
      id: "purchase-1",
      branchId: "branch-from-purchase",
      status: "PENDING",
    });

    const txMock = {
      purchase: {
        update: vi.fn().mockResolvedValue({ id: "purchase-1", status: "RECEIVED" }),
      },
      purchaseItem: {
        findMany: vi.fn().mockResolvedValue([{ productId: "product-1", quantity: 5 }]),
      },
      inventory: {
        findUnique: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
        create: vi.fn().mockResolvedValue({ id: "inventory-1" }),
      },
      inventoryMovement: {
        create: vi.fn().mockResolvedValue({ id: "movement-1" }),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

    const { PATCH } = await import("@/app/api/purchases/[id]/route");

    const response = await PATCH(
      createJsonRequest("http://localhost/api/purchases/purchase-1", {
        status: "RECEIVED",
      }),
      { params: { id: "purchase-1" } }
    );

    expect(response.status).toBe(200);
    expect(txMock.inventory.create).toHaveBeenCalledWith({
      data: {
        productId: "product-1",
        branchId: "branch-from-purchase",
        quantity: 5,
      },
    });
    expect(txMock.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        inventoryId: "inventory-1",
        type: "IN_PURCHASE",
        quantity: 5,
        quantityBefore: 0,
        quantityAfter: 5,
        referenceId: "purchase-1",
        referenceType: "PURCHASE",
        createdBy: "user-1",
      }),
    });
  });
});
