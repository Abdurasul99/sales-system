import 'package:get/get.dart';

import '../../data/models/inventory_item_model.dart';
import '../../data/repositories/catalog_repository.dart';

class InventoryController extends GetxController {
  InventoryController(this._repository);

  final CatalogRepository _repository;

  final items = <InventoryItemModel>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    isLoading.value = true;
    try {
      items.assignAll(await _repository.fetchInventory(lowOnly: true));
    } finally {
      isLoading.value = false;
    }
  }
}
