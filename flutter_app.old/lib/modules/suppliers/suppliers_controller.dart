import 'package:get/get.dart';

import '../../data/models/supplier_model.dart';
import '../../data/repositories/partners_repository.dart';

class SuppliersController extends GetxController {
  SuppliersController(this._repository);

  final PartnersRepository _repository;

  final items = <SupplierModel>[].obs;
  final searchQuery = ''.obs;
  final isLoading = false.obs;

  List<SupplierModel> get filteredItems {
    final q = searchQuery.value.toLowerCase();
    if (q.isEmpty) {
      return items;
    }

    return items
        .where(
          (item) =>
              item.name.toLowerCase().contains(q) ||
              item.code.toLowerCase().contains(q) ||
              item.contactName.toLowerCase().contains(q),
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
      items.assignAll(await _repository.fetchSuppliers());
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) {
    searchQuery.value = value;
  }
}
