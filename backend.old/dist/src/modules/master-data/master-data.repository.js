"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDataRepository = void 0;
class MasterDataRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBootstrap(organizationId) {
        return Promise.all([
            this.prisma.company.findMany({
                where: { organizationId },
                include: {
                    branches: true,
                    warehouses: {
                        include: {
                            locations: true
                        }
                    }
                },
                orderBy: { name: "asc" }
            }),
            this.prisma.productCategory.findMany({
                where: { organizationId },
                orderBy: { name: "asc" }
            }),
            this.prisma.unitOfMeasure.findMany({
                where: { organizationId },
                orderBy: { name: "asc" }
            }),
            this.prisma.customerSegment.findMany({
                where: { organizationId },
                orderBy: { name: "asc" }
            }),
            this.prisma.currency.findMany({
                where: { organizationId },
                orderBy: { code: "asc" }
            }),
            this.prisma.exchangeRate.findMany({
                where: { organizationId },
                include: {
                    currency: true
                },
                orderBy: { date: "desc" },
                take: 50
            }),
            this.prisma.productAttributeDefinition.findMany({
                where: { organizationId },
                orderBy: { name: "asc" }
            })
        ]);
    }
    createCategory(input) {
        return this.prisma.productCategory.create({
            data: input
        });
    }
    createUnit(input) {
        return this.prisma.unitOfMeasure.create({
            data: input
        });
    }
    createCustomerSegment(input) {
        return this.prisma.customerSegment.create({
            data: input
        });
    }
    async createCurrency(input) {
        if (input.isBase) {
            await this.prisma.currency.updateMany({
                where: { organizationId: input.organizationId, isBase: true },
                data: { isBase: false }
            });
        }
        return this.prisma.currency.create({
            data: input
        });
    }
    async createExchangeRate(input) {
        const currency = await this.prisma.currency.findFirstOrThrow({
            where: {
                organizationId: input.organizationId,
                code: input.currencyCode
            }
        });
        return this.prisma.exchangeRate.upsert({
            where: {
                currencyId_date: {
                    currencyId: currency.id,
                    date: input.date
                }
            },
            update: {
                rateToBase: input.rateToBase,
                source: input.source
            },
            create: {
                organizationId: input.organizationId,
                currencyId: currency.id,
                date: input.date,
                rateToBase: input.rateToBase,
                source: input.source
            }
        });
    }
    createStorageLocation(input) {
        return this.prisma.storageLocation.create({
            data: input
        });
    }
    createAttributeDefinition(input) {
        return this.prisma.productAttributeDefinition.create({
            data: input
        });
    }
}
exports.MasterDataRepository = MasterDataRepository;
