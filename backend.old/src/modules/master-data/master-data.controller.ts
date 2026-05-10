import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import {
  createAttributeDefinitionSchema,
  createCategorySchema,
  createCurrencySchema,
  createCustomerSegmentSchema,
  createExchangeRateSchema,
  createStorageLocationSchema,
  createUnitSchema
} from "./master-data.schemas";
import { MasterDataService } from "./master-data.service";

export class MasterDataController {
  private readonly service: MasterDataService;

  constructor(prisma: PrismaClient) {
    this.service = new MasterDataService(prisma);
  }

  bootstrap = async (req: Request, res: Response) => {
    const payload = await this.service.getBootstrap(req.auth!.organizationId);
    res.json(payload);
  };

  createCategory = async (req: Request, res: Response) => {
    const input = createCategorySchema.parse(req.body);
    const category = await this.service.createCategory({
      organizationId: req.auth!.organizationId,
      name: input.name,
      slug: input.slug,
      description: input.description
    });

    res.status(201).json({ category });
  };

  createUnit = async (req: Request, res: Response) => {
    const input = createUnitSchema.parse(req.body);
    const unit = await this.service.createUnit({
      organizationId: req.auth!.organizationId,
      code: input.code,
      name: input.name,
      precision: input.precision
    });

    res.status(201).json({ unit });
  };

  createCustomerSegment = async (req: Request, res: Response) => {
    const input = createCustomerSegmentSchema.parse(req.body);
    const segment = await this.service.createCustomerSegment({
      organizationId: req.auth!.organizationId,
      code: input.code,
      name: input.name,
      description: input.description
    });

    res.status(201).json({ segment });
  };

  createCurrency = async (req: Request, res: Response) => {
    const input = createCurrencySchema.parse(req.body);
    const currency = await this.service.createCurrency({
      organizationId: req.auth!.organizationId,
      code: input.code,
      name: input.name,
      symbol: input.symbol,
      isBase: input.isBase
    });

    res.status(201).json({ currency });
  };

  createExchangeRate = async (req: Request, res: Response) => {
    const input = createExchangeRateSchema.parse(req.body);
    const exchangeRate = await this.service.createExchangeRate({
      organizationId: req.auth!.organizationId,
      currencyCode: input.currencyCode,
      date: new Date(input.date),
      rateToBase: input.rateToBase,
      source: input.source
    });

    res.status(201).json({ exchangeRate });
  };

  createStorageLocation = async (req: Request, res: Response) => {
    const input = createStorageLocationSchema.parse(req.body);
    const location = await this.service.createStorageLocation(input);
    res.status(201).json({ location });
  };

  createAttributeDefinition = async (req: Request, res: Response) => {
    const input = createAttributeDefinitionSchema.parse(req.body);
    const attributeDefinition = await this.service.createAttributeDefinition({
      organizationId: req.auth!.organizationId,
      code: input.code,
      name: input.name,
      dataType: input.dataType,
      isRequired: input.isRequired
    });

    res.status(201).json({ attributeDefinition });
  };
}
