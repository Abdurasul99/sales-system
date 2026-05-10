/**
 * seed.js — bootstraps users, categories, products and demo sales.
 * Users are idempotent. Categories, products, sales, customers, suppliers
 * and finance demo are wiped and re-seeded on every run so the demo always
 * matches the latest definition below.
 *
 *   node seed.js
 */
const mongoose = require('mongoose');
const db = require('./database/dbconnection');
const User = require('./models/users.model');
const Product = require('./models/products.model');
const Category = require('./models/categories.model');
const Sale = require('./models/sales.model');
const Customer = require('./models/customers.model');
const Supplier = require('./models/suppliers.model');
const Tx = require('./models/finance.model');

const SEED_USERS = [
    { name: 'Учредитель',         username: 'founder', password: 'founder123', role: 'founder', roleLabel: 'Учредитель' },
    { name: 'Менеджер',           username: 'manager', password: 'manager123', role: 'manager', roleLabel: 'Менеджер' },
    { name: 'Кассир / Завсклад',  username: 'cashier', password: 'cashier123', role: 'cashier', roleLabel: 'Кассир + Завсклад' },
    { name: 'Продавец-1',         username: 'seller',  password: 'seller123',  role: 'seller',  roleLabel: 'Продавец' },
];

// 12 категорий — узбекские ремёсла и сувениры
const SEED_CATEGORIES = [
    { name: "Yog'ochlar",         slug: 'yogochlar',        color: '#92400E', icon: 'park',            description: 'Резные изделия из дерева ручной работы' },
    { name: 'Latunlar',           slug: 'latunlar',         color: '#CA8A04', icon: 'build',           description: 'Латунные изделия — кумганы, подносы, чеканка' },
    { name: 'Keramika buyumlar',  slug: 'keramika',         color: '#0EA5E9', icon: 'restaurant',      description: 'Керамика Риштана, Гиждувана, Самарканда' },
    { name: 'Ayollar libosi',     slug: 'ayollar-libosi',   color: '#EC4899', icon: 'checkroom',       description: 'Женская национальная одежда — хан-атлас, адрас, шёлк' },
    { name: 'Erkaklar libosi',    slug: 'erkaklar-libosi',  color: '#1E40AF', icon: 'person',          description: 'Мужская национальная одежда — чапаны, халаты, жилеты' },
    { name: 'Pichoqlar',          slug: 'pichoqlar',        color: '#475569', icon: 'restaurant_menu', description: 'Чустские, шахрисабзские пчаки ручной ковки' },
    { name: 'Shkatulkalar',       slug: 'shkatulkalar',     color: '#B45309', icon: 'inventory_2',     description: 'Резные шкатулки с инкрустацией' },
    { name: 'Bosh kiyimlar',      slug: 'bosh-kiyimlar',    color: '#DC2626', icon: 'face',            description: 'Тюбетейки чустские, ироки, бухарские' },
    { name: 'Magnitlar',          slug: 'magnitlar',        color: '#F59E0B', icon: 'star',            description: 'Магниты-сувениры на холодильник' },
    { name: 'Sumkalar',           slug: 'sumkalar',         color: '#10B981', icon: 'shopping_bag',    description: 'Сумки сюзане, клатчи хан-атлас, рюкзаки адрас' },
    { name: 'Sharflar',           slug: 'sharflar',         color: '#8B5CF6', icon: 'waves',           description: 'Платки и шарфы — хан-атлас, икат, адрас' },
    { name: 'Panolar',            slug: 'panolar',          color: '#9333EA', icon: 'image',           description: 'Декоративные панно — сюзане, миниатюры, резьба' },
];

// price — розничная цена (UZS), cost — себестоимость (UZS), lt — lead time в днях.
// Маржа в среднем 45–60% (для ремесленного бизнеса).
const SEED_PRODUCTS = [
    // Yog'ochlar (дерево)
    { name: 'Лаух резной из карагача',          sku: 'WOOD-LAUH-01',     price:   850000, cost:  450000, lt: 21, stock: 12, category: 'yogochlar',       description: 'Подставка для Корана, ручная резьба' },
    { name: 'Доска для нард с резьбой',         sku: 'WOOD-NARD-01',     price:  1200000, cost:  650000, lt: 30, stock:  6, category: 'yogochlar',       description: 'Складная доска, резьба ислими' },
    { name: 'Подставка для книг резная',        sku: 'WOOD-BOOK-01',     price:   480000, cost:  240000, lt: 14, stock: 18, category: 'yogochlar',       description: 'Деревянная подставка, орех' },
    // Latunlar (латунь)
    { name: 'Кумган латунный гравированный',    sku: 'BRASS-KUMG-01',    price:  1800000, cost:  950000, lt: 21, stock:  8, category: 'latunlar',        description: 'Чеканка ручной работы, 1.5 л' },
    { name: 'Поднос латунный 40 см',            sku: 'BRASS-TRAY-40',    price:   950000, cost:  500000, lt: 14, stock: 10, category: 'latunlar',        description: 'Орнамент ислими, гравировка' },
    { name: 'Пиала латунная чеканка',           sku: 'BRASS-PIAL-01',    price:   380000, cost:  190000, lt: 14, stock: 24, category: 'latunlar',        description: 'Сувенирная пиала с чеканкой' },
    // Keramika
    { name: 'Ляган риштанский 35 см',           sku: 'CER-RISH-LAG35',   price:   480000, cost:  240000, lt: 14, stock: 20, category: 'keramika',        description: 'Синяя риштанская глазурь, ручная роспись' },
    { name: 'Чайник риштанский',                sku: 'CER-RISH-TEA',     price:   320000, cost:  150000, lt: 14, stock: 25, category: 'keramika',        description: 'Чайник с традиционной росписью' },
    { name: 'Пиалы риштанские (комплект 6 шт)', sku: 'CER-RISH-SET6',    price:   540000, cost:  280000, lt: 14, stock: 16, category: 'keramika',        description: 'Набор из 6 пиал' },
    { name: 'Ваза керамическая Самарканд',      sku: 'CER-SAM-VASE',     price:   780000, cost:  400000, lt: 21, stock:  9, category: 'keramika',        description: 'Самаркандская роспись, 30 см' },
    // Ayollar libosi
    { name: 'Платье хан-атлас классика',        sku: 'WOM-HAN-DRESS',    price:  1800000, cost:  950000, lt: 21, stock: 10, category: 'ayollar-libosi',  description: 'Длинное платье из натурального шёлка' },
    { name: 'Чапан женский шёлк',               sku: 'WOM-CHAP-SILK',    price:  2400000, cost: 1300000, lt: 30, stock:  6, category: 'ayollar-libosi',  description: 'Шёлковый чапан с подкладкой' },
    { name: 'Платье адрас длинное',             sku: 'WOM-ADR-DRESS',    price:  1350000, cost:  720000, lt: 21, stock:  8, category: 'ayollar-libosi',  description: 'Платье из ткани адрас' },
    // Erkaklar libosi
    { name: 'Чапан мужской бухарский',          sku: 'MEN-CHAP-BUKH',    price:  3200000, cost: 1750000, lt: 30, stock:  5, category: 'erkaklar-libosi', description: 'Бухарский чапан с золотой вышивкой' },
    { name: 'Халат адрас мужской',              sku: 'MEN-HAL-ADR',      price:  1950000, cost: 1050000, lt: 21, stock:  7, category: 'erkaklar-libosi', description: 'Традиционный халат адрас' },
    { name: 'Жилет шёлковый',                   sku: 'MEN-VEST-SILK',    price:   980000, cost:  490000, lt: 14, stock: 12, category: 'erkaklar-libosi', description: 'Шёлковый жилет с орнаментом' },
    // Pichoqlar
    { name: 'Чустский пчак ручной ковки',       sku: 'KNIFE-CHUST-01',   price:   850000, cost:  450000, lt: 21, stock: 14, category: 'pichoqlar',       description: 'Классический чустский пчак, рукоять кость' },
    { name: 'Шахрисабзский пчак',               sku: 'KNIFE-SHAHR-01',   price:   720000, cost:  380000, lt: 21, stock: 11, category: 'pichoqlar',       description: 'Пчак с инкрустацией рукояти' },
    { name: 'Набор пчаков 3 шт.',               sku: 'KNIFE-SET-3',      price:  1650000, cost:  900000, lt: 30, stock:  6, category: 'pichoqlar',       description: 'Подарочный набор в шкатулке' },
    // Shkatulkalar
    { name: 'Шкатулка наккоши',                 sku: 'BOX-NAKK-01',      price:   680000, cost:  340000, lt: 14, stock: 14, category: 'shkatulkalar',    description: 'Расписная шкатулка ручной работы' },
    { name: 'Шкатулка инкрустация перламутр',   sku: 'BOX-PERL-01',      price:  1250000, cost:  680000, lt: 21, stock:  7, category: 'shkatulkalar',    description: 'Резная шкатулка с перламутром' },
    { name: 'Шкатулка миниатюра',               sku: 'BOX-MINI-01',      price:   420000, cost:  210000, lt: 14, stock: 22, category: 'shkatulkalar',    description: 'Маленькая резная шкатулка' },
    // Bosh kiyimlar
    { name: 'Тюбетейка чустская мужская',       sku: 'HAT-CHUST-MEN',    price:   280000, cost:  130000, lt: 14, stock: 30, category: 'bosh-kiyimlar',   description: 'Классическая чустская дуппи' },
    { name: 'Тюбетейка ироки золотом',          sku: 'HAT-IROK-GOLD',    price:   450000, cost:  220000, lt: 14, stock: 18, category: 'bosh-kiyimlar',   description: 'Тюбетейка ироки с золотой вышивкой' },
    { name: 'Тюбетейка женская сюзане',         sku: 'HAT-SUZ-WOM',      price:   320000, cost:  150000, lt: 14, stock: 22, category: 'bosh-kiyimlar',   description: 'Женская тюбетейка с вышивкой сюзане' },
    { name: 'Топи бухарский золото',            sku: 'HAT-BUKH-GOLD',    price:   580000, cost:  290000, lt: 21, stock: 12, category: 'bosh-kiyimlar',   description: 'Бухарский топи с золотой вышивкой' },
    // Magnitlar
    { name: 'Магнит Регистан керамика',         sku: 'MAG-REG-CER',      price:    45000, cost:   18000, lt:  7, stock: 80, category: 'magnitlar',       description: 'Сувенирный магнит «Регистан»' },
    { name: 'Магнит Бухара дерево',             sku: 'MAG-BUKH-WOOD',    price:    50000, cost:   20000, lt:  7, stock: 65, category: 'magnitlar',       description: 'Деревянный резной магнит «Бухара»' },
    { name: 'Магнит-тюбетейка миниатюра',       sku: 'MAG-HAT-MINI',     price:    65000, cost:   25000, lt:  7, stock: 70, category: 'magnitlar',       description: 'Миниатюрная тюбетейка-магнит' },
    { name: 'Магнит Хива минарет',              sku: 'MAG-KHIV-MIN',     price:    55000, cost:   22000, lt:  7, stock: 58, category: 'magnitlar',       description: 'Магнит «Минарет Калта-Минор»' },
    // Sumkalar
    { name: 'Сумка сюзане ручная вышивка',      sku: 'BAG-SUZ-01',       price:   850000, cost:  430000, lt: 21, stock: 14, category: 'sumkalar',        description: 'Сумка с ручной вышивкой сюзане' },
    { name: 'Клатч хан-атлас',                  sku: 'BAG-HAN-CLU',      price:   480000, cost:  240000, lt: 14, stock: 20, category: 'sumkalar',        description: 'Вечерний клатч из хан-атласа' },
    { name: 'Рюкзак адрас',                     sku: 'BAG-ADR-BPK',      price:   720000, cost:  370000, lt: 21, stock: 16, category: 'sumkalar',        description: 'Рюкзак из ткани адрас' },
    // Sharflar
    { name: 'Платок хан-атлас шёлк',            sku: 'SCRF-HAN-01',      price:   580000, cost:  290000, lt: 14, stock: 28, category: 'sharflar',        description: 'Шёлковый платок хан-атлас' },
    { name: 'Шарф адрас длинный',               sku: 'SCRF-ADR-01',      price:   420000, cost:  210000, lt: 14, stock: 22, category: 'sharflar',        description: 'Длинный шарф адрас' },
    { name: 'Шарф икат шёлк',                   sku: 'SCRF-IKAT-01',     price:   750000, cost:  390000, lt: 21, stock: 18, category: 'sharflar',        description: 'Шёлковый шарф икат ручной окраски' },
    // Panolar
    { name: 'Панно сюзане большое',             sku: 'PAN-SUZ-LRG',      price:  3800000, cost: 2100000, lt: 30, stock:  4, category: 'panolar',         description: 'Декоративное панно сюзане 150×100 см' },
    { name: 'Панно резное дерево',              sku: 'PAN-WOOD-01',      price:  2500000, cost: 1350000, lt: 30, stock:  5, category: 'panolar',         description: 'Резное панно из ореха' },
    { name: 'Панно с миниатюрой',               sku: 'PAN-MINI-01',      price:  1800000, cost:  950000, lt: 30, stock:  7, category: 'panolar',         description: 'Панно с традиционной миниатюрой' },
];

// Demo sales — реальные сценарии для ремесленного магазина: туристы, оптовики, отели
const DEMO_SALES = [
    { items: [{ sku: 'MAG-REG-CER', qty: 3 }, { sku: 'MAG-HAT-MINI', qty: 2 }, { sku: 'SCRF-HAN-01', qty: 1 }],            paymentMethod: 'cash',     customer: { name: 'Турист (Германия)' },                                              daysAgo: 0 },
    { items: [{ sku: 'CER-RISH-LAG35', qty: 4 }, { sku: 'CER-RISH-TEA', qty: 4 }],                                            paymentMethod: 'transfer', customer: { name: 'OOO «Bukhara Tour»', phone: '+998712334455' },                       daysAgo: 0 },
    { items: [{ sku: 'MEN-CHAP-BUKH', qty: 1 }, { sku: 'HAT-BUKH-GOLD', qty: 1 }],                                            paymentMethod: 'card',     customer: { name: 'Алишер Каримов',     phone: '+998901112233' },                       daysAgo: 1 },
    { items: [{ sku: 'WOM-HAN-DRESS', qty: 1 }, { sku: 'SCRF-IKAT-01', qty: 1 }, { sku: 'BAG-HAN-CLU', qty: 1 }],            paymentMethod: 'card',     customer: { name: 'Зарина Алиева',      phone: '+998947778899' },                       daysAgo: 1 },
    { items: [{ sku: 'MAG-BUKH-WOOD', qty: 5 }, { sku: 'MAG-KHIV-MIN', qty: 3 }],                                              paymentMethod: 'cash',     customer: { name: 'Турист (Франция)' },                                                daysAgo: 2 },
    { items: [{ sku: 'KNIFE-CHUST-01', qty: 2 }, { sku: 'BOX-NAKK-01', qty: 1 }],                                              paymentMethod: 'card',     customer: { name: 'Дилшод Юсупов',      phone: '+998935554477' },                       daysAgo: 2 },
    { items: [{ sku: 'WOOD-LAUH-01', qty: 2 }, { sku: 'WOOD-BOOK-01', qty: 3 }, { sku: 'BRASS-PIAL-01', qty: 4 }],          paymentMethod: 'transfer', customer: { name: 'Hotel Rixos Tashkent', phone: '+998712010203' },                    daysAgo: 3 },
    { items: [{ sku: 'BAG-SUZ-01', qty: 1 }, { sku: 'MAG-REG-CER', qty: 2 }],                                                  paymentMethod: 'cash',     customer: { name: 'Турист (Япония)' },                                                  daysAgo: 3 },
    { items: [{ sku: 'KNIFE-SET-3', qty: 1 }, { sku: 'BOX-PERL-01', qty: 1 }],                                                 paymentMethod: 'card',     customer: { name: 'Шахзод Турсунов',    phone: '+998991234567' },                       daysAgo: 4 },
    { items: [{ sku: 'PAN-SUZ-LRG', qty: 1 }],                                                                                  paymentMethod: 'transfer', customer: { name: 'Малика Юлдашева',    phone: '+998931112244' },                       daysAgo: 5 },
    { items: [{ sku: 'HAT-CHUST-MEN', qty: 4 }, { sku: 'HAT-IROK-GOLD', qty: 2 }],                                             paymentMethod: 'transfer', customer: { name: 'OOO «Hunarmand»',    phone: '+998712445566' },                       daysAgo: 5 },
    { items: [{ sku: 'BRASS-KUMG-01', qty: 1 }, { sku: 'BRASS-TRAY-40', qty: 1 }],                                              paymentMethod: 'card',     customer: { name: 'Бахром Холмурадов',  phone: '+998906667788' },                       daysAgo: 6 },
];

const SEED_CUSTOMERS = [
    { name: 'Алишер Каримов',       phone: '+998901112233', company: '',                  address: 'Ташкент, Юнусабад',         notes: 'Постоянный клиент, бухарские чапаны' },
    { name: 'Зарина Алиева',        phone: '+998947778899', company: '',                  address: 'Самарканд' },
    { name: 'Дилшод Юсупов',        phone: '+998935554477', company: '',                  address: 'Ташкент, Чиланзар' },
    { name: 'Шахзод Турсунов',      phone: '+998991234567', company: '',                  address: 'Ташкент' },
    { name: 'Малика Юлдашева',      phone: '+998931112244', company: '' },
    { name: 'Бахром Холмурадов',    phone: '+998906667788', company: '' },
    { name: 'OOO «Bukhara Tour»',   phone: '+998712334455', company: 'Bukhara Tour',      address: 'Бухара, Ляби-Хауз',         notes: 'Турагентство, оптовые заказы керамики' },
    { name: 'OOO «Hunarmand»',      phone: '+998712445566', company: 'Hunarmand Markazi', address: 'Ташкент, Чорсу',            notes: 'Перепродажа на рынок Чорсу' },
    { name: 'Hotel Rixos Tashkent', phone: '+998712010203', company: 'Rixos Hotels',      address: 'Ташкент, ул. Амира Темура', notes: 'Корпоративные подарки гостям' },
    { name: 'Турист (Германия)',    phone: '',              company: '',                  notes: 'Анонимный покупатель — туристы' },
    { name: 'Турист (Франция)',     phone: '',              company: '' },
    { name: 'Турист (Япония)',      phone: '',              company: '' },
    { name: 'Гость',                phone: '',              company: '',                  notes: 'Анонимный покупатель' },
];

const SEED_SUPPLIERS = [
    { name: 'Риштанские керамисты',         contactPerson: 'Алишер Назруллаев',    phone: '+998732221122', email: 'rishtan@masterskaya.uz', category: 'keramika',         address: 'Ферганская обл., Риштан' },
    { name: 'Чустский цех «Пчакчилик»',     contactPerson: 'Усто Рустам',           phone: '+998732332244',                                  category: 'pichoqlar',        address: 'Ферганская обл., Чуст' },
    { name: 'Бухарские мастера сюзане',     contactPerson: 'Дилфуза Рахматова',     phone: '+998652443355', email: 'suzane@bukhara.uz',     category: 'sumkalar',         address: 'Бухара, ремесленный квартал' },
    { name: 'Самарканд — резьба и чеканка', contactPerson: 'Усто Темур',            phone: '+998662554466',                                  category: 'yogochlar',        address: 'Самарканд' },
    { name: 'Маргиланский шёлк',            contactPerson: 'Гулнора Эшматова',      phone: '+998732665577', email: 'silk@margilan.uz',      category: 'ayollar-libosi',   address: 'Маргилан, Едгорлик' },
    { name: 'Шахрисабз — ремёсла',          contactPerson: 'Усто Карим',            phone: '+998752776688',                                  category: 'shkatulkalar',     address: 'Шахрисабз' },
    { name: 'Чуст — тюбетейка-цех',         contactPerson: 'Махсума Холматова',     phone: '+998732887799',                                  category: 'bosh-kiyimlar',    address: 'Чуст' },
    { name: 'Сувениры Узбекистана',         contactPerson: 'Анвар Шарипов',         phone: '+998712998800', email: 'wholesale@suvenir.uz',  category: 'magnitlar',        address: 'Ташкент, Чорсу' },
];

const SEED_TX = [
    { kind: 'expense', amount:  3500000, category: 'rent',         description: 'Аренда магазина за май',           paymentMethod: 'transfer', daysAgo: 1 },
    { kind: 'expense', amount:   850000, category: 'utilities',    description: 'Электричество и интернет',         paymentMethod: 'transfer', daysAgo: 2 },
    { kind: 'expense', amount:  4200000, category: 'salary',       description: 'Зарплата кассирам и продавцу',     paymentMethod: 'cash',     daysAgo: 3 },
    { kind: 'expense', amount:   650000, category: 'marketing',    description: 'Реклама в Instagram',              paymentMethod: 'card',     daysAgo: 4 },
    { kind: 'expense', amount:   180000, category: 'office',       description: 'Канцелярия и упаковка для сувениров', paymentMethod: 'cash',  daysAgo: 5 },
    { kind: 'income',  amount:  1500000, category: 'investments',  description: 'Доход от вложений',                paymentMethod: 'transfer', daysAgo: 2 },
    { kind: 'income',  amount:   320000, category: 'refund',       description: 'Возврат от поставщика керамики',   paymentMethod: 'transfer', daysAgo: 6 },
];

(async () => {
    try {
        await db.connect();

        console.log('=== seeding users ===');
        for (const data of SEED_USERS) {
            const existing = await User.findUserByUsername(data.username);
            if (existing) {
                console.log(`  - ${data.username}: already exists`);
                continue;
            }
            const created = await User.createUser(data);
            console.log(created
                ? `  + ${data.username} / ${data.password}  (${data.roleLabel})`
                : `  ! failed to create ${data.username}`);
        }

        // Wipe demo data so categories/products/sales/customers/suppliers/finance
        // always reflect the latest seed definitions.
        console.log('=== resetting demo collections ===');
        await Promise.all([
            Category.Category.deleteMany({}),
            Product.Product.deleteMany({}),
            Sale.Sale.deleteMany({}),
            Customer.Customer.deleteMany({}),
            Supplier.Supplier.deleteMany({}),
            Tx.Transaction.deleteMany({}),
        ]);
        console.log('  cleared categories / products / sales / customers / suppliers / transactions');

        console.log('=== seeding categories ===');
        for (const data of SEED_CATEGORIES) {
            const created = await Category.create(data);
            console.log(created
                ? `  + ${data.slug.padEnd(18)} ${data.name}`
                : `  ! failed to create ${data.slug}`);
        }

        console.log('=== seeding products ===');
        const founder = await User.findUserByUsername('founder');
        for (const data of SEED_PRODUCTS) {
            const { lt, ...rest } = data;
            const created = await Product.createProduct(
                { ...rest, currency: 'UZS', leadTimeDays: lt, unit: 'шт' },
                founder?._id,
            );
            console.log(created
                ? `  + ${data.sku.padEnd(20)} ${data.name.padEnd(40)} цена=${data.price.toLocaleString().padStart(10)} себ=${data.cost.toLocaleString().padStart(10)}`
                : `  ! failed to create ${data.sku}`);
        }

        console.log('=== seeding demo sales ===');
        const cashier = await User.findUserByUsername('cashier');
        const cashierBlock = cashier ? {
            id: cashier._id,
            name: cashier.name,
            username: cashier.username,
        } : undefined;

        for (const draft of DEMO_SALES) {
            const items = [];
            let subtotal = 0;
            let totalCost = 0;
            let valid = true;
            for (const it of draft.items) {
                const product = await Product.Product.findOne({ sku: it.sku });
                if (!product) {
                    console.log(`  ! product ${it.sku} not found, skipping sale`);
                    valid = false;
                    break;
                }
                if (product.stock < it.qty) {
                    valid = false;
                    break;
                }
                const cost = product.cost || 0;
                const lineTotal = product.price * it.qty;
                const lineCogs = cost * it.qty;
                const lineProfit = lineTotal - lineCogs;
                items.push({
                    productId: product._id,
                    name: product.name,
                    sku: product.sku,
                    price: product.price,
                    cost,
                    quantity: it.qty,
                    total: lineTotal,
                    cogs: lineCogs,
                    profit: lineProfit,
                });
                subtotal += lineTotal;
                totalCost += lineCogs;
                product.stock -= it.qty;
                await product.save();
            }
            if (!valid) continue;

            const date = new Date();
            date.setDate(date.getDate() - (draft.daysAgo || 0));
            const totalProfit = subtotal - totalCost;
            const sale = await Sale.create({
                items,
                subtotal,
                discount: 0,
                tax: 0,
                total: subtotal,
                totalCost,
                totalProfit,
                currency: 'UZS',
                paymentMethod: draft.paymentMethod,
                customer: draft.customer || {},
                cashier: cashierBlock,
                date,
            });
            const margin = subtotal > 0 ? ((totalProfit / subtotal) * 100).toFixed(1) : '0';
            console.log(`  + ${sale.number}  ${items.length} поз.  выручка ${subtotal.toLocaleString()}  прибыль ${totalProfit.toLocaleString()}  (${margin}%)  — ${draft.customer?.name || '—'}`);
        }

        console.log('=== seeding customers ===');
        for (const c of SEED_CUSTOMERS) {
            const created = await Customer.create(c);
            console.log(created ? `  + ${c.name}` : `  ! failed ${c.name}`);
        }

        console.log('=== seeding suppliers ===');
        for (const s of SEED_SUPPLIERS) {
            const created = await Supplier.create(s);
            console.log(created ? `  + ${s.name}` : `  ! failed ${s.name}`);
        }

        console.log('=== seeding finance demo ===');
        for (const t of SEED_TX) {
            const date = new Date();
            date.setDate(date.getDate() - (t.daysAgo || 0));
            await Tx.create({ ...t, date });
            console.log(`  + ${t.kind.padEnd(7)} ${t.amount.toString().padStart(9)} ${t.description}`);
        }

        console.log('=== seed done ===');
    } catch (err) {
        console.error('seed error:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
