class MasterDataSnapshot {
  MasterDataSnapshot({
    required this.companiesCount,
    required this.warehousesCount,
    required this.locationsCount,
    required this.categoriesCount,
    required this.unitsCount,
    required this.segmentsCount,
    required this.currenciesCount,
    required this.attributeCount,
  });

  final int companiesCount;
  final int warehousesCount;
  final int locationsCount;
  final int categoriesCount;
  final int unitsCount;
  final int segmentsCount;
  final int currenciesCount;
  final int attributeCount;

  factory MasterDataSnapshot.fromJson(Map<String, dynamic> json) {
    final companies = json['companies'] as List<dynamic>? ?? [];
    final warehousesCount = companies.fold<int>(
      0,
      (sum, item) => sum + ((item['warehouses'] as List<dynamic>? ?? []).length),
    );
    final locationsCount = companies.fold<int>(
      0,
      (sum, item) => sum + ((item['warehouses'] as List<dynamic>? ?? [])
          .fold<int>(
            0,
            (inner, warehouse) =>
                inner + ((warehouse['locations'] as List<dynamic>? ?? []).length),
          )),
    );

    return MasterDataSnapshot(
      companiesCount: companies.length,
      warehousesCount: warehousesCount,
      locationsCount: locationsCount,
      categoriesCount: (json['categories'] as List<dynamic>? ?? []).length,
      unitsCount: (json['units'] as List<dynamic>? ?? []).length,
      segmentsCount: (json['customerSegments'] as List<dynamic>? ?? []).length,
      currenciesCount: (json['currencies'] as List<dynamic>? ?? []).length,
      attributeCount: (json['attributeDefinitions'] as List<dynamic>? ?? []).length,
    );
  }
}
