class ProductModel {
  const ProductModel({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    required this.currency,
    required this.stock,
    required this.category,
    this.cost = 0,
    this.unit = 'шт',
    this.leadTimeDays = 14,
    this.description = '',
    this.isActive = true,
  });

  final String id;
  final String name;
  final String sku;
  final num price;
  final num cost;
  final String currency;
  final num stock;
  final String category;
  final String unit;
  final num leadTimeDays;
  final String description;
  final bool isActive;

  num get profitPerUnit => price - cost;
  num get marginPct => price > 0 ? (profitPerUnit / price) * 100 : 0;
  num get markupPct => cost > 0 ? (profitPerUnit / cost) * 100 : 0;
  num get stockValueAtCost => cost * stock;
  num get stockValueAtPrice => price * stock;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      sku: (json['sku'] ?? '').toString(),
      price: (json['price'] is num) ? json['price'] as num : 0,
      cost: (json['cost'] is num) ? json['cost'] as num : 0,
      currency: (json['currency'] ?? 'UZS').toString(),
      stock: (json['stock'] is num) ? json['stock'] as num : 0,
      category: (json['category'] ?? 'general').toString(),
      unit: (json['unit'] ?? 'шт').toString(),
      leadTimeDays:
          (json['leadTimeDays'] is num) ? json['leadTimeDays'] as num : 14,
      description: (json['description'] ?? '').toString(),
      isActive: json['isActive'] is bool ? json['isActive'] as bool : true,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        'sku': sku,
        'price': price,
        'cost': cost,
        'currency': currency,
        'stock': stock,
        'category': category,
        'unit': unit,
        'leadTimeDays': leadTimeDays,
        'description': description,
        'isActive': isActive,
      };

  ProductModel copyWith({
    String? name,
    String? sku,
    num? price,
    num? cost,
    String? currency,
    num? stock,
    String? category,
    String? unit,
    num? leadTimeDays,
    String? description,
    bool? isActive,
  }) {
    return ProductModel(
      id: id,
      name: name ?? this.name,
      sku: sku ?? this.sku,
      price: price ?? this.price,
      cost: cost ?? this.cost,
      currency: currency ?? this.currency,
      stock: stock ?? this.stock,
      category: category ?? this.category,
      unit: unit ?? this.unit,
      leadTimeDays: leadTimeDays ?? this.leadTimeDays,
      description: description ?? this.description,
      isActive: isActive ?? this.isActive,
    );
  }

  @override
  bool operator ==(Object other) =>
      other is ProductModel &&
      id == other.id &&
      name == other.name &&
      sku == other.sku &&
      price == other.price &&
      cost == other.cost &&
      currency == other.currency &&
      stock == other.stock &&
      category == other.category &&
      unit == other.unit &&
      leadTimeDays == other.leadTimeDays &&
      description == other.description &&
      isActive == other.isActive;

  @override
  int get hashCode => Object.hash(id, name, sku, price, cost, currency, stock,
      category, unit, leadTimeDays, description, isActive);
}
