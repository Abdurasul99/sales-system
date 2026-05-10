import '../models/dashboard_kpis.dart';
import '../providers/analytics_api_provider.dart';

class AnalyticsRepository {
  AnalyticsRepository(this._provider);

  final AnalyticsApiProvider _provider;

  Future<DashboardKpis> fetchDashboard() async {
    final payload = await _provider.fetchDashboard();
    return DashboardKpis.fromJson(payload);
  }

  Future<List<Map<String, dynamic>>> fetchReplenishment() async {
    final payload = await _provider.fetchReplenishment();
    return payload
        .map((item) => item as Map<String, dynamic>)
        .toList();
  }
}
