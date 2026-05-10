import 'package:get/get.dart';

import '../../data/providers/catalog_api_provider.dart';
import '../../data/repositories/catalog_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'products_controller.dart';

class ProductsBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(() => CatalogApiProvider(Get.find<ApiService>()), fenix: true);
    lazyPutIfAbsent(
      () => CatalogRepository(Get.find<CatalogApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => ProductsController(Get.find<CatalogRepository>()),
      fenix: true,
    );
  }
}
