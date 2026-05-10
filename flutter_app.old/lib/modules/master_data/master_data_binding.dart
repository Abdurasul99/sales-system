import 'package:get/get.dart';

import '../../data/providers/master_data_api_provider.dart';
import '../../data/repositories/master_data_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'master_data_controller.dart';

class MasterDataBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(
      () => MasterDataApiProvider(Get.find<ApiService>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => MasterDataRepository(Get.find<MasterDataApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => MasterDataController(Get.find<MasterDataRepository>()),
      fenix: true,
    );
  }
}
