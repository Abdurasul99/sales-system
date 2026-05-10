import '../../shared/services/api_service.dart';

class PartnersApiProvider {
  PartnersApiProvider(this._apiService);

  final ApiService _apiService;

  Future<List<dynamic>> fetchCustomers() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/customers');
    return response.data?['customers'] as List<dynamic>? ?? [];
  }

  Future<List<dynamic>> fetchSuppliers() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/suppliers');
    return response.data?['suppliers'] as List<dynamic>? ?? [];
  }
}
