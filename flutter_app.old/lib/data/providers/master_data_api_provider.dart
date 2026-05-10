import '../../shared/services/api_service.dart';

class MasterDataApiProvider {
  MasterDataApiProvider(this._apiService);

  final ApiService _apiService;

  Future<Map<String, dynamic>> fetchBootstrap() async {
    final response =
        await _apiService.client.get<Map<String, dynamic>>('/master-data/bootstrap');
    return response.data ?? {};
  }
}
