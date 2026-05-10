import { PrismaClient } from "@prisma/client";

import { MasterDataRepository } from "./master-data.repository";

export class MasterDataService {
  private readonly repository: MasterDataRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new MasterDataRepository(prisma);
  }

  async getBootstrap(organizationId: string) {
    const [
      companies,
      categories,
      units,
      customerSegments,
      currencies,
      exchangeRates,
      attributeDefinitions
    ] = await this.repository.getBootstrap(organizationId);

    return {
      companies,
      categories,
      units,
      customerSegments,
      currencies,
      exchangeRates,
      attributeDefinitions
    };
  }

  createCategory(input: {
    organizationId: string;
    name: string;
    slug: string;
    description?: string;
  }) {
    return this.repository.createCategory({
      ...input,
      slug: input.slug.toLowerCase()
    });
  }

  createUnit(input: {
    organizationId: string;
    code: string;
    name: string;
    precision: number;
  }) {
    return this.repository.createUnit({
      ...input,
      code: input.code.toUpperCase()
    });
  }

  createCustomerSegment(input: {
    organizationId: string;
    code: string;
    name: string;
    description?: string;
  }) {
    return this.repository.createCustomerSegment({
      ...input,
      code: input.code.toUpperCase()
    });
  }

  createCurrency(input: {
    organizationId: string;
    code: string;
    name: string;
    symbol: string;
    isBase: boolean;
  }) {
    return this.repository.createCurrency({
      ...input,
      code: input.code.toUpperCase()
    });
  }

  createExchangeRate(input: {
    organizationId: string;
    currencyCode: string;
    date: Date;
    rateToBase: number;
    source: string;
  }) {
    return this.repository.createExchangeRate({
      ...input,
      currencyCode: input.currencyCode.toUpperCase()
    });
  }

  createStorageLocation(input: {
    warehouseId: string;
    code: string;
    name: string;
    zone?: string;
  }) {
    return this.repository.createStorageLocation({
      ...input,
      code: input.code.toUpperCase()
    });
  }

  createAttributeDefinition(input: {
    organizationId: string;
    code: string;
    name: string;
    dataType: string;
    isRequired: boolean;
  }) {
    return this.repository.createAttributeDefinition({
      ...input,
      code: input.code.toUpperCase()
    });
  }
}
