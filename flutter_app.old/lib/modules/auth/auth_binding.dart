import 'package:get/get.dart';

import '../../data/providers/auth_api_provider.dart';
import '../../data/repositories/auth_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'auth_controller.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(() => AuthApiProvider(Get.find<ApiService>()), fenix: true);
    lazyPutIfAbsent(
      () => AuthRepository(
        provider: Get.find<AuthApiProvider>(),
        apiService: Get.find<ApiService>(),
      ),
      fenix: true,
    );
    lazyPutIfAbsent(() => AuthController(Get.find<AuthRepository>()), fenix: true);
  }
}
