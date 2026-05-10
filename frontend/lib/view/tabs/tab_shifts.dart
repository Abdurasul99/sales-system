import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/repository/extra_repository.dart';

class TabShifts extends StatefulWidget {
  const TabShifts({super.key});

  @override
  State<TabShifts> createState() => _TabShiftsState();
}

class _TabShiftsState extends State<TabShifts> {
  ExtraController get _ctrl => Get.find<ExtraController>();

  @override
  void initState() {
    super.initState();
    _ctrl.fetchShifts();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _currentShiftCard(),
          const SizedBox(height: 16),
          _historyCard(),
        ],
      ),
    );
  }

  Widget _currentShiftCard() {
    return Obx(() {
      final s = _ctrl.currentShift.value;
      final f = NumberFormat.decimalPattern();
      final fmt = DateFormat('dd.MM.yyyy HH:mm');
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: s == null ? kGray100 : kPrimaryColorLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    s == null ? Icons.lock_outline_rounded : Icons.schedule_rounded,
                    color: s == null ? kTextMuted : kPrimaryColor,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s == null ? 'Смена не открыта' : 'Текущая смена',
                        style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: kTextPrimary),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        s == null
                            ? 'Откройте смену, чтобы начать продажи'
                            : 'Открыта ${fmt.format(s.openedAt)}',
                        style: const TextStyle(fontSize: 12, color: kTextHint),
                      ),
                    ],
                  ),
                ),
                if (s == null)
                  FilledButton.icon(
                    onPressed: _ctrl.isShiftSaving.value ? null : _openShiftDialog,
                    style:
                        FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                    icon: const Icon(Icons.play_arrow_rounded, size: 18),
                    label: const Text('Открыть смену'),
                  )
                else
                  FilledButton.icon(
                    onPressed: _ctrl.isShiftSaving.value ? null : _closeShiftDialog,
                    style: FilledButton.styleFrom(backgroundColor: kErrorColor),
                    icon: const Icon(Icons.stop_rounded, size: 18),
                    label: const Text('Закрыть смену'),
                  ),
              ],
            ),
            if (s != null) ...[
              const SizedBox(height: 16),
              const Divider(color: kBorderColor),
              const SizedBox(height: 16),
              Row(
                children: [
                  _stat('Кассир', s.cashierName, Icons.person_outline,
                      kIndigoColor),
                  const SizedBox(width: 12),
                  _stat('Открытие, нал.',
                      '${f.format(s.openingCash)} UZS', Icons.payments_rounded,
                      kPrimaryColor),
                  const SizedBox(width: 12),
                  _stat('Продаж', '${s.salesCount}',
                      Icons.receipt_long_rounded, kSuccessColor),
                  const SizedBox(width: 12),
                  _stat(
                      'Выручка',
                      '${f.format(s.salesRevenue)} UZS',
                      Icons.trending_up_rounded,
                      kSuccessColor),
                ],
              ),
            ],
          ],
        ),
      );
    });
  }

  Widget _stat(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: kGray50,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(fontSize: 10, color: kTextHint)),
                  Text(value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 13,
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

  Widget _historyCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text('История смен',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: kTextPrimary)),
          ),
          const Divider(height: 1, color: kBorderColor),
          Obx(() {
            if (_ctrl.isShiftsLoading.value && _ctrl.shifts.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(48),
                child: Center(
                    child: CircularProgressIndicator(color: kPrimaryColor)),
              );
            }
            if (_ctrl.shifts.isEmpty) {
              return const Padding(
                padding: EdgeInsets.all(48),
                child: Center(
                  child: Text('Смен пока нет',
                      style: TextStyle(fontSize: 13, color: kTextMuted)),
                ),
              );
            }
            return Column(
              children: [
                for (var i = 0; i < _ctrl.shifts.length; i++)
                  _shiftRow(_ctrl.shifts[i],
                      isLast: i == _ctrl.shifts.length - 1),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _shiftRow(ShiftModel s, {required bool isLast}) {
    final f = NumberFormat.decimalPattern();
    final fmt = DateFormat('dd.MM HH:mm');
    final isOpen = s.status == 'open';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isOpen
                  ? kSuccessColor.withValues(alpha: 0.12)
                  : kGray100,
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: Icon(
              isOpen ? Icons.lock_open_rounded : Icons.lock_outline_rounded,
              size: 16,
              color: isOpen ? kSuccessColor : kTextMuted,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(s.cashierName.isEmpty ? 'Кассир' : s.cashierName,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: kTextPrimary)),
                Text(
                  s.closedAt != null
                      ? '${fmt.format(s.openedAt)} → ${fmt.format(s.closedAt!)}'
                      : 'Открыта ${fmt.format(s.openedAt)}',
                  style: const TextStyle(fontSize: 11, color: kTextHint),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('${s.salesCount} продаж',
                    style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: kTextPrimary)),
                Text('${f.format(s.salesRevenue)} UZS',
                    style: const TextStyle(
                        fontSize: 11,
                        color: kPrimaryColor,
                        fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          SizedBox(
            width: 80,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: isOpen
                    ? kSuccessColor.withValues(alpha: 0.12)
                    : kGray100,
                borderRadius: BorderRadius.circular(6),
              ),
              alignment: Alignment.center,
              child: Text(
                isOpen ? 'Открыта' : 'Закрыта',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isOpen ? kSuccessColor : kTextSecondary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openShiftDialog() async {
    final cashCtrl = TextEditingController(text: '0');
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Открыть смену'),
        content: SizedBox(
          width: 320,
          child: TextField(
            controller: cashCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              labelText: 'Сумма в кассе на старте (UZS)',
              border:
                  OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ),
        actions: [
          TextButton(
              onPressed: Get.back,
              style: TextButton.styleFrom(foregroundColor: kTextMuted),
              child: const Text('Отмена')),
          FilledButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              final amount = num.tryParse(cashCtrl.text) ?? 0;
              final ok = await _ctrl.openShift(openingCash: amount);
              if (ok && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  backgroundColor: kSuccessColor,
                  behavior: SnackBarBehavior.floating,
                  content: Text('Смена открыта'),
                ));
              }
            },
            style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
            child: const Text('Открыть'),
          ),
        ],
      ),
    );
    cashCtrl.dispose();
  }

  Future<void> _closeShiftDialog() async {
    final cashCtrl = TextEditingController(text: '0');
    final notesCtrl = TextEditingController();
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Закрыть смену'),
        content: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: cashCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Сумма в кассе на закрытии (UZS)',
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesCtrl,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Комментарий (необязательно)',
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
              onPressed: Get.back,
              style: TextButton.styleFrom(foregroundColor: kTextMuted),
              child: const Text('Отмена')),
          FilledButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              final amount = num.tryParse(cashCtrl.text) ?? 0;
              final ok = await _ctrl.closeShift(
                  closingCash: amount, notes: notesCtrl.text.trim());
              if (ok && mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  backgroundColor: kSuccessColor,
                  behavior: SnackBarBehavior.floating,
                  content: Text('Смена закрыта'),
                ));
              }
            },
            style: FilledButton.styleFrom(backgroundColor: kErrorColor),
            child: const Text('Закрыть'),
          ),
        ],
      ),
    );
    cashCtrl.dispose();
    notesCtrl.dispose();
  }
}
