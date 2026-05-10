import 'package:dio/dio.dart';

import 'package:sales_system/model/user_model.dart';
import 'api_endpoints.dart';
import 'envelope.dart';

typedef AuthResult = ({UserModel user, String token});

class AuthRepository {
  AuthRepository(this._dio);

  final Dio _dio;

  Future<AuthResult> register({
    required String name,
    required String username,
    required String password,
    String? email,
  }) async {
    final res = await _dio.post(
      ApiEndpoints.register,
      data: {
        'name': name,
        'username': username,
        if (email != null && email.isNotEmpty) 'email': email,
        'password': password,
      },
    );
    return _parseAuthEnvelope(res.data);
  }

  Future<AuthResult> login({
    required String login,
    required String password,
  }) async {
    final res = await _dio.post(
      ApiEndpoints.login,
      data: {'login': login, 'password': password},
    );
    return _parseAuthEnvelope(res.data);
  }

  Future<UserModel> me() async {
    final res = await _dio.get(ApiEndpoints.me);
    final body = unwrapEnvelope(res.data);
    return UserModel.fromJson(Map<String, dynamic>.from(body['user'] as Map));
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final res = await _dio.post(
      '/auth/change-password',
      data: {'currentPassword': currentPassword, 'newPassword': newPassword},
    );
    unwrapEnvelope(res.data);
  }

  Future<UserModel> updateProfile({String? name, String? email}) async {
    final res = await _dio.put('/auth/profile', data: {
      if (name != null) 'name': name,
      if (email != null) 'email': email,
    });
    final body = unwrapEnvelope(res.data);
    return UserModel.fromJson(Map<String, dynamic>.from(body['user'] as Map));
  }

  AuthResult _parseAuthEnvelope(dynamic data) {
    final body = unwrapEnvelope(data);
    final user = UserModel.fromJson(Map<String, dynamic>.from(body['user'] as Map));
    final token = body['token'] as String;
    return (user: user, token: token);
  }
}
