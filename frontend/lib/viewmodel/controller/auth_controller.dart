import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/user_model.dart';
import 'package:sales_system/viewmodel/repository/auth_repository.dart';
import 'package:sales_system/utils/app_routes.dart';
import 'package:sales_system/utils/local_storage.dart';

typedef AppNavigator = void Function(String route);

class AuthController extends GetxController {
  AuthController({
    required AuthRepository repository,
    required LocalStorage storage,
    AppNavigator? navigateTo,
  })  : _repository = repository,
        _storage = storage,
        _navigateTo = navigateTo ?? _defaultNavigate;

  final AuthRepository _repository;
  final LocalStorage _storage;
  final AppNavigator _navigateTo;

  static void _defaultNavigate(String route) {
    Get.offAllNamed(route);
  }

  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
  final usernameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final loginCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();

  final isLoading = false.obs;
  final errorMessage = RxnString();
  final user = Rxn<UserModel>();

  @override
  void onInit() {
    super.onInit();
    final cached = _storage.user;
    if (cached != null) {
      user.value = UserModel.fromJson(cached);
    }
  }

  @override
  void onClose() {
    nameCtrl.dispose();
    usernameCtrl.dispose();
    emailCtrl.dispose();
    loginCtrl.dispose();
    passwordCtrl.dispose();
    super.onClose();
  }

  Future<bool> login({String? login, String? password}) async {
    return _run(() async {
      final result = await _repository.login(
        login: login ?? loginCtrl.text.trim(),
        password: password ?? passwordCtrl.text,
      );
      _persist(result.user, result.token);
      _navigateTo(AppRoutes.home);
    });
  }

  Future<bool> register({
    String? name,
    String? username,
    String? email,
    String? password,
  }) async {
    return _run(() async {
      final result = await _repository.register(
        name: name ?? nameCtrl.text.trim(),
        username: username ?? usernameCtrl.text.trim(),
        email: email ?? emailCtrl.text.trim(),
        password: password ?? passwordCtrl.text,
      );
      _persist(result.user, result.token);
      _navigateTo(AppRoutes.home);
    });
  }

  void logout() {
    _storage.clearAuth();
    user.value = null;
    _navigateTo(AppRoutes.login);
  }

  void _persist(UserModel u, String token) {
    _storage.token = token;
    _storage.user = u.toJson();
    user.value = u;
  }

  Future<bool> _run(Future<void> Function() action) async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      await action();
      return true;
    } on DioException catch (e) {
      errorMessage.value = _readError(e);
      return false;
    } catch (e) {
      errorMessage.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  String _readError(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) return data['message'].toString();
    return e.message ?? 'Network error';
  }
}
