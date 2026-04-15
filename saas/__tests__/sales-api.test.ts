import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mockGetSessionFromRequest = vi.fn();
const mockGenerateReceiptNumber = vi.fn(() => "CHK-TEST");

const prismaMock = {
  branch: {
    findFirst: vi.fn(),
  },
  inventory: {
    findMany: vi.fn(),
  },
  sale: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("@/lib/auth/session", () => ({
  getSessionFromRequest: mockGetSessionFromRequest,
}));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return {
    ...actual,
    generateReceiptNumber: mockGenerateReceiptNumber,
  };
});

vi.mock("@/lib/db/prisma", () => ({
  default: prismaMock,
}));

function createJsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("sales API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized sale creation", async () => {
    mockGetSessionFromRequest.mockResolvedValue(null);
    const { POST } = await import("@/app/api/sales/route");

    const response = await POST(
      createJsonRequest("http://localhost/api/sales", {
        paymentType: "CASH",
        items: [{ productId: "p1", quantity: 1 }],
      })
    );

    expect(response.status).toBe(401);
  });

  it("blocks overselling when combined demand exceeds available stock", async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      organizationId: "org-1",
      userId: "user-1",
      branchId: "branch-1",
    });
    prismaMock.branch.findFirst.mockResolvedValue({ id: "branch-1" });
    prismaMock.inventory.findMany.mockResolvedValue([
      { id: "inv-1", productId: "p1", quantity: 4, reservedQty: 1 },
    ]);

    const { POST } = await import("@/app/api/sales/route");

    const response = await POST(
      createJsonRequest("http://localhost/api/sales", {
        paymentType: "CASH",
        subtotal: 100,
        total: 100,
        items: [
          { productId: "p1", quantity: 2, unitPrice: 50, costPrice: 20, discount: 0, total: 50 },
          { productId: "p1", quantity: 2, unitPrice: 50, costPrice: 20, discount: 0, total: 50 },
        ],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Insufficient stock for one or more items");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("creates the sale and deducts exact stock when inventory is available", async () => {
    mockGetSessionFromRequest.mockResolvedValue({
      organizationId: "org-1",
      userId: "user-1",
      branchId: "branch-1",
    });
    prismaMock.branch.findFirst.mockResolvedValue({ id: "branch-1" });
    prismaMock.inventory.findMany.mockResolvedValue([
      { id: "inv-1", productId: "p1", quantity: 10, reservedQty: 2 },
    ]);

    const txMock = {
      sale: {
        create: vi.fn().mockResolvedValue({ id: "sale-1", receiptNumber: "CHK-TEST" }),
      },
      inventory: {
        update: vi.fn().mockResolvedValue({ id: "inv-1" }),
      },
      inventoryMovement: {
        create: vi.fn().mockResolvedValue({ id: "move-1" }),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));

    const { POST } = await import("@/app/api/sales/route");

    const response = await POST(
      createJsonRequest("http://localhost/api/sales", {
        paymentType: "CASH",
        subtotal: 600,
        total: 600,
        items: [
          { productId: "p1", quantity: 6, unitPrice: 100, costPrice: 70, discount: 0, total: 600 },
        ],
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.receiptNumber).toBe("CHK-TEST");
    expect(txMock.sale.create).toHaveBeenCalledOnce();
    expect(txMock.inventory.update).toHaveBeenCalledWith({
      where: { id: "inv-1" },
      data: { quantity: 4 },
    });
    expect(txMock.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        inventoryId: "inv-1",
        type: "OUT_SALE",
        quantity: 6,
        quantityBefore: 10,
        quantityAfter: 4,
        referenceId: "sale-1",
        referenceType: "SALE",
        createdBy: "user-1",
      }),
    });
  });
});
