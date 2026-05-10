import 'package:get/get.dart';

import '../../data/providers/catalog_api_provider.dart';
import '../../data/repositories/catalog_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'inventory_controller.dart';

class InventoryBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(() => CatalogApiProvider(Get.find<ApiService>()), fenix: true);
    lazyPutIfAbsent(
      () => CatalogRepository(Get.find<CatalogApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => InventoryController(Get.find<CatalogRepository>()),
      fenix: true,
    );
  }
}
