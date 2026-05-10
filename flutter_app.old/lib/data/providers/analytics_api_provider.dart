import '../../shared/services/api_service.dart';

class AnalyticsApiProvider {
  AnalyticsApiProvider(this._apiService);

  final ApiService _apiService;

  Future<Map<String, dynamic>> fetchDashboard() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/analytics/dashboard');
    return response.data?['kpis'] as Map<String, dynamic>? ?? {};
  }

  Future<List<dynamic>> fetchReplenishment() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/analytics/replenishment');
    return response.data?['suggestions'] as List<dynamic>? ?? [];
  }
}
