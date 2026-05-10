import '../../shared/services/api_service.dart';

class CatalogApiProvider {
  CatalogApiProvider(this._apiService);

  final ApiService _apiService;

  Future<List<dynamic>> fetchProducts() async {
    final response = await _apiService.client.get<Map<String, dynamic>>('/products');
    return response.data?['products'] as List<dynamic>? ?? [];
  }

  Future<List<dynamic>> fetchInventory({bool lowOnly = false}) async {
    final response = await _apiService.client.get<Map<String, dynamic>>(
      '/inventory',
      queryParameters: {
        'lowOnly': lowOnly.toString(),
      },
    );

    return response.data?['items'] as List<dynamic>? ?? [];
  }
}
