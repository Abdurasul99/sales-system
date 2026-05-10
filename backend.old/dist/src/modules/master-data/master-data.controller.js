"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDataController = void 0;
const master_data_schemas_1 = require("./master-data.schemas");
const master_data_service_1 = require("./master-data.service");
class MasterDataController {
    service;
    constructor(prisma) {
        this.service = new master_data_service_1.MasterDataService(prisma);
    }
    bootstrap = async (req, res) => {
        const payload = await this.service.getBootstrap(req.auth.organizationId);
        res.json(payload);
    };
    createCategory = async (req, res) => {
        const input = master_data_schemas_1.createCategorySchema.parse(req.body);
        const category = await this.service.createCategory({
            organizationId: req.auth.organizationId,
            name: input.name,
            slug: input.slug,
            description: input.description
        });
        res.status(201).json({ category });
    };
    createUnit = async (req, res) => {
        const input = master_data_schemas_1.createUnitSchema.parse(req.body);
        const unit = await this.service.createUnit({
            organizationId: req.auth.organizationId,
            code: input.code,
            name: input.name,
            precision: input.precision
        });
        res.status(201).json({ unit });
    };
    createCustomerSegment = async (req, res) => {
        const input = master_data_schemas_1.createCustomerSegmentSchema.parse(req.body);
        const segment = await this.service.createCustomerSegment({
            organizationId: req.auth.organizationId,
            code: input.code,
            name: input.name,
            description: input.description
        });
        res.status(201).json({ segment });
    };
    createCurrency = async (req, res) => {
        const input = master_data_schemas_1.createCurrencySchema.parse(req.body);
        const currency = await this.service.createCurrency({
            organizationId: req.auth.organizationId,
            code: input.code,
            name: input.name,
            symbol: input.symbol,
            isBase: input.isBase
        });
        res.status(201).json({ currency });
    };
    createExchangeRate = async (req, res) => {
        const input = master_data_schemas_1.createExchangeRateSchema.parse(req.body);
        const exchangeRate = await this.service.createExchangeRate({
            organizationId: req.auth.organizationId,
            currencyCode: input.currencyCode,
            date: new Date(input.date),
            rateToBase: input.rateToBase,
            source: input.source
        });
        res.status(201).json({ exchangeRate });
    };
    createStorageLocation = async (req, res) => {
        const input = master_data_schemas_1.createStorageLocationSchema.parse(req.body);
        const location = await this.service.createStorageLocation(input);
        res.status(201).json({ location });
    };
    createAttributeDefinition = async (req, res) => {
        const input = master_data_schemas_1.createAttributeDefinitionSchema.parse(req.body);
        const attributeDefinition = await this.service.createAttributeDefinition({
            organizationId: req.auth.organizationId,
            code: input.code,
            name: input.name,
            dataType: input.dataType,
            isRequired: input.isRequired
        });
        res.status(201).json({ attributeDefinition });
    };
}
exports.MasterDataController = MasterDataController;
