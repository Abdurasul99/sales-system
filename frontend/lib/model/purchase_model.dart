class PurchaseItem {
  const PurchaseItem({
    required this.productId,
    required this.name,
    required this.sku,
    required this.cost,
    required this.quantity,
    required this.total,
  });

  final String productId;
  final String name;
  final String sku;
  final num cost;
  final num quantity;
  final num total;

  factory PurchaseItem.fromJson(Map<String, dynamic> json) => PurchaseItem(
        productId: (json['productId'] ?? '').toString(),
        name: (json['name'] ?? '').toString(),
        sku: (json['sku'] ?? '').toString(),
        cost: (json['cost'] is num) ? json['cost'] as num : 0,
        quantity: (json['quantity'] is num) ? json['quantity'] as num : 0,
        total: (json['total'] is num) ? json['total'] as num : 0,
      );

  Map<String, dynamic> toCreateJson() =>
      {'productId': productId, 'cost': cost, 'quantity': quantity};
}

class PurchaseSupplier {
  const PurchaseSupplier({this.id = '', this.name = '', this.phone = ''});
  final String id;
  final String name;
  final String phone;

  factory PurchaseSupplier.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const PurchaseSupplier();
    return PurchaseSupplier(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
    );
  }
}

class PurchaseModel {
  const PurchaseModel({
    required this.id,
    required this.number,
    required this.date,
    required this.items,
    required this.subtotal,
    required this.total,
    required this.currency,
    required this.paymentMethod,
    required this.status,
    required this.supplier,
    this.notes = '',
  });

  final String id;
  final String number;
  final DateTime date;
  final List<PurchaseItem> items;
  final num subtotal;
  final num total;
  final String currency;
  final String paymentMethod;
  final String status;
  final PurchaseSupplier supplier;
  final String notes;

  factory PurchaseModel.fromJson(Map<String, dynamic> json) {
    return PurchaseModel(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      number: (json['number'] ?? '').toString(),
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      items: ((json['items'] as List?) ?? const [])
          .whereType<Map>()
          .map((e) => PurchaseItem.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
      subtotal: (json['subtotal'] is num) ? json['subtotal'] as num : 0,
      total: (json['total'] is num) ? json['total'] as num : 0,
      currency: (json['currency'] ?? 'UZS').toString(),
      paymentMethod: (json['paymentMethod'] ?? 'transfer').toString(),
      status: (json['status'] ?? 'received').toString(),
      supplier: PurchaseSupplier.fromJson(
        json['supplier'] is Map ? Map<String, dynamic>.from(json['supplier']) : null,
      ),
      notes: (json['notes'] ?? '').toString(),
    );
  }
}
