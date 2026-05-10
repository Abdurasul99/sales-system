import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/empty_top_bar_view.dart';
import 'package:sales_system/view/components/gradient_button.dart';
import 'package:sales_system/view/components/input_edit_text_underline.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final FocusNode _nameFocus = FocusNode();
  final FocusNode _usernameFocus = FocusNode();
  final FocusNode _emailFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();
  bool _showPassword = false;

  AuthController get _ctrl => Get.find<AuthController>();

  @override
  void dispose() {
    _nameFocus.dispose();
    _usernameFocus.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < kMobileWidth;
    return Scaffold(
      backgroundColor: kBackgroundColor,
      body: SafeArea(
        top: false,
        bottom: false,
        child: Column(
          children: [
            const EmptyTopBarView(),
            Expanded(child: isMobile ? _buildMobile() : _buildDesktop()),
          ],
        ),
      ),
    );
  }

  Widget _buildDesktop() {
    return Container(
      alignment: Alignment.center,
      child: Container(
        width: 460,
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 48),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF000000).withValues(alpha: 0.18),
              offset: const Offset(0, 0),
              blurRadius: 20.0,
            ),
          ],
        ),
        child: _buildForm(),
      ),
    );
  }

  Widget _buildMobile() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: _buildForm(),
      ),
    );
  }

  Widget _buildForm() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text(
          'Создать аккаунт',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w600,
            color: kBlueFontColor,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Настройте рабочее пространство Sales System.',
          style: TextStyle(fontSize: 13, color: kGrayFontColor),
        ),
        const SizedBox(height: 32),
        InputEditTextUnderline(
          textController: _ctrl.nameCtrl,
          focusNode: _nameFocus,
          hintText: 'Полное имя',
          icon: const Icon(CupertinoIcons.person),
          onSubmit: (_) => _usernameFocus.requestFocus(),
        ),
        const SizedBox(height: 18),
        InputEditTextUnderline(
          textController: _ctrl.usernameCtrl,
          focusNode: _usernameFocus,
          hintText: 'Логин (username)',
          icon: const Icon(CupertinoIcons.at),
          onSubmit: (_) => _emailFocus.requestFocus(),
        ),
        const SizedBox(height: 18),
        InputEditTextUnderline(
          textController: _ctrl.emailCtrl,
          focusNode: _emailFocus,
          hintText: 'Email (необязательно)',
          icon: const Icon(CupertinoIcons.mail),
          keyboardType: TextInputType.emailAddress,
          onSubmit: (_) => _passwordFocus.requestFocus(),
        ),
        const SizedBox(height: 18),
        InputEditTextUnderline(
          textController: _ctrl.passwordCtrl,
          focusNode: _passwordFocus,
          hintText: 'Пароль (минимум 6 символов)',
          icon: const Icon(CupertinoIcons.lock),
          obscureText: !_showPassword,
          iconOnRight: Icon(
            _showPassword ? CupertinoIcons.eye_slash : CupertinoIcons.eye,
          ),
          onTapRightIcon: () =>
              setState(() => _showPassword = !_showPassword),
          onSubmit: (_) => _submit(),
        ),
        const SizedBox(height: 28),
        Obx(() {
          final err = _ctrl.errorMessage.value;
          if (err == null) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              err,
              textAlign: TextAlign.center,
              style: const TextStyle(color: kErrorColor, fontSize: 13),
            ),
          );
        }),
        Obx(() => GradientButton(
              buttonText: 'Создать аккаунт',
              isLoading: _ctrl.isLoading.value,
              onTap: _submit,
            )),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Уже есть аккаунт? ',
                style: TextStyle(color: kGrayFontColor, fontSize: 13)),
            GestureDetector(
              onTap: Get.back,
              child: const Text(
                'Войти',
                style: TextStyle(
                  color: kBlueFontColor,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _submit() {
    final name = _ctrl.nameCtrl.text.trim();
    final username = _ctrl.usernameCtrl.text.trim();
    final email = _ctrl.emailCtrl.text.trim();
    final password = _ctrl.passwordCtrl.text;
    if (name.isEmpty) {
      _ctrl.errorMessage.value = 'Введите имя';
      return;
    }
    if (username.length < 3) {
      _ctrl.errorMessage.value = 'Логин должен быть не короче 3 символов';
      return;
    }
    if (email.isNotEmpty && !email.contains('@')) {
      _ctrl.errorMessage.value = 'Введите корректный email или оставьте пустым';
      return;
    }
    if (password.length < 6) {
      _ctrl.errorMessage.value = 'Пароль должен быть не меньше 6 символов';
      return;
    }
    _ctrl.register();
  }
}
