class SaleItemModel {
  const SaleItemModel({
    required this.productId,
    required this.name,
    required this.sku,
    required this.price,
    required this.quantity,
    required this.total,
    this.cost = 0,
    this.cogs = 0,
    this.profit = 0,
  });

  final String productId;
  final String name;
  final String sku;
  final num price;
  final num cost;
  final num quantity;
  final num total;
  final num cogs;
  final num profit;

  num get marginPct => total > 0 ? (profit / total) * 100 : 0;

  factory SaleItemModel.fromJson(Map<String, dynamic> json) {
    final price = (json['price'] is num) ? json['price'] as num : 0;
    final cost = (json['cost'] is num) ? json['cost'] as num : 0;
    final quantity = (json['quantity'] is num) ? json['quantity'] as num : 0;
    final total = (json['total'] is num) ? json['total'] as num : (price * quantity);
    final cogs = (json['cogs'] is num) ? json['cogs'] as num : (cost * quantity);
    final profit = (json['profit'] is num) ? json['profit'] as num : (total - cogs);
    return SaleItemModel(
      productId: (json['productId'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      sku: (json['sku'] ?? '').toString(),
      price: price,
      cost: cost,
      quantity: quantity,
      total: total,
      cogs: cogs,
      profit: profit,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'productId': productId,
        'price': price,
        'quantity': quantity,
      };
}

class SaleCustomer {
  const SaleCustomer({this.name = '', this.phone = ''});
  final String name;
  final String phone;

  factory SaleCustomer.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const SaleCustomer();
    return SaleCustomer(
      name: (json['name'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {'name': name, 'phone': phone};
}

class SaleCashier {
  const SaleCashier({this.id = '', this.name = '', this.username = ''});
  final String id;
  final String name;
  final String username;

  factory SaleCashier.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const SaleCashier();
    return SaleCashier(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
    );
  }
}

class SaleModel {
  const SaleModel({
    required this.id,
    required this.number,
    required this.date,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.tax,
    required this.total,
    required this.totalCost,
    required this.totalProfit,
    required this.currency,
    required this.paymentMethod,
    required this.status,
    required this.customer,
    required this.cashier,
    this.notes = '',
  });

  final String id;
  final String number;
  final DateTime date;
  final List<SaleItemModel> items;
  final num subtotal;
  final num discount;
  final num tax;
  final num total;
  final num totalCost;
  final num totalProfit;
  final String currency;
  final String paymentMethod;
  final String status;
  final SaleCustomer customer;
  final SaleCashier cashier;
  final String notes;

  num get marginPct => total > 0 ? (totalProfit / total) * 100 : 0;

  factory SaleModel.fromJson(Map<String, dynamic> json) {
    final items = ((json['items'] as List?) ?? const [])
        .whereType<Map>()
        .map((e) => SaleItemModel.fromJson(Map<String, dynamic>.from(e)))
        .toList();
    final total = (json['total'] is num) ? json['total'] as num : 0;
    final totalCost = (json['totalCost'] is num)
        ? json['totalCost'] as num
        : items.fold<num>(0, (s, it) => s + it.cogs);
    final totalProfit = (json['totalProfit'] is num)
        ? json['totalProfit'] as num
        : (total - totalCost);
    return SaleModel(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      number: (json['number'] ?? '').toString(),
      date: DateTime.tryParse(json['date']?.toString() ?? '') ??
          DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
      items: items,
      subtotal: (json['subtotal'] is num) ? json['subtotal'] as num : 0,
      discount: (json['discount'] is num) ? json['discount'] as num : 0,
      tax: (json['tax'] is num) ? json['tax'] as num : 0,
      total: total,
      totalCost: totalCost,
      totalProfit: totalProfit,
      currency: (json['currency'] ?? 'UZS').toString(),
      paymentMethod: (json['paymentMethod'] ?? 'cash').toString(),
      status: (json['status'] ?? 'completed').toString(),
      customer: SaleCustomer.fromJson(
        json['customer'] is Map ? Map<String, dynamic>.from(json['customer']) : null,
      ),
      cashier: SaleCashier.fromJson(
        json['cashier'] is Map ? Map<String, dynamic>.from(json['cashier']) : null,
      ),
      notes: (json['notes'] ?? '').toString(),
    );
  }
}

class SaleSummary {
  const SaleSummary({
    required this.count,
    required this.totalRevenue,
    required this.totalCost,
    required this.totalProfit,
    required this.marginPct,
    required this.totalDiscount,
    required this.averageCheck,
  });

  final num count;
  final num totalRevenue;
  final num totalCost;
  final num totalProfit;
  final num marginPct;
  final num totalDiscount;
  final num averageCheck;

  factory SaleSummary.fromJson(Map<String, dynamic> json) {
    final rev = (json['totalRevenue'] is num) ? json['totalRevenue'] as num : 0;
    final cost = (json['totalCost'] is num) ? json['totalCost'] as num : 0;
    final profit =
        (json['totalProfit'] is num) ? json['totalProfit'] as num : (rev - cost);
    final margin = (json['marginPct'] is num)
        ? json['marginPct'] as num
        : (rev > 0 ? (profit / rev) * 100 : 0);
    return SaleSummary(
      count: (json['count'] is num) ? json['count'] as num : 0,
      totalRevenue: rev,
      totalCost: cost,
      totalProfit: profit,
      marginPct: margin,
      totalDiscount:
          (json['totalDiscount'] is num) ? json['totalDiscount'] as num : 0,
      averageCheck:
          (json['averageCheck'] is num) ? json['averageCheck'] as num : 0,
    );
  }

  static const empty = SaleSummary(
    count: 0,
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    marginPct: 0,
    totalDiscount: 0,
    averageCheck: 0,
  );
}
