import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';
import 'package:sales_system/viewmodel/repository/auth_repository.dart';

class TabSettings extends StatefulWidget {
  const TabSettings({super.key});

  @override
  State<TabSettings> createState() => _TabSettingsState();
}

class _TabSettingsState extends State<TabSettings> {
  AuthController get _auth => Get.find<AuthController>();
  AuthRepository get _repo => Get.find<AuthRepository>();

  late final TextEditingController _nameCtrl;
  late final TextEditingController _emailCtrl;
  final _currentPwCtrl = TextEditingController();
  final _newPwCtrl = TextEditingController();

  final _isSavingProfile = false.obs;
  final _isChangingPw = false.obs;
  final _profileMsg = RxnString();
  final _pwMsg = RxnString();

  @override
  void initState() {
    super.initState();
    final u = _auth.user.value;
    _nameCtrl = TextEditingController(text: u?.name ?? '');
    _emailCtrl = TextEditingController(text: u?.email ?? '');
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _currentPwCtrl.dispose();
    _newPwCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _profileCard(),
              const SizedBox(height: 16),
              _passwordCard(),
              const SizedBox(height: 16),
              _aboutCard(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _profileCard() {
    return _Card(
      title: 'Профиль',
      subtitle: 'Имя и email отображаются другим пользователям',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Obx(() {
            final u = _auth.user.value;
            return Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [kPrimaryColor, kIndigoColor],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    u?.name.isNotEmpty == true
                        ? u!.name[0].toUpperCase()
                        : '?',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(u?.name ?? '',
                          style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: kTextPrimary)),
                      Text('@${u?.username ?? ''}',
                          style: const TextStyle(
                              fontSize: 12, color: kTextHint)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: kPrimaryColorLight,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          u?.roleLabel.isNotEmpty == true
                              ? u!.roleLabel
                              : (u?.role ?? ''),
                          style: const TextStyle(
                            fontSize: 11,
                            color: kPrimaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 20),
          _input(_nameCtrl, 'Полное имя'),
          const SizedBox(height: 12),
          _input(_emailCtrl, 'Email'),
          Obx(() {
            final m = _profileMsg.value;
            if (m == null) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(m,
                  style: TextStyle(
                    fontSize: 12,
                    color: m.startsWith('✓') ? kSuccessColor : kErrorColor,
                  )),
            );
          }),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerRight,
            child: Obx(() => FilledButton(
                  onPressed: _isSavingProfile.value ? null : _saveProfile,
                  style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                  child: Text(
                      _isSavingProfile.value ? 'Сохранение...' : 'Сохранить'),
                )),
          ),
        ],
      ),
    );
  }

  Widget _passwordCard() {
    return _Card(
      title: 'Смена пароля',
      subtitle: 'Минимум 6 символов',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _input(_currentPwCtrl, 'Текущий пароль', obscure: true),
          const SizedBox(height: 12),
          _input(_newPwCtrl, 'Новый пароль', obscure: true),
          Obx(() {
            final m = _pwMsg.value;
            if (m == null) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(m,
                  style: TextStyle(
                    fontSize: 12,
                    color: m.startsWith('✓') ? kSuccessColor : kErrorColor,
                  )),
            );
          }),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerRight,
            child: Obx(() => FilledButton(
                  onPressed: _isChangingPw.value ? null : _changePassword,
                  style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                  child: Text(
                      _isChangingPw.value ? 'Смена...' : 'Сменить пароль'),
                )),
          ),
        ],
      ),
    );
  }

  Widget _aboutCard() {
    return _Card(
      title: 'О системе',
      subtitle: 'Sales System v1.0',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const [
          _AboutRow(label: 'Сервер', value: 'ec2-15-164-220-51 · ap-northeast-2'),
          _AboutRow(label: 'База данных', value: 'MongoDB'),
          _AboutRow(label: 'AI', value: 'DeepSeek + локальные подсказки'),
        ],
      ),
    );
  }

  Widget _input(TextEditingController c, String label, {bool obscure = false}) {
    return TextField(
      controller: c,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }

  Future<void> _saveProfile() async {
    _isSavingProfile.value = true;
    _profileMsg.value = null;
    try {
      final updated = await _repo.updateProfile(
        name: _nameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
      );
      _auth.user.value = updated;
      _profileMsg.value = '✓ Профиль обновлён';
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          backgroundColor: kSuccessColor,
          behavior: SnackBarBehavior.floating,
          content: Text('Профиль сохранён'),
        ));
      }
    } on DioException catch (e) {
      final d = e.response?.data;
      _profileMsg.value = (d is Map && d['message'] != null)
          ? d['message'].toString()
          : 'Не удалось сохранить';
    } finally {
      _isSavingProfile.value = false;
    }
  }

  Future<void> _changePassword() async {
    if (_currentPwCtrl.text.isEmpty || _newPwCtrl.text.length < 6) {
      _pwMsg.value = 'Заполните оба поля, новый пароль ≥ 6 символов';
      return;
    }
    _isChangingPw.value = true;
    _pwMsg.value = null;
    try {
      await _repo.changePassword(
        currentPassword: _currentPwCtrl.text,
        newPassword: _newPwCtrl.text,
      );
      _pwMsg.value = '✓ Пароль изменён';
      _currentPwCtrl.clear();
      _newPwCtrl.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          backgroundColor: kSuccessColor,
          behavior: SnackBarBehavior.floating,
          content: Text('Пароль успешно изменён'),
        ));
      }
    } on DioException catch (e) {
      final d = e.response?.data;
      _pwMsg.value = (d is Map && d['message'] != null)
          ? d['message'].toString()
          : 'Не удалось сменить пароль';
    } finally {
      _isChangingPw.value = false;
    }
  }
}

class _Card extends StatelessWidget {
  const _Card({required this.title, this.subtitle, required this.child});
  final String title;
  final String? subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: kTextPrimary,
              )),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle!,
                style: const TextStyle(fontSize: 12, color: kTextHint)),
          ],
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }
}

class _AboutRow extends StatelessWidget {
  const _AboutRow({required this.label, required this.value});
  final String label;
  final String value;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 140,
            child: Text(label,
                style: const TextStyle(fontSize: 12, color: kTextHint)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    fontSize: 12,
                    color: kTextSecondary,
                    fontFamily: 'monospace')),
          ),
        ],
      ),
    );
  }
}
