"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const password_1 = require("../src/lib/password");
const rbac_1 = require("../src/modules/auth/rbac");
const prisma = new client_1.PrismaClient();
async function main() {
    const slug = "demo-sales-system";
    const organization = (await prisma.organization.findUnique({
        where: { slug }
    })) ??
        (await prisma.organization.create({
            data: {
                name: "Demo Sales System",
                slug,
                baseCurrency: "UZS"
            }
        }));
    const company = await prisma.company.upsert({
        where: {
            organizationId_code: {
                organizationId: organization.id,
                code: "DTL"
            }
        },
        update: {
            name: "Demo Trade LLC"
        },
        create: {
            organizationId: organization.id,
            name: "Demo Trade LLC",
            code: "DTL"
        }
    });
    const branch = await prisma.branch.upsert({
        where: {
            companyId_code: {
                companyId: company.id,
                code: "CENTRAL"
            }
        },
        update: {
            name: "Central Branch",
            isMain: true
        },
        create: {
            companyId: company.id,
            name: "Central Branch",
            code: "CENTRAL",
            isMain: true
        }
    });
    const warehouse = await prisma.warehouse.upsert({
        where: {
            companyId_code: {
                companyId: company.id,
                code: "MAIN"
            }
        },
        update: {
            name: "Main Warehouse",
            branchId: branch.id
        },
        create: {
            companyId: company.id,
            branchId: branch.id,
            name: "Main Warehouse",
            code: "MAIN"
        }
    });
    await prisma.storageLocation.upsert({
        where: {
            warehouseId_code: {
                warehouseId: warehouse.id,
                code: "A-01"
            }
        },
        update: {
            name: "Primary Picking Zone",
            zone: "A"
        },
        create: {
            warehouseId: warehouse.id,
            code: "A-01",
            name: "Primary Picking Zone",
            zone: "A"
        }
    });
    for (const [code, permissions] of Object.entries(rbac_1.SYSTEM_ROLE_PERMISSIONS)) {
        await prisma.role.upsert({
            where: {
                organizationId_code: {
                    organizationId: organization.id,
                    code
                }
            },
            update: {
                name: code.replace(/_/g, " "),
                permissions,
                isSystem: true
            },
            create: {
                organizationId: organization.id,
                name: code.replace(/_/g, " "),
                code,
                permissions,
                isSystem: true
            }
        });
    }
    const ownerRole = await prisma.role.findFirstOrThrow({
        where: {
            organizationId: organization.id,
            code: "OWNER"
        }
    });
    const currencies = [
        { code: "UZS", name: "Uzbek Sum", symbol: "UZS", isBase: true },
        { code: "USD", name: "US Dollar", symbol: "$", isBase: false },
        { code: "CNY", name: "Chinese Yuan", symbol: "CNY", isBase: false }
    ];
    for (const currency of currencies) {
        await prisma.currency.upsert({
            where: {
                organizationId_code: {
                    organizationId: organization.id,
                    code: currency.code
                }
            },
            update: currency,
            create: {
                organizationId: organization.id,
                ...currency
            }
        });
    }
    const usd = await prisma.currency.findFirstOrThrow({
        where: { organizationId: organization.id, code: "USD" }
    });
    const cny = await prisma.currency.findFirstOrThrow({
        where: { organizationId: organization.id, code: "CNY" }
    });
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await prisma.exchangeRate.upsert({
        where: {
            currencyId_date: {
                currencyId: usd.id,
                date: today
            }
        },
        update: {
            rateToBase: 12650
        },
        create: {
            organizationId: organization.id,
            currencyId: usd.id,
            date: today,
            rateToBase: 12650
        }
    });
    await prisma.exchangeRate.upsert({
        where: {
            currencyId_date: {
                currencyId: cny.id,
                date: today
            }
        },
        update: {
            rateToBase: 1740
        },
        create: {
            organizationId: organization.id,
            currencyId: cny.id,
            date: today,
            rateToBase: 1740
        }
    });
    const units = [
        { code: "PCS", name: "Piece", precision: 0 },
        { code: "KG", name: "Kilogram", precision: 3 },
        { code: "L", name: "Liter", precision: 3 }
    ];
    for (const unit of units) {
        await prisma.unitOfMeasure.upsert({
            where: {
                organizationId_code: {
                    organizationId: organization.id,
                    code: unit.code
                }
            },
            update: unit,
            create: {
                organizationId: organization.id,
                ...unit
            }
        });
    }
    const pcs = await prisma.unitOfMeasure.findFirstOrThrow({
        where: { organizationId: organization.id, code: "PCS" }
    });
    const category = await prisma.productCategory.upsert({
        where: {
            organizationId_slug: {
                organizationId: organization.id,
                slug: "electronics"
            }
        },
        update: {
            name: "Electronics",
            description: "Demo electronics line"
        },
        create: {
            organizationId: organization.id,
            name: "Electronics",
            slug: "electronics",
            description: "Demo electronics line"
        }
    });
    const customerSegment = await prisma.customerSegment.upsert({
        where: {
            organizationId_code: {
                organizationId: organization.id,
                code: "VIP"
            }
        },
        update: {
            name: "VIP"
        },
        create: {
            organizationId: organization.id,
            code: "VIP",
            name: "VIP",
            description: "High value repeat customers"
        }
    });
    const attributeDefinitions = [
        {
            code: "BRAND",
            name: "Brand",
            dataType: "TEXT",
            isRequired: false
        },
        {
            code: "MODEL",
            name: "Model",
            dataType: "TEXT",
            isRequired: true
        }
    ];
    for (const attribute of attributeDefinitions) {
        await prisma.productAttributeDefinition.upsert({
            where: {
                organizationId_code: {
                    organizationId: organization.id,
                    code: attribute.code
                }
            },
            update: attribute,
            create: {
                organizationId: organization.id,
                ...attribute
            }
        });
    }
    const passwordHash = await (0, password_1.hashPassword)("Owner123!");
    await prisma.user.upsert({
        where: {
            organizationId_login: {
                organizationId: organization.id,
                login: "owner"
            }
        },
        update: {
            fullName: "Demo Owner",
            email: "owner@demo.local",
            passwordHash,
            roleId: ownerRole.id,
            companyId: company.id,
            branchId: branch.id
        },
        create: {
            organizationId: organization.id,
            companyId: company.id,
            branchId: branch.id,
            roleId: ownerRole.id,
            fullName: "Demo Owner",
            login: "owner",
            email: "owner@demo.local",
            passwordHash
        }
    });
    const supplier = await prisma.supplier.upsert({
        where: {
            organizationId_code: {
                organizationId: organization.id,
                code: "SUP-001"
            }
        },
        update: {
            name: "Shenzhen Source Ltd",
            contactName: "Li Wei",
            averageLeadDays: 12
        },
        create: {
            organizationId: organization.id,
            companyId: company.id,
            name: "Shenzhen Source Ltd",
            code: "SUP-001",
            contactName: "Li Wei",
            averageLeadDays: 12
        }
    });
    const customer = await prisma.customer.upsert({
        where: {
            organizationId_code: {
                organizationId: organization.id,
                code: "CUS-001"
            }
        },
        update: {
            name: "Retail Pilot Client",
            segment: "VIP",
            segmentId: customerSegment.id
        },
        create: {
            organizationId: organization.id,
            companyId: company.id,
            segmentId: customerSegment.id,
            name: "Retail Pilot Client",
            code: "CUS-001",
            segment: "VIP"
        }
    });
    const productsSeed = [
        {
            name: "POS Terminal X1",
            article: "POS-X1",
            barcode: "100000000001",
            baseCost: 850000,
            basePrice: 1150000,
            reorderPoint: 10,
            safetyStock: 5,
            leadTimeDays: 10,
            trackBatch: true
        },
        {
            name: "Barcode Scanner S2",
            article: "SCAN-S2",
            barcode: "100000000002",
            baseCost: 420000,
            basePrice: 620000,
            reorderPoint: 15,
            safetyStock: 7,
            leadTimeDays: 8,
            trackBatch: false
        },
        {
            name: "Receipt Printer P3",
            article: "PRINT-P3",
            barcode: "100000000003",
            baseCost: 300000,
            basePrice: 450000,
            reorderPoint: 20,
            safetyStock: 10,
            leadTimeDays: 14,
            trackBatch: false
        }
    ];
    const products = [];
    for (const seed of productsSeed) {
        const product = await prisma.product.upsert({
            where: {
                organizationId_article: {
                    organizationId: organization.id,
                    article: seed.article
                }
            },
            update: {
                ...seed,
                categoryId: category.id,
                unitId: pcs.id,
                companyId: company.id
            },
            create: {
                organizationId: organization.id,
                companyId: company.id,
                categoryId: category.id,
                unitId: pcs.id,
                ...seed
            }
        });
        products.push(product);
        const existingPriceRecord = await prisma.productPriceHistory.findFirst({
            where: {
                organizationId: organization.id,
                productId: product.id
            },
            orderBy: {
                validFrom: "desc"
            }
        });
        if (!existingPriceRecord ||
            Number(existingPriceRecord.purchasePrice ?? 0) !== Number(product.baseCost) ||
            Number(existingPriceRecord.salePrice ?? 0) !== Number(product.basePrice)) {
            await prisma.productPriceHistory.create({
                data: {
                    organizationId: organization.id,
                    productId: product.id,
                    currencyCode: "UZS",
                    purchasePrice: product.baseCost,
                    salePrice: product.basePrice
                }
            });
        }
    }
    const brandAttribute = await prisma.productAttributeDefinition.findFirstOrThrow({
        where: { organizationId: organization.id, code: "BRAND" }
    });
    const modelAttribute = await prisma.productAttributeDefinition.findFirstOrThrow({
        where: { organizationId: organization.id, code: "MODEL" }
    });
    for (const product of products) {
        await prisma.productAttributeValue.upsert({
            where: {
                productId_attributeId: {
                    productId: product.id,
                    attributeId: brandAttribute.id
                }
            },
            update: {
                valueText: "DemoTech"
            },
            create: {
                productId: product.id,
                attributeId: brandAttribute.id,
                valueText: "DemoTech"
            }
        });
        await prisma.productAttributeValue.upsert({
            where: {
                productId_attributeId: {
                    productId: product.id,
                    attributeId: modelAttribute.id
                }
            },
            update: {
                valueText: product.article
            },
            create: {
                productId: product.id,
                attributeId: modelAttribute.id,
                valueText: product.article
            }
        });
    }
    for (const [index, product] of products.entries()) {
        await prisma.inventoryBalance.upsert({
            where: {
                warehouseId_productId: {
                    warehouseId: warehouse.id,
                    productId: product.id
                }
            },
            update: {
                onHand: 40 - index * 10,
                reserved: 0,
                available: 40 - index * 10
            },
            create: {
                organizationId: organization.id,
                warehouseId: warehouse.id,
                productId: product.id,
                onHand: 40 - index * 10,
                reserved: 0,
                available: 40 - index * 10
            }
        });
    }
    const existingLead = await prisma.lead.findFirst({
        where: {
            organizationId: organization.id,
            title: "Pilot rollout for new branch"
        }
    });
    if (!existingLead) {
        await prisma.lead.create({
            data: {
                organizationId: organization.id,
                customerId: customer.id,
                title: "Pilot rollout for new branch",
                source: "Referral",
                expectedValue: 2500000,
                currencyCode: "UZS"
            }
        });
    }
    console.log("Demo seed completed");
    console.log("Login: owner");
    console.log("Password: Owner123!");
    console.log(`Supplier: ${supplier.name}`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
