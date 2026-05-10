"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsRepository = void 0;
class ReturnsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    listReturnOrders(organizationId) {
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
exports.ReturnsRepository = ReturnsRepository;
