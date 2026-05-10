import { PrismaClient } from "@prisma/client";

export class ReturnsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listReturnOrders(organizationId: string) {
    return this.prisma.returnOrder.findMany({
      where: { organizationId },
      include: {
        salesOrder: true,
        lines: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
