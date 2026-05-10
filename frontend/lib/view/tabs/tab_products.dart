import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/view/components/responsive_table.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';

class TabProducts extends GetView<ProductsController> {
  const TabProducts({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildSearchBar(),
          const SizedBox(height: 16),
          _buildTable(context),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorderColor),
      ),
      child: Row(
        children: [
          const Icon(Icons.search_rounded, size: 18, color: kTextHint),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              onChanged: controller.onSearchChanged,
              onSubmitted: (_) => controller.fetch(),
              decoration: const InputDecoration(
                hintText: 'Поиск по названию или описанию',
                hintStyle: TextStyle(color: kTextHint, fontSize: 14),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
              style: const TextStyle(fontSize: 14, color: kTextPrimary),
            ),
          ),
          GestureDetector(
            onTap: controller.fetch,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: kPrimaryColorLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Найти',
                style: TextStyle(
                  fontSize: 12,
                  color: kPrimaryColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTable(BuildContext context) {
    return ResponsiveTable(
      minWidth: 1080,
      child: Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Obx(() {
        if (controller.isLoading.value && controller.products.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(64),
            child: Center(
                child: CircularProgressIndicator(color: kPrimaryColor)),
          );
        }
        final err = controller.errorMessage.value;
        if (err != null && controller.products.isEmpty) {
          return _emptyState(
            icon: Icons.cloud_off_rounded,
            title: 'Не удалось загрузить товары',
            subtitle: err,
          );
        }
        if (controller.products.isEmpty) {
          return _emptyState(
            icon: Icons.inventory_2_outlined,
            title: 'Товаров пока нет',
            subtitle: 'Создайте первый товар по кнопке «Новый товар»',
          );
        }
        return Column(
          children: [
            _tableHeader(),
            for (var i = 0; i < controller.products.length; i++)
              _tableRow(context, controller.products[i],
                  isLast: i == controller.products.length - 1),
          ],
        );
      }),
    ),
    );
  }

  Widget _tableHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: const BoxDecoration(
        color: kGray50,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        border: Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: const Row(
        children: [
          Expanded(flex: 4, child: _Th('Название')),
          Expanded(flex: 2, child: _Th('SKU')),
          Expanded(flex: 2, child: _Th('Категория')),
          Expanded(flex: 2, child: _Th('Себ-ть', align: TextAlign.right)),
          Expanded(flex: 2, child: _Th('Цена', align: TextAlign.right)),
          Expanded(flex: 1, child: _Th('Маржа', align: TextAlign.right)),
          Expanded(flex: 2, child: _Th('Остаток', align: TextAlign.right)),
          SizedBox(width: 56),
        ],
      ),
    );
  }

  Widget _tableRow(BuildContext context, ProductModel p, {required bool isLast}) {
    final formatter = NumberFormat.decimalPattern();
    final stockColor = p.stock <= 0
        ? kErrorColor
        : (p.stock < 5 ? kWarningColor : kSuccessColor);
    return InkWell(
      onTap: () => controller.openEditForm(p),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          border: isLast
              ? null
              : const Border(bottom: BorderSide(color: kBorderColor)),
        ),
        child: Row(
          children: [
            Expanded(
              flex: 4,
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: kPrimaryColorLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(Icons.inventory_2_outlined,
                        size: 18, color: kPrimaryColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: kTextPrimary,
                          ),
                        ),
                        if (p.description.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 2),
                            child: Text(
                              p.description,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 11,
                                color: kTextHint,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                p.sku,
                style: const TextStyle(
                    fontSize: 12, color: kTextMuted, fontFamily: 'monospace'),
              ),
            ),
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: kGray100,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  p.category,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: kTextSecondary,
                  ),
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                '${formatter.format(p.cost)} ${p.currency}',
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: kTextMuted,
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                '${formatter.format(p.price)} ${p.currency}',
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: kTextPrimary,
                ),
              ),
            ),
            Expanded(
              flex: 1,
              child: Text(
                '${p.marginPct.toStringAsFixed(0)}%',
                textAlign: TextAlign.right,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: p.marginPct >= 30
                      ? kSuccessColor
                      : (p.marginPct >= 15 ? kWarningColor : kErrorColor),
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                '${p.stock} ${p.unit}',
                textAlign: TextAlign.right,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: stockColor,
                ),
              ),
            ),
            SizedBox(
              width: 56,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    iconSize: 16,
                    splashRadius: 16,
                    onPressed: () => _confirmDelete(context, p),
                    icon: const Icon(Icons.delete_outline_rounded,
                        color: kTextHint),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _emptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.all(48),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: kGray100,
                borderRadius: BorderRadius.circular(16),
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 28, color: kTextMuted),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: kTextPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: kTextMuted),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, ProductModel p) {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Удалить товар?'),
        content: Text(
          'Товар «${p.name}» будет удалён без возможности восстановления.',
          style: const TextStyle(fontSize: 13, color: kTextMuted),
        ),
        actions: [
          TextButton(
            onPressed: Get.back,
            style: TextButton.styleFrom(foregroundColor: kTextMuted),
            child: const Text('Отмена'),
          ),
          FilledButton(
            onPressed: () {
              Get.back();
              controller.remove(p);
            },
            style: FilledButton.styleFrom(backgroundColor: kErrorColor),
            child: const Text('Удалить'),
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
    return Text(
      label,
      textAlign: align,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: kTextHint,
        letterSpacing: 0.4,
      ),
    );
  }
}
