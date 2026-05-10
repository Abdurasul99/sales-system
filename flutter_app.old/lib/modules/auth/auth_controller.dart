import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/repositories/auth_repository.dart';
import '../../routes/app_routes.dart';

class AuthController extends GetxController {
  AuthController(this._repository);

  final AuthRepository _repository;

  final loginController = TextEditingController(text: 'owner');
  final passwordController = TextEditingController(text: 'Owner123!');
  final isLoading = false.obs;
  final errorMessage = ''.obs;

  Future<void> signIn() async {
    isLoading.value = true;
    errorMessage.value = '';

    try {
      await _repository.login(
        login: loginController.text.trim(),
        password: passwordController.text.trim(),
      );
      Get.offAllNamed(AppRoutes.workspace);
    } catch (error) {
      errorMessage.value = error.toString().replaceFirst('Exception: ', '');
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    loginController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
