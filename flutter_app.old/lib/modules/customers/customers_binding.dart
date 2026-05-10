import 'package:get/get.dart';

import '../../data/providers/partners_api_provider.dart';
import '../../data/repositories/partners_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'customers_controller.dart';

class CustomersBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(() => PartnersApiProvider(Get.find<ApiService>()), fenix: true);
    lazyPutIfAbsent(
      () => PartnersRepository(Get.find<PartnersApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => CustomersController(Get.find<PartnersRepository>()),
      fenix: true,
    );
  }
}
