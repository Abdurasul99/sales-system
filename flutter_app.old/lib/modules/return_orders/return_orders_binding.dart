import 'package:get/get.dart';

import '../../data/providers/operations_api_provider.dart';
import '../../data/repositories/operations_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'return_orders_controller.dart';

class ReturnOrdersBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(
      () => OperationsApiProvider(Get.find<ApiService>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => OperationsRepository(Get.find<OperationsApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => ReturnOrdersController(Get.find<OperationsRepository>()),
      fenix: true,
    );
  }
}
