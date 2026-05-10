import 'package:get/get.dart';

import '../../data/models/dashboard_kpis.dart';
import '../../data/repositories/analytics_repository.dart';

class DashboardController extends GetxController {
  DashboardController(this._repository);

  final AnalyticsRepository _repository;

  final kpis = Rxn<DashboardKpis>();
  final replenishment = <Map<String, dynamic>>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    load();
  }

  Future<void> load() async {
    isLoading.value = true;
    try {
      kpis.value = await _repository.fetchDashboard();
      replenishment.assignAll(await _repository.fetchReplenishment());
    } finally {
      isLoading.value = false;
    }
  }
}
