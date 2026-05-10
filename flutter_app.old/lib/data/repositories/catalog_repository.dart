import '../models/inventory_item_model.dart';
import '../models/product_model.dart';
import '../providers/catalog_api_provider.dart';

class CatalogRepository {
  CatalogRepository(this._provider);

  final CatalogApiProvider _provider;

  Future<List<ProductModel>> fetchProducts() async {
    final payload = await _provider.fetchProducts();
    return payload
        .map((item) => ProductModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<InventoryItemModel>> fetchInventory({bool lowOnly = false}) async {
    final payload = await _provider.fetchInventory(lowOnly: lowOnly);
    return payload
        .map((item) => InventoryItemModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
