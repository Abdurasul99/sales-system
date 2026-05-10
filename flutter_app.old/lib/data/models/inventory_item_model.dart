class InventoryItemModel {
  InventoryItemModel({
    required this.productName,
    required this.article,
    required this.warehouseName,
    required this.available,
    required this.reorderPoint,
  });

  final String productName;
  final String article;
  final String warehouseName;
  final double available;
  final double reorderPoint;

  factory InventoryItemModel.fromJson(Map<String, dynamic> json) {
    final product = json['product'] as Map<String, dynamic>? ?? {};
    final warehouse = json['warehouse'] as Map<String, dynamic>? ?? {};

    return InventoryItemModel(
      productName: product['name'] ?? 'Unknown product',
      article: product['article'] ?? '-',
      warehouseName: warehouse['name'] ?? 'Warehouse',
      available: double.tryParse('${json['available']}') ?? 0,
      reorderPoint: double.tryParse('${product['reorderPoint']}') ?? 0,
    );
  }
}
