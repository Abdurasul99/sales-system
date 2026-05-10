import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/analytics_model.dart';
import 'package:sales_system/viewmodel/repository/analytics_repository.dart';

class AnalyticsController extends GetxController {
  AnalyticsController({required AnalyticsRepository repository})
      : _repo = repository;
  final AnalyticsRepository _repo;

  final overview = AnalyticsOverview.empty.obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final days = 14.obs;

  Future<bool> fetch({int? days}) async {
    if (days != null) this.days.value = days;
    isLoading.value = true;
    errorMessage.value = null;
    try {
      overview.value = await _repo.overview(days: this.days.value);
      return true;
    } on DioException catch (e) {
      final d = e.response?.data;
      errorMessage.value = (d is Map && d['message'] != null)
          ? d['message'].toString()
          : (e.message ?? 'Network error');
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
