class ProductModel {
  ProductModel({
    required this.id,
    required this.article,
    required this.name,
    required this.baseCost,
    required this.basePrice,
    required this.reorderPoint,
  });

  final String id;
  final String article;
  final String name;
  final double baseCost;
  final double basePrice;
  final double reorderPoint;

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      article: json['article'] as String,
      name: json['name'] as String,
      baseCost: double.tryParse('${json['baseCost']}') ?? 0,
      basePrice: double.tryParse('${json['basePrice']}') ?? 0,
      reorderPoint: double.tryParse('${json['reorderPoint']}') ?? 0,
    );
  }
}
