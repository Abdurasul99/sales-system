import '../../shared/services/api_service.dart';

class AuthApiProvider {
  AuthApiProvider(this._apiService);

  final ApiService _apiService;

  Future<Map<String, dynamic>> login({
    required String login,
    required String password,
  }) async {
    final response = await _apiService.client.post<Map<String, dynamic>>(
      '/auth/login',
      data: {
        'login': login,
        'password': password,
      },
    );

    return response.data ?? {};
  }
}
