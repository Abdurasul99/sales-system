import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/analytics_model.dart';
import 'envelope.dart';

class AnalyticsRepository {
  AnalyticsRepository(this._dio);
  final Dio _dio;

  Future<AnalyticsOverview> overview({int days = 14}) async {
    final res = await _dio.get(kPathAnalyticsOverview,
        queryParameters: {'days': days});
    return AnalyticsOverview.fromJson(unwrapEnvelope(res.data));
  }
}
