-- Demo seed: categories, products, inventory, suppliers, customers,
-- sales, purchases, expenses, incomes, notifications.
-- Records are distributed across ALL users in the organization.
-- Run as: PGPASSWORD='...' psql -h HOST -U salesapp -d salesdb -f seed-demo.sql

DO $$
DECLARE
  v_org_id      TEXT;
  v_branch_id   TEXT;
  v_user_ids    TEXT[];
  v_user_count  INT;

  -- categories
  c_electronics TEXT := gen_random_uuid()::text;
  c_food        TEXT := gen_random_uuid()::text;
  c_clothing    TEXT := gen_random_uuid()::text;
  c_home        TEXT := gen_random_uuid()::text;
  c_beauty      TEXT := gen_random_uuid()::text;
  c_sports      TEXT := gen_random_uuid()::text;

  -- products (20)
  p1  TEXT := gen_random_uuid()::text;
  p2  TEXT := gen_random_uuid()::text;
  p3  TEXT := gen_random_uuid()::text;
  p4  TEXT := gen_random_uuid()::text;
  p5  TEXT := gen_random_uuid()::text;
  p6  TEXT := gen_random_uuid()::text;
  p7  TEXT := gen_random_uuid()::text;
  p8  TEXT := gen_random_uuid()::text;
  p9  TEXT := gen_random_uuid()::text;
  p10 TEXT := gen_random_uuid()::text;
  p11 TEXT := gen_random_uuid()::text;
  p12 TEXT := gen_random_uuid()::text;
  p13 TEXT := gen_random_uuid()::text;
  p14 TEXT := gen_random_uuid()::text;
  p15 TEXT := gen_random_uuid()::text;
  p16 TEXT := gen_random_uuid()::text;
  p17 TEXT := gen_random_uuid()::text;
  p18 TEXT := gen_random_uuid()::text;
  p19 TEXT := gen_random_uuid()::text;
  p20 TEXT := gen_random_uuid()::text;

  -- suppliers (5)
  sup1 TEXT := gen_random_uuid()::text;
  sup2 TEXT := gen_random_uuid()::text;
  sup3 TEXT := gen_random_uuid()::text;
  sup4 TEXT := gen_random_uuid()::text;
  sup5 TEXT := gen_random_uuid()::text;

  -- customers (10)
  cust_ids TEXT[];

  -- expense / income category IDs
  ecat1 TEXT := gen_random_uuid()::text;
  ecat2 TEXT := gen_random_uuid()::text;
  ecat3 TEXT := gen_random_uuid()::text;
  icat1 TEXT := gen_random_uuid()::text;
  icat2 TEXT := gen_random_uuid()::text;

  -- loop helpers
  i          INT;
  sale_id    TEXT;
  pay_id     TEXT;
  pur_id     TEXT;
  sale_date  TIMESTAMP;
  prod_arr   TEXT[];
  prod_id    TEXT;
  qty        NUMERIC;
  price      NUMERIC;
  total_amt  NUMERIC;
  receipt_no TEXT;
  cashier_id TEXT;
BEGIN
  -- ── Resolve existing org / branch ─────────────────────────────────────────
  SELECT id INTO v_org_id    FROM "Organization" ORDER BY "createdAt" LIMIT 1;
  SELECT id INTO v_branch_id FROM "Branch" WHERE "organizationId" = v_org_id LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found. Create one first.';
  END IF;

  -- ── Collect ALL users in the org (or superadmin if none) ──────────────────
  SELECT ARRAY_AGG(id ORDER BY "createdAt") INTO v_user_ids
  FROM "User"
  WHERE "organizationId" = v_org_id AND "isActive" = true AND "isBlocked" = false;

  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) = 0 THEN
    SELECT ARRAY_AGG(id ORDER BY "createdAt") INTO v_user_ids
    FROM "User" WHERE role = 'SUPERADMIN' AND "isActive" = true LIMIT 1;
  END IF;

  v_user_count := array_length(v_user_ids, 1);
  RAISE NOTICE 'Found % user(s): %', v_user_count, v_user_ids;

  -- ── Categories ─────────────────────────────────────────────────────────────
  INSERT INTO "ProductCategory"(id, "organizationId", name, slug, color, "isActive", "sortOrder", "createdAt", "updatedAt")
  VALUES
    (c_electronics, v_org_id, 'Электроника',  'electronics', '#6366f1', true, 1, now(), now()),
    (c_food,        v_org_id, 'Продукты',     'food',        '#22c55e', true, 2, now(), now()),
    (c_clothing,    v_org_id, 'Одежда',       'clothing',    '#f59e0b', true, 3, now(), now()),
    (c_home,        v_org_id, 'Дом и быт',    'home',        '#06b6d4', true, 4, now(), now()),
    (c_beauty,      v_org_id, 'Красота',      'beauty',      '#ec4899', true, 5, now(), now()),
    (c_sports,      v_org_id, 'Спорт',        'sports',      '#f97316', true, 6, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── Products (20) ──────────────────────────────────────────────────────────
  INSERT INTO "Product"(id, "organizationId", "categoryId", name, sku, barcode,
    unit, "costPrice", "sellingPrice", "minStockLevel", "safetyStockLevel",
    "reorderPoint", "targetStockLevel", "leadTimeDays", "isActive", "isArchived", "createdAt", "updatedAt")
  VALUES
    (p1,  v_org_id, c_electronics, 'Смартфон Samsung A54',    'SKU-001', '4600001000010', 'шт',  550000,  750000,  5, 10, 15,  50, 7,  true, false, now(), now()),
    (p2,  v_org_id, c_electronics, 'Наушники JBL T450',       'SKU-002', '4600001000011', 'шт',   80000,  120000,  3,  5, 10,  30, 5,  true, false, now(), now()),
    (p3,  v_org_id, c_electronics, 'Зарядное устройство 65W', 'SKU-003', '4600001000012', 'шт',   25000,   45000,  5, 10, 20,  60, 3,  true, false, now(), now()),
    (p4,  v_org_id, c_electronics, 'USB кабель Type-C 2м',    'SKU-004', '4600001000013', 'шт',    5000,   12000, 10, 20, 30, 100, 2,  true, false, now(), now()),
    (p5,  v_org_id, c_electronics, 'Павербанк 20000 mAh',     'SKU-005', '4600001000014', 'шт',   85000,  130000,  3,  5, 10,  30, 7,  true, false, now(), now()),
    (p6,  v_org_id, c_food,        'Зелёный чай 100г',        'SKU-006', '4600001000015', 'упак',  8000,   15000, 10, 20, 40, 100, 4,  true, false, now(), now()),
    (p7,  v_org_id, c_food,        'Кофе Arabica 250г',       'SKU-007', '4600001000016', 'упак', 32000,   55000,  5, 10, 20,  60, 5,  true, false, now(), now()),
    (p8,  v_org_id, c_food,        'Шоколад Milka 100г',      'SKU-008', '4600001000017', 'шт',    7000,   14000, 10, 20, 40, 120, 3,  true, false, now(), now()),
    (p9,  v_org_id, c_food,        'Минеральная вода 1.5л',   'SKU-009', '4600001000018', 'шт',    2500,    5000, 20, 30, 50, 200, 2,  true, false, now(), now()),
    (p10, v_org_id, c_food,        'Сок апельсиновый 1л',     'SKU-010', '4600001000019', 'шт',    6000,   12000, 10, 20, 30, 100, 3,  true, false, now(), now()),
    (p11, v_org_id, c_clothing,    'Футболка хлопок M',       'SKU-011', '4600001000020', 'шт',   35000,   65000,  5, 10, 15,  50, 14, true, false, now(), now()),
    (p12, v_org_id, c_clothing,    'Джинсы slim fit L',       'SKU-012', '4600001000021', 'шт',  120000,  220000,  3,  5, 10,  30, 14, true, false, now(), now()),
    (p13, v_org_id, c_clothing,    'Кроссовки Nike 42',       'SKU-013', '4600001000022', 'пар', 280000,  450000,  2,  4,  8,  20, 21, true, false, now(), now()),
    (p14, v_org_id, c_home,        'Кастрюля 5л нержавейка',  'SKU-014', '4600001000023', 'шт',   95000,  160000,  2,  4,  8,  20, 10, true, false, now(), now()),
    (p15, v_org_id, c_home,        'Набор ножей 5 предм.',    'SKU-015', '4600001000024', 'набор',55000,  110000,  2,  5, 10,  25, 10, true, false, now(), now()),
    (p16, v_org_id, c_home,        'Полотенце банное 70x140', 'SKU-016', '4600001000025', 'шт',   22000,   42000,  5, 10, 20,  60, 7,  true, false, now(), now()),
    (p17, v_org_id, c_beauty,      'Шампунь Pantene 400мл',   'SKU-017', '4600001000026', 'шт',   18000,   32000,  5, 10, 20,  60, 5,  true, false, now(), now()),
    (p18, v_org_id, c_beauty,      'Крем для рук 75мл',       'SKU-018', '4600001000027', 'шт',   12000,   22000,  5, 10, 20,  80, 5,  true, false, now(), now()),
    (p19, v_org_id, c_sports,      'Гантели 5кг пара',        'SKU-019', '4600001000028', 'пар',  75000,  130000,  2,  4,  8,  20, 14, true, false, now(), now()),
    (p20, v_org_id, c_sports,      'Коврик для йоги',         'SKU-020', '4600001000029', 'шт',   40000,   75000,  3,  5, 10,  30, 10, true, false, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── Inventory (20 rows, one per product at main branch) ────────────────────
  IF v_branch_id IS NOT NULL THEN
    INSERT INTO "Inventory"(id, "productId", "branchId", quantity, "reservedQty", "updatedAt")
    VALUES
      (gen_random_uuid()::text, p1,  v_branch_id, 42,  0, now()),
      (gen_random_uuid()::text, p2,  v_branch_id, 85,  0, now()),
      (gen_random_uuid()::text, p3,  v_branch_id, 130, 0, now()),
      (gen_random_uuid()::text, p4,  v_branch_id, 200, 0, now()),
      (gen_random_uuid()::text, p5,  v_branch_id, 38,  0, now()),
      (gen_random_uuid()::text, p6,  v_branch_id, 95,  0, now()),
      (gen_random_uuid()::text, p7,  v_branch_id, 60,  0, now()),
      (gen_random_uuid()::text, p8,  v_branch_id, 180, 0, now()),
      (gen_random_uuid()::text, p9,  v_branch_id, 250, 0, now()),
      (gen_random_uuid()::text, p10, v_branch_id, 120, 0, now()),
      (gen_random_uuid()::text, p11, v_branch_id, 55,  0, now()),
      (gen_random_uuid()::text, p12, v_branch_id, 28,  0, now()),
      (gen_random_uuid()::text, p13, v_branch_id, 18,  0, now()),
      (gen_random_uuid()::text, p14, v_branch_id, 22,  0, now()),
      (gen_random_uuid()::text, p15, v_branch_id, 30,  0, now()),
      (gen_random_uuid()::text, p16, v_branch_id, 70,  0, now()),
      (gen_random_uuid()::text, p17, v_branch_id, 90,  0, now()),
      (gen_random_uuid()::text, p18, v_branch_id, 110, 0, now()),
      (gen_random_uuid()::text, p19, v_branch_id, 15,  0, now()),
      (gen_random_uuid()::text, p20, v_branch_id, 25,  0, now())
    ON CONFLICT ("productId", "branchId") DO UPDATE SET quantity = EXCLUDED.quantity;
  END IF;

  -- ── Suppliers (5) ──────────────────────────────────────────────────────────
  INSERT INTO "Supplier"(id, "organizationId", "companyName", "contactName", phone, email,
    address, "leadTimeDays", rating, "isActive", "currentBalance", "createdAt", "updatedAt")
  VALUES
    (sup1, v_org_id, 'ООО ТехноИмпорт',   'Алиев Бахром',    '+998901234567', 'techno@example.com',  'Ташкент, ул. Навои 5',    7,  4.5, true, 0, now(), now()),
    (sup2, v_org_id, 'АО ПродТрейд',      'Каримова Зилола', '+998907654321', 'prod@example.com',    'Самарканд, ул. Ленина 12', 5, 4.8, true, 0, now(), now()),
    (sup3, v_org_id, 'ИП Рахимов Т.',     'Рахимов Тимур',   '+998901112233', 'rahim@example.com',   'Бухара, ул. Мира 7',       10,3.9, true, 0, now(), now()),
    (sup4, v_org_id, 'Fashion Group LLC', 'Yusupov Asilbek', '+998909998877', 'fashion@example.com', 'Ташкент, Юнусабад 15',    14, 4.2, true, 0, now(), now()),
    (sup5, v_org_id, 'СпортПром',         'Назаров Дилшод',  '+998905556677', 'sport@example.com',   'Ташкент, Чиланзар 3',      7, 4.0, true, 0, now(), now())
  ON CONFLICT DO NOTHING;

  -- ── Customers (10) ─────────────────────────────────────────────────────────
  cust_ids := ARRAY[
    gen_random_uuid()::text, gen_random_uuid()::text, gen_random_uuid()::text,
    gen_random_uuid()::text, gen_random_uuid()::text, gen_random_uuid()::text,
    gen_random_uuid()::text, gen_random_uuid()::text, gen_random_uuid()::text,
    gen_random_uuid()::text
  ];

  INSERT INTO "Customer"(id, "organizationId", "fullName", phone, segment,
    "bonusBalance", "totalPurchased", "purchaseCount", "isActive", "createdAt", "updatedAt")
  VALUES
    (cust_ids[1],  v_org_id, 'Исмоилов Санжар',   '+998901000001', 'VIP',    50000, 1250000, 8,  true, now()-'90 days'::interval,  now()),
    (cust_ids[2],  v_org_id, 'Юсупова Малика',    '+998901000002', 'REGULAR',20000,  680000, 5,  true, now()-'60 days'::interval,  now()),
    (cust_ids[3],  v_org_id, 'Каримов Бобур',     '+998901000003', 'NEW',        0,  120000, 1,  true, now()-'10 days'::interval,  now()),
    (cust_ids[4],  v_org_id, 'Рашидова Нилуфар',  '+998901000004', 'REGULAR',15000,  450000, 4,  true, now()-'30 days'::interval,  now()),
    (cust_ids[5],  v_org_id, 'Хасанов Жамшид',    '+998901000005', 'VIP',    80000, 2100000, 12, true, now()-'120 days'::interval, now()),
    (cust_ids[6],  v_org_id, 'Турсунова Дилноза', '+998901000006', 'REGULAR',10000,  320000, 3,  true, now()-'45 days'::interval,  now()),
    (cust_ids[7],  v_org_id, 'Мирзаев Отабек',    '+998901000007', 'NEW',        0,   85000, 1,  true, now()-'5 days'::interval,   now()),
    (cust_ids[8],  v_org_id, 'Норматова Феруза',  '+998901000008', 'REGULAR',25000,  760000, 6,  true, now()-'20 days'::interval,  now()),
    (cust_ids[9],  v_org_id, 'Абдуллаев Сардор',  '+998901000009', 'VIP',    60000, 1800000, 10, true, now()-'75 days'::interval,  now()),
    (cust_ids[10], v_org_id, 'Эргашева Муаззам',  '+998901000010', 'NEW',        0,   55000, 1,  true, now()-'3 days'::interval,   now())
  ON CONFLICT DO NOTHING;

  -- ── Expense categories ──────────────────────────────────────────────────────
  INSERT INTO "ExpenseCategory"(id, "organizationId", name, color, "isActive", "createdAt")
  VALUES
    (ecat1, v_org_id, 'Аренда',       '#ef4444', true, now()),
    (ecat2, v_org_id, 'Зарплата',     '#f97316', true, now()),
    (ecat3, v_org_id, 'Коммунальные', '#84cc16', true, now())
  ON CONFLICT DO NOTHING;

  -- ── Income categories ───────────────────────────────────────────────────────
  INSERT INTO "IncomeCategory"(id, "organizationId", name, color, "isActive", "createdAt")
  VALUES
    (icat1, v_org_id, 'Инвестиции',    '#8b5cf6', true, now()),
    (icat2, v_org_id, 'Прочие доходы', '#06b6d4', true, now())
  ON CONFLICT DO NOTHING;

  -- ── 40 Sales — distributed across all users ────────────────────────────────
  prod_arr := ARRAY[p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,
                    p11,p12,p13,p14,p15,p16,p17,p18,p19,p20];

  IF v_branch_id IS NOT NULL THEN
    FOR i IN 1..40 LOOP
      -- round-robin user assignment
      cashier_id := v_user_ids[((i - 1) % v_user_count) + 1];
      sale_id    := gen_random_uuid()::text;
      sale_date  := now() - ((random() * 29)::int || ' days')::interval
                         - ((random() * 23)::int || ' hours')::interval;
      receipt_no := 'REC-' || LPAD(i::text, 5, '0');
      prod_id    := prod_arr[(i % 20) + 1];
      qty        := (1 + (random() * 3)::int)::numeric;
      price      := CASE (i % 20) + 1
                      WHEN 1  THEN 750000  WHEN 2  THEN 120000
                      WHEN 3  THEN 45000   WHEN 4  THEN 12000
                      WHEN 5  THEN 130000  WHEN 6  THEN 15000
                      WHEN 7  THEN 55000   WHEN 8  THEN 14000
                      WHEN 9  THEN 5000    WHEN 10 THEN 12000
                      WHEN 11 THEN 65000   WHEN 12 THEN 220000
                      WHEN 13 THEN 450000  WHEN 14 THEN 160000
                      WHEN 15 THEN 110000  WHEN 16 THEN 42000
                      WHEN 17 THEN 32000   WHEN 18 THEN 22000
                      WHEN 19 THEN 130000  ELSE 75000
                    END;
      total_amt  := qty * price;

      INSERT INTO "Sale"(id, "organizationId", "branchId", "cashierId",
        "customerId", "receiptNumber", status, "paymentType",
        subtotal, "discountAmount", total, "paidAmount", "debtAmount",
        currency, "createdAt", "updatedAt")
      VALUES (
        sale_id, v_org_id, v_branch_id, cashier_id,
        CASE WHEN i <= 10 THEN cust_ids[(i % 10) + 1] ELSE NULL END,
        receipt_no,
        CASE WHEN i % 10 = 0 THEN 'CANCELLED' ELSE 'COMPLETED' END,
        CASE i % 4 WHEN 0 THEN 'CASH' WHEN 1 THEN 'CARD'
                   WHEN 2 THEN 'CASH' ELSE 'TRANSFER' END,
        total_amt, 0, total_amt, total_amt, 0,
        'UZS', sale_date, sale_date
      );

      INSERT INTO "SaleItem"(id, "saleId", "productId", quantity, "unitPrice",
        "costPrice", discount, total, "createdAt")
      VALUES (gen_random_uuid()::text, sale_id, prod_id, qty, price,
        price * 0.72, 0, total_amt, sale_date);

      IF i % 10 != 0 THEN
        INSERT INTO "Payment"(id, "saleId", amount, "paymentType", currency, "paidAt")
        VALUES (gen_random_uuid()::text, sale_id, total_amt,
          CASE i % 4 WHEN 0 THEN 'CASH' WHEN 1 THEN 'CARD'
                     WHEN 2 THEN 'CASH' ELSE 'TRANSFER' END,
          'UZS', sale_date);
      END IF;
    END LOOP;
  END IF;

  -- ── 10 Expenses — distributed across users ─────────────────────────────────
  FOR i IN 1..10 LOOP
    INSERT INTO "Expense"(id, "organizationId", "branchId", "categoryId",
      amount, currency, description, status, "paidAt", "createdBy", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text, v_org_id, v_branch_id,
      CASE i % 3 WHEN 0 THEN ecat1 WHEN 1 THEN ecat2 ELSE ecat3 END,
      CASE i % 3 WHEN 0 THEN 3500000 WHEN 1 THEN 2000000 ELSE 450000 END,
      'UZS',
      CASE i % 3
        WHEN 0 THEN 'Аренда помещения'
        WHEN 1 THEN 'Зарплата сотрудникам'
        ELSE        'Оплата коммунальных услуг'
      END,
      'CONFIRMED',
      now() - ((i * 3) || ' days')::interval,
      v_user_ids[((i - 1) % v_user_count) + 1],
      now() - ((i * 3) || ' days')::interval,
      now()
    );
  END LOOP;

  -- ── 5 Incomes — distributed across users ───────────────────────────────────
  FOR i IN 1..5 LOOP
    INSERT INTO "Income"(id, "organizationId", "branchId", "categoryId",
      amount, currency, description, "receivedAt", "createdBy", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid()::text, v_org_id, v_branch_id,
      CASE i % 2 WHEN 0 THEN icat1 ELSE icat2 END,
      CASE i WHEN 1 THEN 10000000 WHEN 2 THEN 5000000
             WHEN 3 THEN 2000000  WHEN 4 THEN 1500000 ELSE 800000 END,
      'UZS',
      CASE i WHEN 1 THEN 'Вложение инвестора'
             WHEN 2 THEN 'Государственная субсидия'
             WHEN 3 THEN 'Возврат переплаты от поставщика'
             WHEN 4 THEN 'Доход от аренды торговой площади'
             ELSE        'Прочий доход' END,
      now() - ((i * 7) || ' days')::interval,
      v_user_ids[((i - 1) % v_user_count) + 1],
      now() - ((i * 7) || ' days')::interval,
      now()
    );
  END LOOP;

  -- ── 5 Purchases (one per supplier) ─────────────────────────────────────────
  IF v_branch_id IS NOT NULL THEN
    FOR i IN 1..5 LOOP
      pur_id := gen_random_uuid()::text;
      prod_id := prod_arr[i];

      INSERT INTO "Purchase"(id, "organizationId", "supplierId", "branchId",
        "invoiceNumber", status, total, "paidAmount", "debtAmount",
        currency, "receivedAt", "createdAt", "updatedAt")
      VALUES (
        pur_id, v_org_id,
        CASE i WHEN 1 THEN sup1 WHEN 2 THEN sup2 WHEN 3 THEN sup3
               WHEN 4 THEN sup4 ELSE sup5 END,
        v_branch_id,
        'INV-2026-' || LPAD(i::text, 4, '0'),
        'RECEIVED',
        CASE i WHEN 1 THEN 5500000 WHEN 2 THEN 3200000 WHEN 3 THEN 1600000
               WHEN 4 THEN 4200000 ELSE 2600000 END,
        CASE i WHEN 1 THEN 5500000 WHEN 2 THEN 3200000 WHEN 3 THEN 1600000
               WHEN 4 THEN 4200000 ELSE 2600000 END,
        0, 'UZS',
        now() - ((i * 5) || ' days')::interval,
        now() - ((i * 5) || ' days')::interval,
        now()
      );

      INSERT INTO "PurchaseItem"(id, "purchaseId", "productId", quantity, "costPrice", total)
      VALUES (
        gen_random_uuid()::text, pur_id, prod_id,
        CASE i WHEN 1 THEN 10 WHEN 2 THEN 40 WHEN 3 THEN 64
               WHEN 4 THEN 15 ELSE 32 END,
        CASE i WHEN 1 THEN 550000 WHEN 2 THEN 80000 WHEN 3 THEN 25000
               WHEN 4 THEN 280000 ELSE 75000 END,
        CASE i WHEN 1 THEN 5500000 WHEN 2 THEN 3200000 WHEN 3 THEN 1600000
               WHEN 4 THEN 4200000 ELSE 2400000 END
      );
    END LOOP;
  END IF;

  -- ── 5 Notifications ─────────────────────────────────────────────────────────
  INSERT INTO "Notification"(id, "organizationId", "userId", type, title, message, "isRead", "createdAt")
  VALUES
    (gen_random_uuid()::text, v_org_id, v_user_ids[1],
      'LOW_STOCK', 'Критический остаток: Кроссовки Nike 42',
      'Осталось 18 ед. Рекомендуется заказать у поставщика.', false, now()-'2 hours'::interval),
    (gen_random_uuid()::text, v_org_id, v_user_ids[1],
      'LOW_STOCK', 'Критический остаток: Гантели 5кг пара',
      'Остаток 15 ед. ниже точки перезаказа.', false, now()-'5 hours'::interval),
    (gen_random_uuid()::text, v_org_id,
      CASE WHEN v_user_count > 1 THEN v_user_ids[2] ELSE v_user_ids[1] END,
      'SALE', 'Продажа закрыта',
      'Чек #REC-00001 на сумму 750 000 сум.', true, now()-'1 day'::interval),
    (gen_random_uuid()::text, v_org_id,
      CASE WHEN v_user_count > 1 THEN v_user_ids[2] ELSE v_user_ids[1] END,
      'SUCCESS', 'Поставка получена',
      'Товары от ООО ТехноИмпорт приняты на склад.', true, now()-'3 days'::interval),
    (gen_random_uuid()::text, v_org_id, v_user_ids[1],
      'WARNING', 'Подписка истекает',
      'До окончания текущего тарифного плана осталось 7 дней.', false, now()-'30 minutes'::interval)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed complete for org=%: 6 categories, 20 products+inventory, '
    '5 suppliers, 10 customers, 40 sales (across % users), '
    '10 expenses, 5 incomes, 5 purchases, 5 notifications.',
    v_org_id, v_user_count;
END $$;
