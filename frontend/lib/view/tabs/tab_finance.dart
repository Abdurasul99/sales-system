import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/transaction_model.dart';
import 'package:sales_system/viewmodel/controller/finance_controller.dart';

class TabFinance extends StatefulWidget {
  const TabFinance({super.key, required this.kind});
  final String kind; // 'expense' | 'income'

  @override
  State<TabFinance> createState() => _TabFinanceState();
}

class _TabFinanceState extends State<TabFinance> {
  late final FinanceController _ctrl;

  bool get _isIncome => widget.kind == 'income';
  String get _title => _isIncome ? 'Доходы' : 'Расходы';
  String get _addLabel => _isIncome ? 'Новый доход' : 'Новый расход';
  Color get _accent => _isIncome ? kSuccessColor : kErrorColor;
  IconData get _icon =>
      _isIncome ? Icons.trending_up_rounded : Icons.trending_down_rounded;

  @override
  void initState() {
    super.initState();
    _ctrl = Get.find<FinanceController>(tag: widget.kind);
    _ctrl.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _summary(),
          const SizedBox(height: 16),
          _toolbar(),
          const SizedBox(height: 16),
          _list(),
        ],
      ),
    );
  }

  Widget _summary() {
    return Obx(() {
      final f = NumberFormat.decimalPattern();
      return Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: kBorderColor),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: _accent.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Icon(_icon, color: _accent, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Всего за период',
                          style: TextStyle(fontSize: 12, color: kTextHint),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${f.format(_ctrl.summary.value.total)} UZS',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: _accent,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_ctrl.summary.value.byCategory.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(left: 16),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: _ctrl.summary.value.byCategory
                            .take(5)
                            .map((c) => Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: kGray100,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(c.category,
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: kTextSecondary,
                                              fontWeight: FontWeight.w500)),
                                      const SizedBox(width: 6),
                                      Text('${f.format(c.total)}',
                                          style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              color: _accent)),
                                    ],
                                  ),
                                ))
                            .toList(),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      );
    });
  }

  Widget _toolbar() {
    return Row(
      children: [
        Expanded(
          child: Text(
            _title,
            style: const TextStyle(fontSize: 13, color: kTextMuted),
          ),
        ),
        _PrimaryButton(
          label: _addLabel,
          icon: Icons.add_rounded,
          onTap: () => _openForm(),
        ),
      ],
    );
  }

  Widget _list() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Obx(() {
        if (_ctrl.isLoading.value && _ctrl.items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(48),
            child: Center(child: CircularProgressIndicator(color: kPrimaryColor)),
          );
        }
        if (_ctrl.items.isEmpty) {
          return Padding(
            padding: const EdgeInsets.all(48),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(_icon, size: 48, color: kTextHint),
                  const SizedBox(height: 12),
                  Text(_isIncome ? 'Доходов нет' : 'Расходов нет',
                      style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: kTextPrimary)),
                  const SizedBox(height: 4),
                  Text(
                    _isIncome
                        ? 'Добавьте первый доход'
                        : 'Добавьте первый расход',
                    style: const TextStyle(fontSize: 12, color: kTextMuted),
                  ),
                ],
              ),
            ),
          );
        }
        return Column(
          children: [
            for (var i = 0; i < _ctrl.items.length; i++)
              _row(_ctrl.items[i], isLast: i == _ctrl.items.length - 1),
          ],
        );
      }),
    );
  }

  Widget _row(TransactionModel t, {required bool isLast}) {
    final f = NumberFormat.decimalPattern();
    final dt = DateFormat('dd.MM.yyyy HH:mm');
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
              color: _accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: Icon(_icon, size: 18, color: _accent),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  t.description.isEmpty ? '—' : t.description,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: kTextPrimary),
                ),
                Text(
                  dt.format(t.date),
                  style: const TextStyle(fontSize: 11, color: kTextHint),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: kGray100,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(t.category,
                style: const TextStyle(
                    fontSize: 11,
                    color: kTextSecondary,
                    fontWeight: FontWeight.w500)),
          ),
          SizedBox(
            width: 130,
            child: Text(
              '${_isIncome ? '+' : '−'} ${f.format(t.amount)} ${t.currency}',
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: _accent,
              ),
            ),
          ),
          IconButton(
            iconSize: 16,
            splashRadius: 16,
            onPressed: () => _confirmDelete(t),
            icon: const Icon(Icons.delete_outline_rounded, color: kTextHint),
          ),
        ],
      ),
    );
  }

  Future<void> _openForm() async {
    final amount = TextEditingController();
    final category = TextEditingController();
    final description = TextEditingController();
    final method = 'cash'.obs;
    final formKey = GlobalKey<FormState>();

    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(_addLabel),
        content: SizedBox(
          width: 380,
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: amount,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    final n = num.tryParse(v ?? '');
                    if (n == null || n <= 0) return 'Введите сумму > 0';
                    return null;
                  },
                  decoration: InputDecoration(
                    labelText: 'Сумма (UZS)',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: category,
                  decoration: InputDecoration(
                    labelText: 'Категория',
                    hintText:
                        _isIncome ? 'investments / bonus' : 'rent / utilities',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: description,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: 'Описание',
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 12),
                Obx(() => DropdownButtonFormField<String>(
                      initialValue: method.value,
                      decoration: InputDecoration(
                        labelText: 'Способ оплаты',
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'cash', child: Text('Наличные')),
                        DropdownMenuItem(value: 'card', child: Text('Карта')),
                        DropdownMenuItem(value: 'transfer', child: Text('Перевод')),
                        DropdownMenuItem(value: 'other', child: Text('Другое')),
                      ],
                      onChanged: (v) {
                        if (v != null) method.value = v;
                      },
                    )),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: Get.back,
            style: TextButton.styleFrom(foregroundColor: kTextMuted),
            child: const Text('Отмена'),
          ),
          Obx(() => FilledButton(
                onPressed: _ctrl.isSaving.value
                    ? null
                    : () async {
                        if (!(formKey.currentState?.validate() ?? false)) return;
                        final draft = TransactionModel(
                          id: '',
                          kind: widget.kind,
                          date: DateTime.now(),
                          amount: num.tryParse(amount.text) ?? 0,
                          category: category.text.trim().isEmpty
                              ? 'general'
                              : category.text.trim(),
                          description: description.text.trim(),
                          paymentMethod: method.value,
                        );
                        final ok = await _ctrl.save(draft);
                        if (ok && ctx.mounted) {
                          Navigator.of(ctx).pop();
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            backgroundColor: kSuccessColor,
                            behavior: SnackBarBehavior.floating,
                            content:
                                Text(_isIncome ? 'Доход добавлен' : 'Расход добавлен'),
                          ));
                        }
                      },
                style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                child: const Text('Добавить'),
              )),
        ],
      ),
    );

    amount.dispose();
    category.dispose();
    description.dispose();
  }

  Future<void> _confirmDelete(TransactionModel t) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(_isIncome ? 'Удалить доход?' : 'Удалить расход?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(result: false),
            style: TextButton.styleFrom(foregroundColor: kTextMuted),
            child: const Text('Отмена'),
          ),
          FilledButton(
            onPressed: () => Get.back(result: true),
            style: FilledButton.styleFrom(backgroundColor: kErrorColor),
            child: const Text('Удалить'),
          ),
        ],
      ),
    );
    if (ok == true) await _ctrl.remove(t);
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: kPrimaryColor,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: kPrimaryColor.withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 8),
              Text(label,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  )),
            ],
          ),
        ),
      ),
    );
  }
}
