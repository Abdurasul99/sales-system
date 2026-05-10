import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/responsive_table.dart';

import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/repository/extra_repository.dart';

class TabCurrency extends StatefulWidget {
  const TabCurrency({super.key});

  @override
  State<TabCurrency> createState() => _TabCurrencyState();
}

class _TabCurrencyState extends State<TabCurrency> {
  ExtraController get _ctrl => Get.find<ExtraController>();

  @override
  void initState() {
    super.initState();
    _ctrl.fetchCurrency();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _info(),
          const SizedBox(height: 16),
          _table(),
        ],
      ),
    );
  }

  Widget _info() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [kPrimaryColor, kIndigoColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.currency_exchange_rounded,
                color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Курсы валют',
                    style: TextStyle(
                        fontSize: 18,
                        color: Colors.white,
                        fontWeight: FontWeight.w700)),
                SizedBox(height: 4),
                Text(
                  'Базовая валюта — UZS. Курсы отображают, сколько сум за 1 единицу.',
                  style: TextStyle(fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _table() {
    return ResponsiveTable(
      minWidth: 720,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderColor),
        ),
        child: Obx(() {
          if (_ctrl.isCurrencyLoading.value && _ctrl.currencyRates.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(48),
              child: Center(
                  child: CircularProgressIndicator(color: kPrimaryColor)),
            );
          }
          if (_ctrl.currencyRates.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(48),
              child: Center(
                child: Text('Нет валют',
                    style: TextStyle(fontSize: 13, color: kTextMuted)),
              ),
            );
          }
          return Column(
            children: [
              _header(),
              for (var i = 0; i < _ctrl.currencyRates.length; i++)
                _row(_ctrl.currencyRates[i],
                    isLast: i == _ctrl.currencyRates.length - 1),
            ],
          );
        }),
      ),
    );
  }

  Widget _header() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: const BoxDecoration(
        color: kGray50,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        border: Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: const Row(
        children: [
          SizedBox(width: 64, child: _Th('Код')),
          Expanded(flex: 4, child: _Th('Название')),
          Expanded(flex: 3, child: _Th('Курс к UZS', align: TextAlign.right)),
          Expanded(flex: 2, child: _Th('Источник', align: TextAlign.right)),
          SizedBox(width: 100, child: _Th('Действие', align: TextAlign.right)),
        ],
      ),
    );
  }

  Widget _row(CurrencyRate r, {required bool isLast}) {
    final f = NumberFormat.decimalPattern();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 64,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: kPrimaryColorLight,
                borderRadius: BorderRadius.circular(6),
              ),
              alignment: Alignment.center,
              child: Text(
                r.code,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: kPrimaryColor,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 4,
            child: Text(r.name,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: kTextPrimary)),
          ),
          Expanded(
            flex: 3,
            child: Text(
              '${f.format(r.rate)} UZS',
              textAlign: TextAlign.right,
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: kPrimaryColor),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              r.source,
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 11, color: kTextHint),
            ),
          ),
          SizedBox(
            width: 100,
            child: Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () => _editRate(r),
                style: TextButton.styleFrom(foregroundColor: kPrimaryColor),
                icon: const Icon(Icons.edit_rounded, size: 14),
                label: const Text('Курс', style: TextStyle(fontSize: 12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _editRate(CurrencyRate r) async {
    final ctrl = TextEditingController(text: r.rate.toString());
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Курс ${r.code}'),
        content: SizedBox(
          width: 320,
          child: TextField(
            controller: ctrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              labelText: 'Сколько UZS за 1 ${r.code}',
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
          Obx(() => FilledButton(
                onPressed: _ctrl.isCurrencySaving.value
                    ? null
                    : () async {
                        final v = num.tryParse(ctrl.text);
                        if (v == null || v <= 0) return;
                        Navigator.of(ctx).pop();
                        final ok = await _ctrl.updateCurrency(r.code, v);
                        if (ok && mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            backgroundColor: kSuccessColor,
                            behavior: SnackBarBehavior.floating,
                            content: Text('Курс ${r.code} обновлён'),
                          ));
                        }
                      },
                style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                child: const Text('Сохранить'),
              )),
        ],
      ),
    );
    ctrl.dispose();
  }
}

class _Th extends StatelessWidget {
  const _Th(this.label, {this.align = TextAlign.left});
  final String label;
  final TextAlign align;
  @override
  Widget build(BuildContext context) {
    return Text(label,
        textAlign: align,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: kTextHint,
          letterSpacing: 0.4,
        ));
  }
}
