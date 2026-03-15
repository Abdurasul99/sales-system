import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Sales System database...");

  // ─── Plans ──────────────────────────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { slug: "starter" },
      update: { priceUzs: 0, maxProducts: 100, maxEmployees: 2, maxBranches: 1, maxWorkstations: 1 },
      create: {
        name: "Базовый", slug: "starter", priceUzs: 0, maxProducts: 100,
        maxEmployees: 2, maxBranches: 1, maxWorkstations: 1, sortOrder: 1,
        features: {
          create: [
            { feature: "ANALYTICS_BASIC", enabled: true },
            { feature: "SALES_CASH", enabled: true },
            { feature: "SALES_CARD", enabled: true },
            { feature: "SALES_DEBT", enabled: true },
            { feature: "BARCODE_SCANNER", enabled: true },
            { feature: "RECEIPT_PRINT", enabled: true },
            { feature: "DISCOUNT_DIGITAL", enabled: true },
            { feature: "WAREHOUSE_BASIC", enabled: true },
            { feature: "WRITE_OFF", enabled: true },
            { feature: "CASHIER_SHIFT", enabled: true },
          ],
        },
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "biznes" },
      update: { priceUzs: 990000, maxProducts: 2000, maxEmployees: 10, maxBranches: 1, maxWorkstations: 5 },
      create: {
        name: "Бизнес", slug: "biznes", priceUzs: 990000, maxProducts: 2000,
        maxEmployees: 10, maxBranches: 1, maxWorkstations: 5, sortOrder: 2,
        features: {
          create: [
            { feature: "ANALYTICS_BASIC", enabled: true },
            { feature: "ANALYTICS_ADVANCED", enabled: true },
            { feature: "SALES_CASH", enabled: true },
            { feature: "SALES_CARD", enabled: true },
            { feature: "SALES_DEBT", enabled: true },
            { feature: "BARCODE_SCANNER", enabled: true },
            { feature: "QR_CODE_SCANNER", enabled: true },
            { feature: "RECEIPT_PRINT", enabled: true },
            { feature: "LABEL_PRINT", enabled: true },
            { feature: "DISCOUNT_DIGITAL", enabled: true },
            { feature: "DISCOUNT_PERCENTAGE", enabled: true },
            { feature: "WAREHOUSE_BASIC", enabled: true },
            { feature: "WRITE_OFF", enabled: true },
            { feature: "SUPPLIER_MANAGEMENT", enabled: true },
            { feature: "CLIENT_BASE", enabled: true },
            { feature: "ABC_ANALYSIS", enabled: true },
            { feature: "RETURN_SCHEME", enabled: true },
            { feature: "CASHIER_SHIFT", enabled: true },
          ],
        },
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "pro" },
      update: { priceUzs: 5000000, maxProducts: null, maxEmployees: null, maxBranches: 5, maxWorkstations: 20 },
      create: {
        name: "Про", slug: "pro", priceUzs: 5000000,
        maxProducts: null, maxEmployees: null, maxBranches: 5, maxWorkstations: 20, sortOrder: 3,
        features: {
          create: [
            { feature: "ANALYTICS_BASIC", enabled: true },
            { feature: "ANALYTICS_ADVANCED", enabled: true },
            { feature: "ANALYTICS_AI", enabled: true },
            { feature: "SALES_CASH", enabled: true },
            { feature: "SALES_CARD", enabled: true },
            { feature: "SALES_DEBT", enabled: true },
            { feature: "BARCODE_SCANNER", enabled: true },
            { feature: "QR_CODE_SCANNER", enabled: true },
            { feature: "RECEIPT_PRINT", enabled: true },
            { feature: "LABEL_PRINT", enabled: true },
            { feature: "DISCOUNT_DIGITAL", enabled: true },
            { feature: "DISCOUNT_PERCENTAGE", enabled: true },
            { feature: "WAREHOUSE_BASIC", enabled: true },
            { feature: "WAREHOUSE_ADVANCED", enabled: true },
            { feature: "WRITE_OFF", enabled: true },
            { feature: "SUPPLIER_MANAGEMENT", enabled: true },
            { feature: "CLIENT_BASE", enabled: true },
            { feature: "CRM", enabled: true },
            { feature: "BONUS_SYSTEM", enabled: true },
            { feature: "CASHBACK", enabled: true },
            { feature: "SMS_MESSAGING", enabled: true },
            { feature: "EMAIL_MESSAGING", enabled: true },
            { feature: "AI_RECOMMENDATIONS", enabled: true },
            { feature: "ABC_ANALYSIS", enabled: true },
            { feature: "RETURN_SCHEME", enabled: true },
            { feature: "FLEXIBLE_ROLES", enabled: true },
            { feature: "MULTI_BRANCH", enabled: true },
          ],
        },
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { slug: "korporat" },
      update: { priceUzs: 10000000, maxProducts: null, maxEmployees: null, maxBranches: null, maxWorkstations: null },
      create: {
        name: "Корпорат", slug: "korporat", priceUzs: 10000000,
        maxProducts: null, maxEmployees: null, maxBranches: null, maxWorkstations: null, sortOrder: 4,
        features: {
          create: [
            { feature: "ANALYTICS_BASIC", enabled: true },
            { feature: "ANALYTICS_ADVANCED", enabled: true },
            { feature: "ANALYTICS_AI", enabled: true },
            { feature: "SALES_CASH", enabled: true },
            { feature: "SALES_CARD", enabled: true },
            { feature: "SALES_DEBT", enabled: true },
            { feature: "BARCODE_SCANNER", enabled: true },
            { feature: "QR_CODE_SCANNER", enabled: true },
            { feature: "RECEIPT_PRINT", enabled: true },
            { feature: "LABEL_PRINT", enabled: true },
            { feature: "DISCOUNT_DIGITAL", enabled: true },
            { feature: "DISCOUNT_PERCENTAGE", enabled: true },
            { feature: "WAREHOUSE_BASIC", enabled: true },
            { feature: "WAREHOUSE_ADVANCED", enabled: true },
            { feature: "WRITE_OFF", enabled: true },
            { feature: "SUPPLIER_MANAGEMENT", enabled: true },
            { feature: "CLIENT_BASE", enabled: true },
            { feature: "CRM", enabled: true },
            { feature: "BONUS_SYSTEM", enabled: true },
            { feature: "CASHBACK", enabled: true },
            { feature: "SMS_MESSAGING", enabled: true },
            { feature: "EMAIL_MESSAGING", enabled: true },
            { feature: "AI_RECOMMENDATIONS", enabled: true },
            { feature: "ABC_ANALYSIS", enabled: true },
            { feature: "RETURN_SCHEME", enabled: true },
            { feature: "FLEXIBLE_ROLES", enabled: true },
            { feature: "MULTI_BRANCH", enabled: true },
            { feature: "MARKETPLACE_SYNC", enabled: true },
            { feature: "ACCOUNTING_1C", enabled: true },
            { feature: "TSD_INTEGRATION", enabled: true },
          ],
        },
      },
    }),
  ]);

  console.log("✅ Plans created:", plans.map((p) => p.name).join(", "));

  // ─── Currencies ──────────────────────────────────────────────────────────────
  await prisma.currency.createMany({
    skipDuplicates: true,
    data: [
      { code: "UZS", name: "Узбекский сум", symbol: "сум", isBase: true },
      { code: "USD", name: "Доллар США", symbol: "$" },
      { code: "EUR", name: "Евро", symbol: "€" },
      { code: "RUB", name: "Российский рубль", symbol: "₽" },
      { code: "CNY", name: "Китайский юань", symbol: "¥" },
    ],
  });

  console.log("✅ Currencies created");

  // ─── SuperAdmin ───────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { login: "superadmin" },
    update: {},
    create: {
      fullName: "Платформа Администратор",
      phone: "+998900000000",
      login: "superadmin",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "SUPERADMIN",
    },
  });
  console.log("✅ SuperAdmin created — login: superadmin / Admin123!");

  // ─── Demo Organization ────────────────────────────────────────────────────────
  const premiumPlan = plans.find((p) => p.slug === "pro")!;

  const demoOrg = await prisma.organization.upsert({
    where: { slug: "magazia-demo" },
    update: {},
    create: {
      name: "Магазия Демо",
      slug: "magazia-demo",
      phone: "+998901234567",
      address: "г. Ташкент, ул. Навои 1",
      subscription: {
        create: {
          planId: premiumPlan.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          priceAtPurchase: 750000,
        },
      },
    },
  });

  // Main branch
  let mainBranch = await prisma.branch.findFirst({ where: { organizationId: demoOrg.id, isMainBranch: true } });
  if (!mainBranch) {
    mainBranch = await prisma.branch.create({
      data: { organizationId: demoOrg.id, name: "Главный магазин", isMainBranch: true, address: "г. Ташкент, ул. Навои 1" },
    });
  }

  // Second branch
  await prisma.branch.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: "Филиал Чиланзар" } },
    update: {},
    create: { organizationId: demoOrg.id, name: "Филиал Чиланзар", address: "г. Ташкент, Чиланзар" },
  });

  console.log("✅ Demo organization created:", demoOrg.name);

  // ─── Demo Users ───────────────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { login: "admin" },
    update: {},
    create: {
      fullName: "Алишер Каримов",
      phone: "+998901111111",
      login: "admin",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "ADMIN",
      organizationId: demoOrg.id,
      branchId: mainBranch.id,
    },
  });

  const cashierUser = await prisma.user.upsert({
    where: { login: "cashier" },
    update: {},
    create: {
      fullName: "Малика Юсупова",
      phone: "+998902222222",
      login: "cashier",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "CASHIER",
      organizationId: demoOrg.id,
      branchId: mainBranch.id,
    },
  });

  const warehouseUser = await prisma.user.upsert({
    where: { login: "warehouse" },
    update: {},
    create: {
      fullName: "Бобур Рашидов",
      phone: "+998903333333",
      login: "warehouse",
      passwordHash: await bcrypt.hash("Admin123!", 12),
      role: "WAREHOUSE_CLERK",
      organizationId: demoOrg.id,
      branchId: mainBranch.id,
    },
  });

  console.log("✅ Demo users — admin / cashier / warehouse (password: Admin123!)");

  // ─── Categories ───────────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Напитки", slug: "napitki", color: "#2563eb" },
    { name: "Молочные продукты", slug: "molochnye", color: "#059669" },
    { name: "Хлебобулочные", slug: "khlebobul", color: "#d97706" },
    { name: "Бакалея", slug: "bakalea", color: "#7c3aed" },
    { name: "Снеки и сладости", slug: "sneki", color: "#db2777" },
    { name: "Бытовая химия", slug: "bytkhim", color: "#dc2626" },
    { name: "Личная гигиена", slug: "gigiena", color: "#0891b2" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const existing = await prisma.productCategory.findFirst({ where: { organizationId: demoOrg.id, slug: cat.slug } });
    if (!existing) {
      const created = await prisma.productCategory.create({ data: { ...cat, organizationId: demoOrg.id } });
      categories[cat.name] = created.id;
    } else {
      categories[cat.name] = existing.id;
    }
  }

  console.log("✅ Categories created");

  // ─── Products ─────────────────────────────────────────────────────────────────
  const productData = [
    { name: "Coca-Cola 1.5л", barcode: "5449000000996", categoryName: "Напитки", unit: "шт", costPrice: 8500, sellingPrice: 12000 },
    { name: "Pepsi 1л", barcode: "4900050490", categoryName: "Напитки", unit: "шт", costPrice: 7000, sellingPrice: 10000 },
    { name: "Вода Арт 0.5л", barcode: "4720070000022", categoryName: "Напитки", unit: "шт", costPrice: 2500, sellingPrice: 4000 },
    { name: "Сок Rich апельсин 1л", barcode: "4607135005017", categoryName: "Напитки", unit: "шт", costPrice: 12000, sellingPrice: 17000 },
    { name: "Чай Lipton 100пак", barcode: "8712566178100", categoryName: "Напитки", unit: "шт", costPrice: 35000, sellingPrice: 50000 },
    { name: "Молоко Тошсут 1л", barcode: "4870003201018", categoryName: "Молочные продукты", unit: "шт", costPrice: 9000, sellingPrice: 12500 },
    { name: "Кефир 1л", barcode: "4607014751178", categoryName: "Молочные продукты", unit: "шт", costPrice: 8000, sellingPrice: 11000 },
    { name: "Масло сливочное 200г", barcode: "4814728000065", categoryName: "Молочные продукты", unit: "шт", costPrice: 18000, sellingPrice: 25000 },
    { name: "Йогурт Активиа 150г", barcode: "4607019570019", categoryName: "Молочные продукты", unit: "шт", costPrice: 9000, sellingPrice: 13000 },
    { name: "Сыр Российский 200г", barcode: "4820019230030", categoryName: "Молочные продукты", unit: "шт", costPrice: 22000, sellingPrice: 32000 },
    { name: "Хлеб белый нарезной", barcode: "4820054891124", categoryName: "Хлебобулочные", unit: "шт", costPrice: 5000, sellingPrice: 7000 },
    { name: "Батон ноздреватый", barcode: "4820054893463", categoryName: "Хлебобулочные", unit: "шт", costPrice: 6000, sellingPrice: 9000 },
    { name: "Сахар 1кг", barcode: "4607010921102", categoryName: "Бакалея", unit: "кг", costPrice: 10000, sellingPrice: 14000 },
    { name: "Мука пшеничная 2кг", barcode: "4820098010428", categoryName: "Бакалея", unit: "шт", costPrice: 18000, sellingPrice: 25000 },
    { name: "Масло подсолнечное 1л", barcode: "4607044650476", categoryName: "Бакалея", unit: "шт", costPrice: 20000, sellingPrice: 28000 },
    { name: "Рис длиннозерный 1кг", barcode: "4607014751055", categoryName: "Бакалея", unit: "кг", costPrice: 15000, sellingPrice: 22000 },
    { name: "Макароны 400г", barcode: "4607083751060", categoryName: "Бакалея", unit: "шт", costPrice: 8000, sellingPrice: 12000 },
    { name: "Соль 1кг", barcode: "4820046350201", categoryName: "Бакалея", unit: "шт", costPrice: 3000, sellingPrice: 5000 },
    { name: "Чипсы Lays 150г", barcode: "4820024764022", categoryName: "Снеки и сладости", unit: "шт", costPrice: 12000, sellingPrice: 18000 },
    { name: "Шоколад Milka 100г", barcode: "7622210951939", categoryName: "Снеки и сладости", unit: "шт", costPrice: 15000, sellingPrice: 22000 },
    { name: "Конфеты Мишка 200г", barcode: "4820061450236", categoryName: "Снеки и сладости", unit: "шт", costPrice: 25000, sellingPrice: 35000 },
    { name: "Жвачка Orbit 10шт", barcode: "4044388021012", categoryName: "Снеки и сладости", unit: "шт", costPrice: 7000, sellingPrice: 10000 },
    { name: "Порошок Tide 1кг", barcode: "4015400888208", categoryName: "Бытовая химия", unit: "шт", costPrice: 28000, sellingPrice: 40000 },
    { name: "Средство Fairy 500мл", barcode: "4084500965027", categoryName: "Бытовая химия", unit: "шт", costPrice: 22000, sellingPrice: 32000 },
    { name: "Шампунь Head&Shoulders 400мл", barcode: "4084500965034", categoryName: "Личная гигиена", unit: "шт", costPrice: 38000, sellingPrice: 55000 },
    { name: "Зубная паста Colgate 150г", barcode: "4007817333052", categoryName: "Личная гигиена", unit: "шт", costPrice: 16000, sellingPrice: 24000 },
    { name: "Мыло Safeguard 90г", barcode: "4007817333062", categoryName: "Личная гигиена", unit: "шт", costPrice: 8000, sellingPrice: 12000 },
  ];

  const createdProducts: Record<string, string> = {};
  for (const p of productData) {
    const existing = await prisma.product.findFirst({ where: { organizationId: demoOrg.id, barcode: p.barcode } });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          organizationId: demoOrg.id,
          name: p.name,
          barcode: p.barcode,
          categoryId: categories[p.categoryName],
          unit: p.unit,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          minStockLevel: 5,
        },
      });
      createdProducts[p.name] = product.id;

      // Add initial inventory
      await prisma.inventory.create({
        data: {
          productId: product.id,
          branchId: mainBranch.id,
          quantity: Math.floor(Math.random() * 80) + 20,
        },
      });
    } else {
      createdProducts[p.name] = existing.id;
    }
  }

  console.log(`✅ ${productData.length} products created with inventory`);

  // ─── Suppliers ────────────────────────────────────────────────────────────────
  const supplierData = [
    { companyName: "ООО Продрезерв", contactName: "Иванов А.В.", phone: "+998711234567", inn: "123456789" },
    { companyName: "ИП Рахимов Достон", contactName: "Рахимов Д.", phone: "+998901234568", inn: "987654321" },
    { companyName: "Uni-Distributors", contactName: "Менеджер Джон", phone: "+998712345678", email: "sales@unidist.uz" },
  ];

  for (const s of supplierData) {
    const existing = await prisma.supplier.findFirst({ where: { organizationId: demoOrg.id, companyName: s.companyName } });
    if (!existing) await prisma.supplier.create({ data: { ...s, organizationId: demoOrg.id } });
  }

  console.log("✅ Suppliers created");

  // ─── Sample Sales ─────────────────────────────────────────────────────────────
  const productIds = Object.values(createdProducts);
  const productsList = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, sellingPrice: true, costPrice: true } });

  for (let i = 0; i < 30; i++) {
    const dayOffset = Math.floor(Math.random() * 30);
    const saleDate = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const selectedProducts = productsList.sort(() => 0.5 - Math.random()).slice(0, itemCount);
    const paymentTypes = ["CASH", "CARD", "DEBT"] as const;
    const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];

    const items = selectedProducts.map((p) => {
      const qty = Math.floor(Math.random() * 3) + 1;
      return { productId: p.id, quantity: qty, unitPrice: Number(p.sellingPrice), costPrice: Number(p.costPrice), discount: 0, total: qty * Number(p.sellingPrice) };
    });
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);

    try {
      await prisma.sale.create({
        data: {
          organizationId: demoOrg.id,
          branchId: mainBranch.id,
          cashierId: cashierUser.id,
          receiptNumber: `CHK-${Date.now()}-${i}`,
          status: paymentType === "DEBT" ? "DEBT" : "COMPLETED",
          paymentType,
          subtotal,
          total: subtotal,
          paidAmount: paymentType === "DEBT" ? 0 : subtotal,
          debtAmount: paymentType === "DEBT" ? subtotal : 0,
          createdAt: saleDate,
          items: { create: items },
        },
      });
    } catch { /* skip duplicates */ }
  }

  console.log("✅ 30 sample sales created");

  // ─── Sample Expenses & Income ─────────────────────────────────────────────────
  const expCat = await prisma.expenseCategory.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: "Аренда" } },
    update: {},
    create: { organizationId: demoOrg.id, name: "Аренда", color: "#dc2626" },
  });
  const expCat2 = await prisma.expenseCategory.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: "Коммунальные услуги" } },
    update: {},
    create: { organizationId: demoOrg.id, name: "Коммунальные услуги", color: "#d97706" },
  });
  const expCat3 = await prisma.expenseCategory.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: "Зарплата" } },
    update: {},
    create: { organizationId: demoOrg.id, name: "Зарплата", color: "#7c3aed" },
  });

  await prisma.expense.createMany({
    data: [
      { organizationId: demoOrg.id, branchId: mainBranch.id, categoryId: expCat.id, description: "Аренда помещения — март", amount: 3000000, createdBy: adminUser.id, status: "CONFIRMED" },
      { organizationId: demoOrg.id, branchId: mainBranch.id, categoryId: expCat2.id, description: "Электричество — март", amount: 450000, createdBy: adminUser.id, status: "CONFIRMED" },
      { organizationId: demoOrg.id, branchId: mainBranch.id, categoryId: expCat3.id, description: "Зарплата кассиру", amount: 2000000, createdBy: adminUser.id, status: "CONFIRMED" },
      { organizationId: demoOrg.id, branchId: mainBranch.id, categoryId: expCat3.id, description: "Зарплата кладовщику", amount: 1800000, createdBy: adminUser.id, status: "CONFIRMED" },
    ],
  });

  const incCat = await prisma.incomeCategory.upsert({
    where: { organizationId_name: { organizationId: demoOrg.id, name: "Прочие доходы" } },
    update: {},
    create: { organizationId: demoOrg.id, name: "Прочие доходы", color: "#059669" },
  });
  await prisma.income.createMany({
    data: [
      { organizationId: demoOrg.id, branchId: mainBranch.id, categoryId: incCat.id, description: "Возврат от поставщика", amount: 500000, createdBy: adminUser.id },
    ],
  });

  // ─── Exchange rates ───────────────────────────────────────────────────────────
  await prisma.exchangeRate.createMany({
    data: [
      { organizationId: demoOrg.id, fromCurrency: "USD", toCurrency: "UZS", rate: 12750, source: "CBU_API" },
      { organizationId: demoOrg.id, fromCurrency: "EUR", toCurrency: "UZS", rate: 14100, source: "CBU_API" },
      { organizationId: demoOrg.id, fromCurrency: "RUB", toCurrency: "UZS", rate: 135, source: "CBU_API" },
      { organizationId: demoOrg.id, fromCurrency: "CNY", toCurrency: "UZS", rate: 1760, source: "CBU_API" },
    ],
  });

  console.log("✅ Exchange rates, expenses, income created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("━".repeat(50));
  console.log("📝 Login credentials:");
  console.log("   SuperAdmin: superadmin / Admin123!");
  console.log("   Admin:      admin / Admin123!");
  console.log("   Cashier:    cashier / Admin123!");
  console.log("   Warehouse:  warehouse / Admin123!");
  console.log("━".repeat(50));
  console.log("🌐 App URL: http://localhost:3000");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
