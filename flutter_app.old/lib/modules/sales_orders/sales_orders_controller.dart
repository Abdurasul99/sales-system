import 'package:get/get.dart';

import '../../data/models/order_document_model.dart';
import '../../data/repositories/operations_repository.dart';

class SalesOrdersController extends GetxController {
  SalesOrdersController(this._repository);

  final OperationsRepository _repository;

  final items = <OrderDocumentModel>[].obs;
  final searchQuery = ''.obs;
  final isLoading = false.obs;

  List<OrderDocumentModel> get filteredItems {
    final q = searchQuery.value.toLowerCase();
    if (q.isEmpty) {
      return items;
    }

    return items
        .where(
          (item) =>
              item.number.toLowerCase().contains(q) ||
              item.partyName.toLowerCase().contains(q) ||
              item.status.toLowerCase().contains(q),
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
      items.assignAll(await _repository.fetchSalesOrders());
    } finally {
      isLoading.value = false;
    }
  }

  void setSearch(String value) {
    searchQuery.value = value;
  }
}
