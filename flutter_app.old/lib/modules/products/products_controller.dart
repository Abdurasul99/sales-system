import 'package:get/get.dart';

import '../../data/models/product_model.dart';
import '../../data/repositories/catalog_repository.dart';

class ProductsController extends GetxController {
  ProductsController(this._repository);

  final CatalogRepository _repository;

  final items = <ProductModel>[].obs;
  final searchQuery = ''.obs;
  final isLoading = false.obs;

  List<ProductModel> get filteredItems {
    final query = searchQuery.value.trim().toLowerCase();
    if (query.isEmpty) {
      return items;
    }

    return items
        .where(
          (item) =>
              item.article.toLowerCase().contains(query) ||
              item.name.toLowerCase().contains(query),
        )
        .toList();
  }

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    isLoading.value = true;
    try {
      items.assignAll(await _repository.fetchProducts());
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) {
    searchQuery.value = value;
  }
}
