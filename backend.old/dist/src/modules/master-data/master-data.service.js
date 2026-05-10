"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterDataService = void 0;
const master_data_repository_1 = require("./master-data.repository");
class MasterDataService {
    repository;
    constructor(prisma) {
        this.repository = new master_data_repository_1.MasterDataRepository(prisma);
    }
    async getBootstrap(organizationId) {
        const [companies, categories, units, customerSegments, currencies, exchangeRates, attributeDefinitions] = await this.repository.getBootstrap(organizationId);
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
    createCategory(input) {
        return this.repository.createCategory({
            ...input,
            slug: input.slug.toLowerCase()
        });
    }
    createUnit(input) {
        return this.repository.createUnit({
            ...input,
            code: input.code.toUpperCase()
        });
    }
    createCustomerSegment(input) {
        return this.repository.createCustomerSegment({
            ...input,
            code: input.code.toUpperCase()
        });
    }
    createCurrency(input) {
        return this.repository.createCurrency({
            ...input,
            code: input.code.toUpperCase()
        });
    }
    createExchangeRate(input) {
        return this.repository.createExchangeRate({
            ...input,
            currencyCode: input.currencyCode.toUpperCase()
        });
    }
    createStorageLocation(input) {
        return this.repository.createStorageLocation({
            ...input,
            code: input.code.toUpperCase()
        });
    }
    createAttributeDefinition(input) {
        return this.repository.createAttributeDefinition({
            ...input,
            code: input.code.toUpperCase()
        });
    }
}
exports.MasterDataService = MasterDataService;
