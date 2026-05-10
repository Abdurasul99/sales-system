import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'envelope.dart';

// ─────────────────────────────────────────────────────────
// ABC analysis
// ─────────────────────────────────────────────────────────

class AbcItem {
  const AbcItem({
    required this.productId,
    required this.name,
    required this.sku,
    required this.quantity,
    required this.revenue,
    required this.cogs,
    required this.profit,
    required this.marginPct,
    required this.sales,
    required this.sharePct,
    required this.cumPct,
    required this.cls,
  });
  final String productId;
  final String name;
  final String sku;
  final num quantity;
  final num revenue;
  final num cogs;
  final num profit;
  final num marginPct;
  final num sales;
  final num sharePct;
  final num cumPct;
  final String cls;

  factory AbcItem.fromJson(Map<String, dynamic> j) {
    final rev = (j['revenue'] is num) ? j['revenue'] as num : 0;
    final profit = (j['profit'] is num) ? j['profit'] as num : 0;
    return AbcItem(
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
      sales: (j['sales'] is num) ? j['sales'] as num : 0,
      sharePct: (j['sharePct'] is num) ? j['sharePct'] as num : 0,
      cumPct: (j['cumPct'] is num) ? j['cumPct'] as num : 0,
      cls: (j['class'] ?? 'C').toString(),
    );
  }
}

class AbcResult {
  const AbcResult({required this.items, required this.summary});
  final List<AbcItem> items;
  final Map<String, num> summary;

  factory AbcResult.fromJson(Map<String, dynamic> j) {
    final s = (j['summary'] is Map)
        ? Map<String, dynamic>.from(j['summary'] as Map)
        : <String, dynamic>{};
    return AbcResult(
      items: ((j['items'] as List?) ?? const [])
          .map((e) => AbcItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      summary: {
        'A': (s['A'] is num) ? s['A'] as num : 0,
        'B': (s['B'] is num) ? s['B'] as num : 0,
        'C': (s['C'] is num) ? s['C'] as num : 0,
        'totalRevenue':
            (s['totalRevenue'] is num) ? s['totalRevenue'] as num : 0,
        'totalCogs': (s['totalCogs'] is num) ? s['totalCogs'] as num : 0,
        'totalProfit':
            (s['totalProfit'] is num) ? s['totalProfit'] as num : 0,
        'totalMarginPct': (s['totalMarginPct'] is num)
            ? s['totalMarginPct'] as num
            : 0,
      },
    );
  }

  static const empty = AbcResult(items: [], summary: {
    'A': 0,
    'B': 0,
    'C': 0,
    'totalRevenue': 0,
    'totalCogs': 0,
    'totalProfit': 0,
    'totalMarginPct': 0,
  });
}

// ─────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────

class NotificationItem {
  const NotificationItem({
    required this.kind,
    required this.icon,
    required this.title,
    required this.description,
    required this.createdAt,
    this.relatedType = '',
    this.relatedId = '',
  });
  final String kind; // critical | warning | success | info
  final String icon;
  final String title;
  final String description;
  final DateTime createdAt;
  final String relatedType;
  final String relatedId;

  factory NotificationItem.fromJson(Map<String, dynamic> j) =>
      NotificationItem(
        kind: (j['kind'] ?? 'info').toString(),
        icon: (j['icon'] ?? 'info').toString(),
        title: (j['title'] ?? '').toString(),
        description: (j['description'] ?? '').toString(),
        createdAt:
            DateTime.tryParse(j['createdAt']?.toString() ?? '') ?? DateTime.now(),
        relatedType: (j['relatedType'] ?? '').toString(),
        relatedId: (j['relatedId'] ?? '').toString(),
      );
}

// ─────────────────────────────────────────────────────────
// Shift
// ─────────────────────────────────────────────────────────

class ShiftModel {
  const ShiftModel({
    required this.id,
    required this.cashierName,
    required this.openedAt,
    this.closedAt,
    required this.openingCash,
    required this.closingCash,
    required this.status,
    required this.salesCount,
    required this.salesRevenue,
    this.notes = '',
  });
  final String id;
  final String cashierName;
  final DateTime openedAt;
  final DateTime? closedAt;
  final num openingCash;
  final num closingCash;
  final String status; // 'open' | 'closed'
  final num salesCount;
  final num salesRevenue;
  final String notes;

  factory ShiftModel.fromJson(Map<String, dynamic> j) {
    final cashier = j['cashier'] is Map
        ? Map<String, dynamic>.from(j['cashier'] as Map)
        : <String, dynamic>{};
    return ShiftModel(
      id: (j['id'] ?? j['_id'] ?? '').toString(),
      cashierName: (cashier['name'] ?? '').toString(),
      openedAt:
          DateTime.tryParse(j['openedAt']?.toString() ?? '') ?? DateTime.now(),
      closedAt: DateTime.tryParse(j['closedAt']?.toString() ?? ''),
      openingCash: (j['openingCash'] is num) ? j['openingCash'] as num : 0,
      closingCash: (j['closingCash'] is num) ? j['closingCash'] as num : 0,
      status: (j['status'] ?? 'open').toString(),
      salesCount: (j['salesCount'] is num) ? j['salesCount'] as num : 0,
      salesRevenue: (j['salesRevenue'] is num) ? j['salesRevenue'] as num : 0,
      notes: (j['notes'] ?? '').toString(),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Currency
// ─────────────────────────────────────────────────────────

class CurrencyRate {
  const CurrencyRate({
    required this.code,
    required this.name,
    required this.rate,
    this.source = 'manual',
    this.updatedAt,
  });
  final String code;
  final String name;
  final num rate;
  final String source;
  final DateTime? updatedAt;

  factory CurrencyRate.fromJson(Map<String, dynamic> j) => CurrencyRate(
        code: (j['code'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        rate: (j['rate'] is num) ? j['rate'] as num : 0,
        source: (j['source'] ?? 'manual').toString(),
        updatedAt: DateTime.tryParse(j['updatedAt']?.toString() ?? ''),
      );
}

// ─────────────────────────────────────────────────────────
// Global search
// ─────────────────────────────────────────────────────────

class SearchProductHit {
  const SearchProductHit({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    required this.cost,
    required this.currency,
    required this.stock,
    required this.category,
  });
  final String id;
  final String name;
  final String sku;
  final num price;
  final num cost;
  final String currency;
  final num stock;
  final String category;

  factory SearchProductHit.fromJson(Map<String, dynamic> j) =>
      SearchProductHit(
        id: (j['id'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        sku: (j['sku'] ?? '').toString(),
        price: (j['price'] is num) ? j['price'] as num : 0,
        cost: (j['cost'] is num) ? j['cost'] as num : 0,
        currency: (j['currency'] ?? 'UZS').toString(),
        stock: (j['stock'] is num) ? j['stock'] as num : 0,
        category: (j['category'] ?? '').toString(),
      );
}

class SearchSaleHit {
  const SearchSaleHit({
    required this.id,
    required this.number,
    required this.date,
    required this.total,
    required this.totalProfit,
    required this.status,
    required this.itemsCount,
    required this.customerName,
  });
  final String id;
  final String number;
  final DateTime date;
  final num total;
  final num totalProfit;
  final String status;
  final num itemsCount;
  final String customerName;

  factory SearchSaleHit.fromJson(Map<String, dynamic> j) {
    final cust =
        j['customer'] is Map ? Map<String, dynamic>.from(j['customer']) : {};
    return SearchSaleHit(
      id: (j['id'] ?? '').toString(),
      number: (j['number'] ?? '').toString(),
      date: DateTime.tryParse(j['date']?.toString() ?? '') ?? DateTime.now(),
      total: (j['total'] is num) ? j['total'] as num : 0,
      totalProfit:
          (j['totalProfit'] is num) ? j['totalProfit'] as num : 0,
      status: (j['status'] ?? 'completed').toString(),
      itemsCount:
          (j['itemsCount'] is num) ? j['itemsCount'] as num : 0,
      customerName: (cust['name'] ?? '').toString(),
    );
  }
}

class SearchCustomerHit {
  const SearchCustomerHit({
    required this.id,
    required this.name,
    required this.phone,
    required this.company,
  });
  final String id;
  final String name;
  final String phone;
  final String company;

  factory SearchCustomerHit.fromJson(Map<String, dynamic> j) =>
      SearchCustomerHit(
        id: (j['id'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        phone: (j['phone'] ?? '').toString(),
        company: (j['company'] ?? '').toString(),
      );
}

class SearchSupplierHit {
  const SearchSupplierHit({
    required this.id,
    required this.name,
    required this.phone,
    required this.contactPerson,
    required this.category,
  });
  final String id;
  final String name;
  final String phone;
  final String contactPerson;
  final String category;

  factory SearchSupplierHit.fromJson(Map<String, dynamic> j) =>
      SearchSupplierHit(
        id: (j['id'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        phone: (j['phone'] ?? '').toString(),
        contactPerson: (j['contactPerson'] ?? '').toString(),
        category: (j['category'] ?? '').toString(),
      );
}

class GlobalSearchResult {
  const GlobalSearchResult({
    required this.query,
    required this.products,
    required this.sales,
    required this.customers,
    required this.suppliers,
  });
  final String query;
  final List<SearchProductHit> products;
  final List<SearchSaleHit> sales;
  final List<SearchCustomerHit> customers;
  final List<SearchSupplierHit> suppliers;

  int get total =>
      products.length + sales.length + customers.length + suppliers.length;

  factory GlobalSearchResult.fromJson(Map<String, dynamic> j) =>
      GlobalSearchResult(
        query: (j['query'] ?? '').toString(),
        products: ((j['products'] as List?) ?? const [])
            .map((e) =>
                SearchProductHit.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        sales: ((j['sales'] as List?) ?? const [])
            .map((e) =>
                SearchSaleHit.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        customers: ((j['customers'] as List?) ?? const [])
            .map((e) =>
                SearchCustomerHit.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
        suppliers: ((j['suppliers'] as List?) ?? const [])
            .map((e) =>
                SearchSupplierHit.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
      );

  static const empty = GlobalSearchResult(
    query: '',
    products: [],
    sales: [],
    customers: [],
    suppliers: [],
  );
}

// ─────────────────────────────────────────────────────────
// Repository
// ─────────────────────────────────────────────────────────

class ExtraRepository {
  ExtraRepository(this._dio);
  final Dio _dio;

  // ABC
  Future<AbcResult> abc({int days = 90}) async {
    final res = await _dio.get(kPathAnalyticsAbc, queryParameters: {'days': days});
    return AbcResult.fromJson(unwrapEnvelope(res.data));
  }

  // Notifications
  Future<List<NotificationItem>> notifications() async {
    final res = await _dio.get(kPathAnalyticsNotifications);
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => NotificationItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  // Shifts
  Future<List<ShiftModel>> shifts() async {
    final res = await _dio.get(kPathShifts);
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => ShiftModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<ShiftModel?> currentShift() async {
    final res = await _dio.get(kPathShiftsCurrent);
    final body = unwrapEnvelope(res.data);
    final s = body['shift'];
    if (s == null) return null;
    return ShiftModel.fromJson(Map<String, dynamic>.from(s as Map));
  }

  Future<ShiftModel> openShift({num openingCash = 0}) async {
    final res = await _dio.post(kPathShiftsOpen, data: {'openingCash': openingCash});
    return ShiftModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<ShiftModel> closeShift({num closingCash = 0, String notes = ''}) async {
    final res = await _dio.post(kPathShiftsClose,
        data: {'closingCash': closingCash, 'notes': notes});
    return ShiftModel.fromJson(unwrapEnvelope(res.data));
  }

  // Currency
  Future<List<CurrencyRate>> currencyRates() async {
    final res = await _dio.get(kPathCurrencyRates);
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => CurrencyRate.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<CurrencyRate> updateCurrency(String code, num rate) async {
    final res = await _dio.put(pathCurrencyByCode(code), data: {'rate': rate});
    return CurrencyRate.fromJson(unwrapEnvelope(res.data));
  }

  // Global search
  Future<GlobalSearchResult> globalSearch(String query, {int limit = 5}) async {
    final res = await _dio.get(kPathSearch,
        queryParameters: {'q': query, 'limit': limit});
    return GlobalSearchResult.fromJson(unwrapEnvelope(res.data));
  }
}
