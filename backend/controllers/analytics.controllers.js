const Utils = require('../service/utils');
const Sale = require('../models/sales.model');
const Product = require('../models/products.model');
const Tx = require('../models/finance.model');

exports.abc = async (req, res) => {
    try {
        const days = Math.max(1, Math.min(365, Number(req.query.days || 90)));
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - (days - 1));
        from.setHours(0, 0, 0, 0);

        const items = await Sale.Sale.aggregate([
            { $match: { status: 'completed', date: { $gte: from, $lte: to } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $last: '$items.name' },
                    sku: { $last: '$items.sku' },
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.total' },
                    cogs: { $sum: '$items.cogs' },
                    profit: { $sum: '$items.profit' },
                    sales: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
        ]);

        const totalRevenue = items.reduce((s, x) => s + (x.revenue || 0), 0);
        const totalCogs = items.reduce((s, x) => s + (x.cogs || 0), 0);
        const totalProfit = items.reduce((s, x) => s + (x.profit || 0), 0);
        let cum = 0;
        const enriched = items.map((it) => {
            cum += it.revenue;
            const cumPct = totalRevenue === 0 ? 0 : (cum / totalRevenue) * 100;
            const sharePct = totalRevenue === 0 ? 0 : (it.revenue / totalRevenue) * 100;
            const cls = cumPct <= 80 ? 'A' : cumPct <= 95 ? 'B' : 'C';
            const rev = it.revenue || 0;
            const prof = it.profit || 0;
            return {
                productId: it._id?.toString(),
                name: it.name,
                sku: it.sku,
                quantity: it.quantity,
                revenue: rev,
                cogs: it.cogs || 0,
                profit: prof,
                marginPct: rev > 0 ? (prof / rev) * 100 : 0,
                sales: it.sales,
                sharePct,
                cumPct,
                class: cls,
            };
        });

        const summary = {
            A: enriched.filter((x) => x.class === 'A').length,
            B: enriched.filter((x) => x.class === 'B').length,
            C: enriched.filter((x) => x.class === 'C').length,
            totalRevenue,
            totalCogs,
            totalProfit,
            totalMarginPct: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        };

        return res.status(200).json(Utils.envelope({
            body: { items: enriched, summary, range: { days } },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

exports.notifications = async (_req, res) => {
    try {
        const list = [];

        // Out of stock
        const outOfStock = await Product.Product
            .find({ isActive: true, stock: { $lte: 0 } })
            .sort({ updatedAt: -1 })
            .limit(8)
            .lean();
        for (const p of outOfStock) {
            list.push({
                kind: 'critical',
                icon: 'warning',
                title: `${p.name} — закончился`,
                description: `SKU ${p.sku}. Нужно срочно пополнить запас.`,
                relatedType: 'product',
                relatedId: p._id.toString(),
                createdAt: (p.updatedAt || new Date()).toISOString(),
            });
        }

        // Low stock
        const lowStock = await Product.Product
            .find({ isActive: true, stock: { $gt: 0, $lt: 5 } })
            .sort({ stock: 1 })
            .limit(8)
            .lean();
        for (const p of lowStock) {
            list.push({
                kind: 'warning',
                icon: 'inventory',
                title: `${p.name} — мало на складе`,
                description: `Остаток: ${p.stock} шт. Рекомендуется заказать.`,
                relatedType: 'product',
                relatedId: p._id.toString(),
                createdAt: (p.updatedAt || new Date()).toISOString(),
            });
        }

        // Recent big sales (>5M UZS)
        const bigSales = await Sale.Sale
            .find({ status: 'completed', total: { $gte: 5_000_000 } })
            .sort({ date: -1 })
            .limit(5)
            .lean();
        for (const s of bigSales) {
            list.push({
                kind: 'success',
                icon: 'receipt',
                title: `Крупная продажа ${s.number}`,
                description: `${s.total.toLocaleString()} UZS · ${s.items.length} поз.`,
                relatedType: 'sale',
                relatedId: s._id.toString(),
                createdAt: s.date.toISOString(),
            });
        }

        // Voided sales (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const voided = await Sale.Sale
            .find({ status: 'voided', updatedAt: { $gte: sevenDaysAgo } })
            .sort({ updatedAt: -1 })
            .limit(5)
            .lean();
        for (const s of voided) {
            list.push({
                kind: 'info',
                icon: 'cancel',
                title: `Аннулирована продажа ${s.number}`,
                description: `Возврат на сумму ${s.total.toLocaleString()} UZS`,
                relatedType: 'sale',
                relatedId: s._id.toString(),
                createdAt: (s.updatedAt || s.date).toISOString(),
            });
        }

        // Sort by createdAt desc
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const counts = list.reduce((acc, n) => {
            acc[n.kind] = (acc[n.kind] || 0) + 1;
            return acc;
        }, {});

        return res.status(200).json(Utils.envelope({
            body: { items: list, total: list.length, counts },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};

function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function defaultRange(days) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    return { from: startOfDay(from), to };
}

exports.overview = async (req, res) => {
    try {
        const days = Math.max(1, Math.min(90, Number(req.query.days || 14)));
        const { from, to } = defaultRange(days);

        // ── Sales totals ───────────────────────────────────────
        const salesTotals = await Sale.Sale.aggregate([
            { $match: { status: 'completed', date: { $gte: from, $lte: to } } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    revenue: { $sum: '$total' },
                    cogs: { $sum: '$totalCost' },
                    grossProfit: { $sum: '$totalProfit' },
                    discount: { $sum: '$discount' },
                    avg: { $avg: '$total' },
                },
            },
        ]);

        // ── Sales by day (line chart) ──────────────────────────
        const salesByDay = await Sale.Sale.aggregate([
            { $match: { status: 'completed', date: { $gte: from, $lte: to } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    revenue: { $sum: '$total' },
                    cogs: { $sum: '$totalCost' },
                    profit: { $sum: '$totalProfit' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill missing days with zeros so the chart looks dense
        const filled = [];
        const cur = new Date(from);
        while (cur <= to) {
            const key = cur.toISOString().slice(0, 10);
            const found = salesByDay.find((x) => x._id === key);
            filled.push({
                date: key,
                revenue: found?.revenue || 0,
                cogs: found?.cogs || 0,
                profit: found?.profit || 0,
                count: found?.count || 0,
            });
            cur.setDate(cur.getDate() + 1);
        }

        // ── Top products by revenue ────────────────────────────
        const topProducts = await Sale.Sale.aggregate([
            { $match: { status: 'completed', date: { $gte: from, $lte: to } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    name: { $last: '$items.name' },
                    sku: { $last: '$items.sku' },
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.total' },
                    cogs: { $sum: '$items.cogs' },
                    profit: { $sum: '$items.profit' },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
        ]);

        // ── Revenue by category ────────────────────────────────
        const byCategoryAgg = await Sale.Sale.aggregate([
            { $match: { status: 'completed', date: { $gte: from, $lte: to } } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product',
                },
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$product.category', 'general'] },
                    revenue: { $sum: '$items.total' },
                    cogs: { $sum: '$items.cogs' },
                    profit: { $sum: '$items.profit' },
                    quantity: { $sum: '$items.quantity' },
                },
            },
            { $sort: { revenue: -1 } },
        ]);

        // ── Stock alerts ───────────────────────────────────────
        const lowStock = await Product.Product
            .find({ isActive: true, stock: { $lte: 5 } })
            .sort({ stock: 1 })
            .limit(10)
            .lean();

        const outOfStock = await Product.Product
            .countDocuments({ isActive: true, stock: { $lte: 0 } });

        // ── Finance totals ─────────────────────────────────────
        const expense = await Tx.summary({ kind: 'expense', from, to });
        const income = await Tx.summary({ kind: 'income', from, to });

        const t = salesTotals[0] || {};
        const revenue = t.revenue || 0;
        const cogs = t.cogs || 0;
        const grossProfit = t.grossProfit != null ? t.grossProfit : Math.max(0, revenue - cogs);
        const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
        const grossRevenue = revenue + income.total;
        const totalExpense = expense.total;
        // Чистая прибыль = валовая прибыль с продаж + прочие доходы - расходы
        const netProfit = grossProfit + income.total - totalExpense;
        const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

        return res.status(200).json(Utils.envelope({
            body: {
                range: { days, from: from.toISOString(), to: to.toISOString() },
                kpis: {
                    salesCount: t.count || 0,
                    revenue,
                    cogs,
                    grossProfit,
                    grossMarginPct,
                    averageCheck: t.avg || 0,
                    discount: t.discount || 0,
                    grossRevenue,
                    totalExpense,
                    profit: netProfit,
                    netProfit,
                    netMarginPct,
                    outOfStock,
                    lowStockCount: lowStock.length,
                },
                salesByDay: filled,
                topProducts: topProducts.map((p) => {
                    const rev = p.revenue || 0;
                    const prof = p.profit || 0;
                    return {
                        productId: p._id?.toString(),
                        name: p.name,
                        sku: p.sku,
                        quantity: p.quantity,
                        revenue: rev,
                        cogs: p.cogs || 0,
                        profit: prof,
                        marginPct: rev > 0 ? (prof / rev) * 100 : 0,
                    };
                }),
                byCategory: byCategoryAgg.map((c) => {
                    const rev = c.revenue || 0;
                    const prof = c.profit || 0;
                    return {
                        category: c._id,
                        revenue: rev,
                        cogs: c.cogs || 0,
                        profit: prof,
                        marginPct: rev > 0 ? (prof / rev) * 100 : 0,
                        quantity: c.quantity,
                    };
                }),
                lowStock: lowStock.map((p) => ({
                    id: p._id.toString(),
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock,
                })),
                expenseByCategory: expense.byCategory,
                incomeByCategory: income.byCategory,
            },
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).json(Utils.envelope({ code: '9999', message: 'exception occurred', additionalMessage: err.message }));
    }
};
