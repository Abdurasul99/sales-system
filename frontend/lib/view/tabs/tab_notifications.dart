import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/repository/extra_repository.dart';

class TabNotifications extends StatefulWidget {
  const TabNotifications({super.key});

  @override
  State<TabNotifications> createState() => _TabNotificationsState();
}

class _TabNotificationsState extends State<TabNotifications> {
  ExtraController get _ctrl => Get.find<ExtraController>();

  @override
  void initState() {
    super.initState();
    _ctrl.fetchNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: kPrimaryColor,
      onRefresh: _ctrl.fetchNotifications,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Obx(() {
          if (_ctrl.isNotificationsLoading.value &&
              _ctrl.notifications.isEmpty) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 64),
              child: Center(child: CircularProgressIndicator(color: kPrimaryColor)),
            );
          }
          final list = _ctrl.notifications;
          if (list.isEmpty) {
            return Container(
              margin: const EdgeInsets.symmetric(vertical: 64),
              padding: const EdgeInsets.all(48),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: kBorderColor),
              ),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.notifications_none_rounded,
                        size: 48, color: kTextHint),
                    SizedBox(height: 12),
                    Text('Уведомлений нет',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: kTextPrimary)),
                    SizedBox(height: 4),
                    Text('Всё под контролем 👌',
                        style: TextStyle(fontSize: 12, color: kTextMuted)),
                  ],
                ),
              ),
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _summary(list),
              const SizedBox(height: 16),
              for (final n in list) ...[
                _card(n),
                const SizedBox(height: 8),
              ],
            ],
          );
        }),
      ),
    );
  }

  Widget _summary(List<NotificationItem> list) {
    final critical = list.where((n) => n.kind == 'critical').length;
    final warning = list.where((n) => n.kind == 'warning').length;
    final success = list.where((n) => n.kind == 'success').length;
    final info = list.where((n) => n.kind == 'info').length;
    return Row(
      children: [
        _stat('Критичные', critical, kErrorColor, Icons.error_outline_rounded),
        const SizedBox(width: 12),
        _stat('Предупреждения', warning, kWarningColor,
            Icons.warning_amber_rounded),
        const SizedBox(width: 12),
        _stat('События', success, kSuccessColor, Icons.check_circle_outline),
        const SizedBox(width: 12),
        _stat('Информация', info, kIndigoColor, Icons.info_outline_rounded),
      ],
    );
  }

  Widget _stat(String label, int count, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: kBorderColor),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(fontSize: 11, color: kTextHint)),
                  Text('$count',
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: kTextPrimary)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _card(NotificationItem n) {
    final tint = _tintFor(n.kind);
    final fmt = DateFormat('dd MMMM HH:mm', 'ru');
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: tint.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(tint.icon, color: tint.color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(n.title,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: kTextPrimary)),
                const SizedBox(height: 2),
                Text(n.description,
                    style: const TextStyle(fontSize: 12, color: kTextMuted)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Text(
            _safeFormat(fmt, n.createdAt),
            style: const TextStyle(fontSize: 11, color: kTextHint),
          ),
        ],
      ),
    );
  }

  String _safeFormat(DateFormat fmt, DateTime date) {
    try {
      return fmt.format(date);
    } catch (_) {
      return DateFormat('dd.MM HH:mm').format(date);
    }
  }

  ({IconData icon, Color color}) _tintFor(String kind) {
    switch (kind) {
      case 'critical':
        return (icon: Icons.error_outline_rounded, color: kErrorColor);
      case 'warning':
        return (
          icon: Icons.warning_amber_rounded,
          color: kWarningColor,
        );
      case 'success':
        return (icon: Icons.check_circle_outline, color: kSuccessColor);
      case 'info':
      default:
        return (icon: Icons.info_outline_rounded, color: kIndigoColor);
    }
  }
}
