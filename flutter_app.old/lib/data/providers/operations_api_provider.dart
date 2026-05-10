import '../../shared/services/api_service.dart';

class OperationsApiProvider {
  OperationsApiProvider(this._apiService);

  final ApiService _apiService;

  Future<List<dynamic>> fetchSalesOrders() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/sales/orders');
    return response.data?['orders'] as List<dynamic>? ?? [];
  }

  Future<List<dynamic>> fetchPurchaseOrders() async {
    final response =
        await _apiService.client.get<Map<String, dynamic>>('/purchases/orders');
    return response.data?['orders'] as List<dynamic>? ?? [];
  }

  Future<List<dynamic>> fetchReturnOrders() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/returns/orders');
    return response.data?['orders'] as List<dynamic>? ?? [];
  }
}
