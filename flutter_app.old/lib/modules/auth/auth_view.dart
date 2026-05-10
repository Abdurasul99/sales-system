import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'auth_controller.dart';

class AuthView extends GetView<AuthController> {
  const AuthView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFECF4EF), Color(0xFFDDEBE0)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Sales System ERP',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Demo owner access for the rebuilt backend.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),
                    TextField(
                      controller: controller.loginController,
                      decoration: const InputDecoration(
                        labelText: 'Login',
                        prefixIcon: Icon(Icons.person_rounded),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: controller.passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Password',
                        prefixIcon: Icon(Icons.lock_rounded),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Obx(
                      () => controller.errorMessage.value.isEmpty
                          ? const SizedBox.shrink()
                          : Text(
                              controller.errorMessage.value,
                              style: const TextStyle(color: Colors.red),
                            ),
                    ),
                    const SizedBox(height: 16),
                    Obx(
                      () => FilledButton.icon(
                        onPressed: controller.isLoading.value ? null : controller.signIn,
                        icon: controller.isLoading.value
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.login_rounded),
                        label: const Text('Sign in'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
