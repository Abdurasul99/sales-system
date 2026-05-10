import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/responsive_table.dart';

import 'package:sales_system/viewmodel/controller/products_controller.dart';

class TabWarehouse extends StatefulWidget {
  const TabWarehouse({super.key});

  @override
  State<TabWarehouse> createState() => _TabWarehouseState();
}

class _TabWarehouseState extends State<TabWarehouse> {
  ProductsController get _ctrl => Get.find<ProductsController>();
  String _filter = 'all'; // all | low | out

  @override
  void initState() {
    super.initState();
    if (_ctrl.products.isEmpty) _ctrl.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _stats(),
          const SizedBox(height: 16),
          _filters(),
          const SizedBox(height: 16),
          _list(),
        ],
      ),
    );
  }

  Widget _stats() {
    return Obx(() {
      final products = _ctrl.products;
      final totalUnits = products.fold<num>(0, (s, p) => s + p.stock);
      final stockAtCost =
          products.fold<num>(0, (s, p) => s + p.cost * p.stock);
      final stockAtPrice =
          products.fold<num>(0, (s, p) => s + p.price * p.stock);
      final potentialProfit = stockAtPrice - stockAtCost;
      final outOfStock = products.where((p) => p.stock <= 0).length;
      final lowStock = products.where((p) => p.stock > 0 && p.stock < 5).length;
      final f = NumberFormat.decimalPattern();
      return ResponsiveRow(
        minChildWidth: 220,
        children: [
          _stat('Позиций', '${products.length}', Icons.inventory_2_outlined,
              kPrimaryColor),
          _stat('Единиц на складе', f.format(totalUnits),
              Icons.warehouse_outlined, kIndigoColor),
          _stat('Себестоимость остатка',
              '${f.format(stockAtCost.toInt())} UZS',
              Icons.savings_outlined, kPrimaryColor),
          _stat('Розница остатка',
              '${f.format(stockAtPrice.toInt())} UZS',
              Icons.payments_rounded, kSuccessColor),
          _stat('Потенциал. прибыль',
              '${f.format(potentialProfit.toInt())} UZS',
              Icons.trending_up_rounded, kIndigoColor),
          _stat('Заканчиваются',
              '$lowStock + $outOfStock 0', Icons.warning_amber_rounded,
              outOfStock > 0 ? kErrorColor : kWarningColor),
        ],
      );
    });
  }

  Widget _stat(String label, String value, IconData icon, Color color) {
    return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: kBorderColor),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(fontSize: 11, color: kTextHint)),
                  Text(value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: kTextPrimary)),
                ],
              ),
            ),
          ],
        ),
    );
  }

  Widget _filters() {
    return Wrap(
      spacing: 8,
      children: [
        _chip('Все', 'all'),
        _chip('Заканчиваются', 'low'),
        _chip('Закончились', 'out'),
      ],
    );
  }

  Widget _chip(String label, String value) {
    final active = _filter == value;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => setState(() => _filter = value),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: active ? kPrimaryColor : Colors.white,
            border: Border.all(
                color: active ? kPrimaryColor : kBorderColorStrong),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: active ? Colors.white : kTextSecondary,
              )),
        ),
      ),
    );
  }

  Widget _list() {
    return ResponsiveTable(
      minWidth: 1180,
      child: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Obx(() {
        var products = _ctrl.products.toList();
        if (_filter == 'low') {
          products = products.where((p) => p.stock > 0 && p.stock < 5).toList();
        } else if (_filter == 'out') {
          products = products.where((p) => p.stock <= 0).toList();
        }
        products.sort((a, b) => a.stock.compareTo(b.stock));

        if (_ctrl.isLoading.value && products.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(48),
            child: Center(child: CircularProgressIndicator(color: kPrimaryColor)),
          );
        }
        if (products.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(48),
            child: Center(
              child: Text('Нет позиций под этот фильтр',
                  style: TextStyle(fontSize: 13, color: kTextMuted)),
            ),
          );
        }
        final f = NumberFormat.decimalPattern();
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: const BoxDecoration(
                color: kGray50,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                border: Border(bottom: BorderSide(color: kBorderColor)),
              ),
              child: const Row(
                children: [
                  Expanded(flex: 4, child: _Th('Товар')),
                  Expanded(flex: 2, child: _Th('SKU')),
                  Expanded(flex: 2, child: _Th('Себестоимость', align: TextAlign.right)),
                  Expanded(flex: 2, child: _Th('Цена', align: TextAlign.right)),
                  Expanded(flex: 1, child: _Th('Маржа', align: TextAlign.right)),
                  Expanded(flex: 2, child: _Th('Остаток', align: TextAlign.right)),
                  Expanded(flex: 2, child: _Th('Себ-ть на складе', align: TextAlign.right)),
                  Expanded(flex: 2, child: _Th('Розница', align: TextAlign.right)),
                ],
              ),
            ),
            for (var i = 0; i < products.length; i++)
              Builder(builder: (_) {
                final p = products[i];
                final color = p.stock <= 0
                    ? kErrorColor
                    : (p.stock < 5 ? kWarningColor : kSuccessColor);
                final isLast = i == products.length - 1;
                return Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    border: isLast
                        ? null
                        : const Border(
                            bottom: BorderSide(color: kBorderColor)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 4,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: kTextPrimary)),
                            const SizedBox(height: 2),
                            Text(p.category,
                                style: const TextStyle(
                                    fontSize: 11, color: kTextHint)),
                          ],
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(p.sku,
                            style: const TextStyle(
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: kTextMuted)),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text('${f.format(p.cost)} ${p.currency}',
                            textAlign: TextAlign.right,
                            style: const TextStyle(
                                fontSize: 12,
                                color: kTextMuted,
                                fontWeight: FontWeight.w500)),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text('${f.format(p.price)} ${p.currency}',
                            textAlign: TextAlign.right,
                            style: const TextStyle(
                                fontSize: 13,
                                color: kTextPrimary,
                                fontWeight: FontWeight.w700)),
                      ),
                      Expanded(
                        flex: 1,
                        child: Text('${p.marginPct.toStringAsFixed(0)}%',
                            textAlign: TextAlign.right,
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: p.marginPct >= 30
                                    ? kSuccessColor
                                    : (p.marginPct >= 15
                                        ? kWarningColor
                                        : kErrorColor))),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text('${p.stock} ${p.unit}',
                            textAlign: TextAlign.right,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: color)),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                            '${f.format((p.cost * p.stock).toInt())} ${p.currency}',
                            textAlign: TextAlign.right,
                            style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: kTextSecondary)),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                            '${f.format((p.price * p.stock).toInt())} ${p.currency}',
                            textAlign: TextAlign.right,
                            style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: kPrimaryColor)),
                      ),
                    ],
                  ),
                );
              }),
          ],
        );
      }),
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
