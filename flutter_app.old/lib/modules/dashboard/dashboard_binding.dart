import 'package:get/get.dart';

import '../../data/providers/analytics_api_provider.dart';
import '../../data/repositories/analytics_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'dashboard_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(() => AnalyticsApiProvider(Get.find<ApiService>()), fenix: true);
    lazyPutIfAbsent(
      () => AnalyticsRepository(Get.find<AnalyticsApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => DashboardController(Get.find<AnalyticsRepository>()),
      fenix: true,
    );
  }
}
