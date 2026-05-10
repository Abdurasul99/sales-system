import 'package:get/get.dart';

import '../../data/providers/analytics_api_provider.dart';
import '../../data/repositories/analytics_repository.dart';
import '../../shared/services/api_service.dart';
import '../../shared/utils/get_registrar.dart';
import 'analytics_overview_controller.dart';

class AnalyticsOverviewBinding extends Bindings {
  @override
  void dependencies() {
    lazyPutIfAbsent(ApiService.new, fenix: true);
    lazyPutIfAbsent(() => AnalyticsApiProvider(Get.find<ApiService>()), fenix: true);
    lazyPutIfAbsent(
      () => AnalyticsRepository(Get.find<AnalyticsApiProvider>()),
      fenix: true,
    );
    lazyPutIfAbsent(
      () => AnalyticsOverviewController(Get.find<AnalyticsRepository>()),
      fenix: true,
    );
  }
}
