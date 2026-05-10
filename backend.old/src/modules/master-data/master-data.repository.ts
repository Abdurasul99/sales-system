import { PrismaClient } from "@prisma/client";

export class MasterDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getBootstrap(organizationId: string) {
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

  createCategory(input: {
    organizationId: string;
    name: string;
    slug: string;
    description?: string;
  }) {
    return this.prisma.productCategory.create({
      data: input
    });
  }

  createUnit(input: {
    organizationId: string;
    code: string;
    name: string;
    precision: number;
  }) {
    return this.prisma.unitOfMeasure.create({
      data: input
    });
  }

  createCustomerSegment(input: {
    organizationId: string;
    code: string;
    name: string;
    description?: string;
  }) {
    return this.prisma.customerSegment.create({
      data: input
    });
  }

  async createCurrency(input: {
    organizationId: string;
    code: string;
    name: string;
    symbol: string;
    isBase: boolean;
  }) {
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

  async createExchangeRate(input: {
    organizationId: string;
    currencyCode: string;
    date: Date;
    rateToBase: number;
    source: string;
  }) {
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

  createStorageLocation(input: {
    warehouseId: string;
    code: string;
    name: string;
    zone?: string;
  }) {
    return this.prisma.storageLocation.create({
      data: input
    });
  }

  createAttributeDefinition(input: {
    organizationId: string;
    code: string;
    name: string;
    dataType: string;
    isRequired: boolean;
  }) {
    return this.prisma.productAttributeDefinition.create({
      data: input
    });
  }
}
