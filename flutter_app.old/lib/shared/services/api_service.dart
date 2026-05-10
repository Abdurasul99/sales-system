import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:get_storage/get_storage.dart';

class ApiService {
  ApiService() : _dio = Dio(BaseOptions(baseUrl: _resolveBaseUrl())) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = _storage.read<String>(_tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  static const _tokenKey = 'auth_token';
  static final GetStorage _storage = GetStorage();
  final Dio _dio;

  Dio get client => _dio;
  static bool get hasToken => (_storage.read<String>(_tokenKey) ?? '').isNotEmpty;

  Future<void> saveToken(String token) async {
    await _storage.write(_tokenKey, token);
  }

  String? get token => _storage.read<String>(_tokenKey);

  Future<void> clearToken() async {
    await _storage.remove(_tokenKey);
  }

  static String _resolveBaseUrl() {
    const overridden = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (overridden.isNotEmpty) {
      return overridden;
    }

    if (kIsWeb) {
      return '${Uri.base.origin}/api';
    }

    return 'http://10.0.2.2:4000/api';
  }
}
