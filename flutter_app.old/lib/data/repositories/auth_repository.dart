import '../../shared/services/api_service.dart';
import '../providers/auth_api_provider.dart';

class AuthRepository {
  AuthRepository({
    required AuthApiProvider provider,
    required ApiService apiService,
  })  : _provider = provider,
        _apiService = apiService;

  final AuthApiProvider _provider;
  final ApiService _apiService;

  Future<void> login({
    required String login,
    required String password,
  }) async {
    final payload = await _provider.login(login: login, password: password);
    final token = payload['token'] as String?;
    if (token == null || token.isEmpty) {
      throw Exception('Token was not returned by API');
    }

    await _apiService.saveToken(token);
  }

  Future<void> logout() async {
    await _apiService.clearToken();
  }
}
