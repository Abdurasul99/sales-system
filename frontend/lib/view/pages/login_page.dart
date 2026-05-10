import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/app_logo.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final FocusNode _loginFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();
  bool _showPassword = false;

  AuthController get _ctrl => Get.find<AuthController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loginFocus.requestFocus();
    });
  }

  @override
  void dispose() {
    _loginFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              kLoginGradientFrom,
              kLoginGradientVia,
              kLoginGradientTo,
            ],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 32),
                  _buildCard(),
                  const SizedBox(height: 24),
                  const Text(
                    '© 2026 Sales System · Система управления продажами',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: kTextHint),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        const AppLogo(size: 80),
        const SizedBox(height: 8),
        const Text(
          'Sales System',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: kTextPrimary,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Управление продажами и складом',
          style: TextStyle(fontSize: 14, color: kTextMuted),
        ),
      ],
    );
  }

  Widget _buildCard() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
        boxShadow: [
          BoxShadow(
            color: kGray100.withValues(alpha: 0.6),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Вход в систему',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: kTextPrimary,
            ),
          ),
          const SizedBox(height: 24),
          _label('Логин'),
          const SizedBox(height: 8),
          _textField(
            controller: _ctrl.loginCtrl,
            focus: _loginFocus,
            hint: 'Введите логин',
            onSubmit: (_) => _passwordFocus.requestFocus(),
          ),
          const SizedBox(height: 16),
          _label('Пароль'),
          const SizedBox(height: 8),
          _textField(
            controller: _ctrl.passwordCtrl,
            focus: _passwordFocus,
            hint: 'Введите пароль',
            obscure: !_showPassword,
            suffix: GestureDetector(
              onTap: () => setState(() => _showPassword = !_showPassword),
              child: Icon(
                _showPassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: kTextHint,
              ),
            ),
            onSubmit: (_) => _submit(),
          ),
          const SizedBox(height: 24),
          Obx(() {
            final err = _ctrl.errorMessage.value;
            if (err == null) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: kErrorColor.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: kErrorColor.withValues(alpha: 0.2)),
                ),
                child: Text(
                  err,
                  style: const TextStyle(color: kErrorColor, fontSize: 13),
                ),
              ),
            );
          }),
          Obx(() => _primaryButton(
                label: _ctrl.isLoading.value ? 'Входим...' : 'Войти в систему',
                isLoading: _ctrl.isLoading.value,
                onTap: _submit,
              )),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              'Свяжитесь с администратором для получения доступа',
              style: TextStyle(fontSize: 12, color: kTextHint),
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: kTextSecondary,
      ),
    );
  }

  Widget _textField({
    required TextEditingController controller,
    required FocusNode focus,
    required String hint,
    bool obscure = false,
    Widget? suffix,
    void Function(String)? onSubmit,
  }) {
    return TextField(
      controller: controller,
      focusNode: focus,
      obscureText: obscure,
      onSubmitted: onSubmit,
      style: const TextStyle(fontSize: 14, color: kTextPrimary),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: kTextHint, fontSize: 14),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        filled: true,
        fillColor: Colors.white,
        suffixIcon: suffix == null
            ? null
            : Padding(
                padding: const EdgeInsets.only(right: 12),
                child: suffix,
              ),
        suffixIconConstraints:
            const BoxConstraints(minWidth: 24, minHeight: 24),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: kBorderColorStrong),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: kBorderColorStrong),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: kPrimaryColor, width: 2),
        ),
      ),
    );
  }

  Widget _primaryButton({
    required String label,
    required bool isLoading,
    required VoidCallback onTap,
  }) {
    return MouseRegion(
      cursor: isLoading ? SystemMouseCursors.basic : SystemMouseCursors.click,
      child: GestureDetector(
        onTap: isLoading ? null : onTap,
        child: Container(
          height: 48,
          decoration: BoxDecoration(
            color: isLoading
                ? kPrimaryColor.withValues(alpha: 0.6)
                : kPrimaryColor,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: kPrimaryColor.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isLoading) ...[
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation(Colors.white),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    final login = _ctrl.loginCtrl.text.trim();
    final password = _ctrl.passwordCtrl.text;
    if (login.isEmpty) {
      _ctrl.errorMessage.value = 'Введите логин';
      return;
    }
    if (password.isEmpty) {
      _ctrl.errorMessage.value = 'Введите пароль';
      return;
    }
    _ctrl.login();
  }
}
