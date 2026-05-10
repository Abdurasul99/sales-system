import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/responsive_table.dart';

import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/repository/extra_repository.dart';

class TabAbc extends StatefulWidget {
  const TabAbc({super.key});

  @override
  State<TabAbc> createState() => _TabAbcState();
}

class _TabAbcState extends State<TabAbc> {
  ExtraController get _ctrl => Get.find<ExtraController>();

  @override
  void initState() {
    super.initState();
    _ctrl.fetchAbc();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _periodPicker(),
          const SizedBox(height: 16),
          _summary(),
          const SizedBox(height: 16),
          _table(),
        ],
      ),
    );
  }

  Widget _periodPicker() {
    const presets = [30, 60, 90, 180];
    return Obx(() => Row(
          children: [
            const Text('Период анализа: ',
                style: TextStyle(fontSize: 13, color: kTextMuted)),
            const SizedBox(width: 8),
            ...presets.map((d) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _Chip(
                    label: 'За $d дней',
                    isActive: _ctrl.abcDays.value == d,
                    onTap: () => _ctrl.fetchAbc(days: d),
                  ),
                )),
          ],
        ));
  }

  Widget _summary() {
    return Obx(() {
      final s = _ctrl.abc.value.summary;
      final f = NumberFormat.decimalPattern();
      final margin = s['totalMarginPct'] ?? 0;
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          _classCard('A', 'Топ — 80% выручки', s['A'] ?? 0,
              const Color(0xFF10B981)),
          _classCard('B', '80–95% выручки', s['B'] ?? 0,
              const Color(0xFFF59E0B)),
          _classCard('C', 'Хвост — 5%', s['C'] ?? 0, const Color(0xFFEF4444)),
          _statCard(
            'Общая выручка',
            '${f.format(s['totalRevenue'] ?? 0)} UZS',
            kPrimaryColor,
          ),
          _statCard(
            'Прибыль (маржа ${margin.toStringAsFixed(1)}%)',
            '${f.format(s['totalProfit'] ?? 0)} UZS',
            kSuccessColor,
          ),
        ],
      );
    });
  }

  Widget _classCard(String label, String hint, num count, Color color) {
    return SizedBox(
      width: 240,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorderColor),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 18,
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('$count товаров',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: kTextPrimary)),
                  Text(hint,
                      style: const TextStyle(fontSize: 11, color: kTextHint)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String label, String value, Color color) {
    return SizedBox(
      width: 280,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: kTextHint)),
            const SizedBox(height: 6),
            Text(value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w700, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _table() {
    return ResponsiveTable(
      minWidth: 1320,
      child: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Obx(() {
        final items = _ctrl.abc.value.items;
        if (_ctrl.isAbcLoading.value && items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(48),
            child: Center(child: CircularProgressIndicator(color: kPrimaryColor)),
          );
        }
        if (items.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(48),
            child: Center(
              child: Text('Нет данных за период',
                  style: TextStyle(fontSize: 13, color: kTextMuted)),
            ),
          );
        }
        return Column(
          children: [
            _header(),
            for (var i = 0; i < items.length; i++)
              _row(items[i], i + 1, isLast: i == items.length - 1),
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
          SizedBox(width: 36, child: _Th('#')),
          Expanded(flex: 4, child: _Th('Товар')),
          Expanded(flex: 2, child: _Th('Кол-во', align: TextAlign.right)),
          Expanded(flex: 3, child: _Th('Выручка', align: TextAlign.right)),
          Expanded(flex: 3, child: _Th('Себ-ть', align: TextAlign.right)),
          Expanded(flex: 3, child: _Th('Прибыль', align: TextAlign.right)),
          Expanded(flex: 2, child: _Th('Маржа', align: TextAlign.right)),
          Expanded(flex: 2, child: _Th('Доля', align: TextAlign.right)),
          Expanded(flex: 2, child: _Th('Накопл.', align: TextAlign.right)),
          SizedBox(width: 56, child: _Th('Класс', align: TextAlign.center)),
        ],
      ),
    );
  }

  Widget _row(AbcItem it, int idx, {required bool isLast}) {
    final f = NumberFormat.decimalPattern();
    final color = it.cls == 'A'
        ? const Color(0xFF10B981)
        : (it.cls == 'B'
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444));
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 36,
            child: Text('$idx',
                style: const TextStyle(fontSize: 12, color: kTextHint)),
          ),
          Expanded(
            flex: 4,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(it.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: kTextPrimary)),
                Text(it.sku,
                    style: const TextStyle(
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: kTextHint)),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Text('${it.quantity}',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12, color: kTextSecondary)),
          ),
          Expanded(
            flex: 3,
            child: Text('${f.format(it.revenue)} UZS',
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: kPrimaryColor)),
          ),
          Expanded(
            flex: 3,
            child: Text('${f.format(it.cogs)} UZS',
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontSize: 12, color: kTextMuted)),
          ),
          Expanded(
            flex: 3,
            child: Text('${f.format(it.profit)} UZS',
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: kSuccessColor)),
          ),
          Expanded(
            flex: 2,
            child: Text('${it.marginPct.toStringAsFixed(1)}%',
                textAlign: TextAlign.right,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: it.marginPct >= 30
                        ? kSuccessColor
                        : (it.marginPct >= 15
                            ? kWarningColor
                            : kErrorColor))),
          ),
          Expanded(
            flex: 2,
            child: Text('${it.sharePct.toStringAsFixed(1)}%',
                textAlign: TextAlign.right,
                style: const TextStyle(
                    fontSize: 12,
                    color: kTextSecondary,
                    fontWeight: FontWeight.w500)),
          ),
          Expanded(
            flex: 2,
            child: Text('${it.cumPct.toStringAsFixed(1)}%',
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12, color: kTextHint)),
          ),
          SizedBox(
            width: 56,
            child: Center(
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  it.cls,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
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

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.isActive, required this.onTap});
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: isActive ? kPrimaryColor : Colors.white,
            border: Border.all(
                color: isActive ? kPrimaryColor : kBorderColorStrong),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : kTextSecondary,
              )),
        ),
      ),
    );
  }
}
