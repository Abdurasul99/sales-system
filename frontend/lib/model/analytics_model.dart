class AnalyticsKpi {
  const AnalyticsKpi({
    required this.salesCount,
    required this.revenue,
    required this.cogs,
    required this.grossProfit,
    required this.grossMarginPct,
    required this.averageCheck,
    required this.discount,
    required this.grossRevenue,
    required this.totalExpense,
    required this.profit,
    required this.netProfit,
    required this.netMarginPct,
    required this.outOfStock,
    required this.lowStockCount,
  });

  final num salesCount;
  final num revenue;
  final num cogs;
  final num grossProfit;
  final num grossMarginPct;
  final num averageCheck;
  final num discount;
  final num grossRevenue;
  final num totalExpense;
  final num profit;
  final num netProfit;
  final num netMarginPct;
  final num outOfStock;
  final num lowStockCount;

  factory AnalyticsKpi.fromJson(Map<String, dynamic> j) {
    final rev = (j['revenue'] is num) ? j['revenue'] as num : 0;
    final cogs = (j['cogs'] is num) ? j['cogs'] as num : 0;
    final grossProfit = (j['grossProfit'] is num)
        ? j['grossProfit'] as num
        : (rev - cogs);
    final netProfit = (j['netProfit'] is num)
        ? j['netProfit'] as num
        : ((j['profit'] is num) ? j['profit'] as num : 0);
    return AnalyticsKpi(
      salesCount: (j['salesCount'] is num) ? j['salesCount'] as num : 0,
      revenue: rev,
      cogs: cogs,
      grossProfit: grossProfit,
      grossMarginPct: (j['grossMarginPct'] is num)
          ? j['grossMarginPct'] as num
          : (rev > 0 ? (grossProfit / rev) * 100 : 0),
      averageCheck: (j['averageCheck'] is num) ? j['averageCheck'] as num : 0,
      discount: (j['discount'] is num) ? j['discount'] as num : 0,
      grossRevenue:
          (j['grossRevenue'] is num) ? j['grossRevenue'] as num : 0,
      totalExpense:
          (j['totalExpense'] is num) ? j['totalExpense'] as num : 0,
      profit: (j['profit'] is num) ? j['profit'] as num : netProfit,
      netProfit: netProfit,
      netMarginPct: (j['netMarginPct'] is num) ? j['netMarginPct'] as num : 0,
      outOfStock: (j['outOfStock'] is num) ? j['outOfStock'] as num : 0,
      lowStockCount:
          (j['lowStockCount'] is num) ? j['lowStockCount'] as num : 0,
    );
  }

  static const empty = AnalyticsKpi(
    salesCount: 0,
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    grossMarginPct: 0,
    averageCheck: 0,
    discount: 0,
    grossRevenue: 0,
    totalExpense: 0,
    profit: 0,
    netProfit: 0,
    netMarginPct: 0,
    outOfStock: 0,
    lowStockCount: 0,
  );
}

class SalesPoint {
  const SalesPoint({
    required this.date,
    required this.revenue,
    required this.cogs,
    required this.profit,
    required this.count,
  });
  final DateTime date;
  final num revenue;
  final num cogs;
  final num profit;
  final num count;

  factory SalesPoint.fromJson(Map<String, dynamic> j) => SalesPoint(
        date: DateTime.tryParse(j['date']?.toString() ?? '') ?? DateTime.now(),
        revenue: (j['revenue'] is num) ? j['revenue'] as num : 0,
        cogs: (j['cogs'] is num) ? j['cogs'] as num : 0,
        profit: (j['profit'] is num) ? j['profit'] as num : 0,
        count: (j['count'] is num) ? j['count'] as num : 0,
      );
}

class TopProduct {
  const TopProduct({
    required this.productId,
    required this.name,
    required this.sku,
    required this.quantity,
    required this.revenue,
    required this.cogs,
    required this.profit,
    required this.marginPct,
  });
  final String productId;
  final String name;
  final String sku;
  final num quantity;
  final num revenue;
  final num cogs;
  final num profit;
  final num marginPct;

  factory TopProduct.fromJson(Map<String, dynamic> j) {
    final rev = (j['revenue'] is num) ? j['revenue'] as num : 0;
    final profit = (j['profit'] is num) ? j['profit'] as num : 0;
    return TopProduct(
      productId: (j['productId'] ?? '').toString(),
      name: (j['name'] ?? '').toString(),
      sku: (j['sku'] ?? '').toString(),
      quantity: (j['quantity'] is num) ? j['quantity'] as num : 0,
      revenue: rev,
      cogs: (j['cogs'] is num) ? j['cogs'] as num : 0,
      profit: profit,
      marginPct: (j['marginPct'] is num)
          ? j['marginPct'] as num
          : (rev > 0 ? (profit / rev) * 100 : 0),
    );
  }
}

class CategorySlice {
  const CategorySlice({
    required this.category,
    required this.revenue,
    required this.cogs,
    required this.profit,
    required this.marginPct,
    required this.quantity,
  });
  final String category;
  final num revenue;
  final num cogs;
  final num profit;
  final num marginPct;
  final num quantity;

  factory CategorySlice.fromJson(Map<String, dynamic> j) {
    final rev = (j['revenue'] is num) ? j['revenue'] as num : 0;
    final profit = (j['profit'] is num) ? j['profit'] as num : 0;
    return CategorySlice(
      category: (j['category'] ?? '').toString(),
      revenue: rev,
      cogs: (j['cogs'] is num) ? j['cogs'] as num : 0,
      profit: profit,
      marginPct: (j['marginPct'] is num)
          ? j['marginPct'] as num
          : (rev > 0 ? (profit / rev) * 100 : 0),
      quantity: (j['quantity'] is num) ? j['quantity'] as num : 0,
    );
  }
}

class LowStockProduct {
  const LowStockProduct({
    required this.id,
    required this.name,
    required this.sku,
    required this.stock,
  });
  final String id;
  final String name;
  final String sku;
  final num stock;

  factory LowStockProduct.fromJson(Map<String, dynamic> j) => LowStockProduct(
        id: (j['id'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        sku: (j['sku'] ?? '').toString(),
        stock: (j['stock'] is num) ? j['stock'] as num : 0,
      );
}

class AnalyticsOverview {
  const AnalyticsOverview({
    required this.kpis,
    required this.salesByDay,
    required this.topProducts,
    required this.byCategory,
    required this.lowStock,
  });

  final AnalyticsKpi kpis;
  final List<SalesPoint> salesByDay;
  final List<TopProduct> topProducts;
  final List<CategorySlice> byCategory;
  final List<LowStockProduct> lowStock;

  factory AnalyticsOverview.fromJson(Map<String, dynamic> j) =>
      AnalyticsOverview(
        kpis: AnalyticsKpi.fromJson(Map<String, dynamic>.from(j['kpis'] ?? {})),
        salesByDay: ((j['salesByDay'] as List?) ?? const [])
            .map((e) => SalesPoint.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        topProducts: ((j['topProducts'] as List?) ?? const [])
            .map((e) => TopProduct.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        byCategory: ((j['byCategory'] as List?) ?? const [])
            .map((e) => CategorySlice.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        lowStock: ((j['lowStock'] as List?) ?? const [])
            .map((e) => LowStockProduct.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
      );

  static const empty = AnalyticsOverview(
    kpis: AnalyticsKpi.empty,
    salesByDay: [],
    topProducts: [],
    byCategory: [],
    lowStock: [],
  );
}
