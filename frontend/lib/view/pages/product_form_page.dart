import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/header.dart';
import 'package:sales_system/view/components/sidebar.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';
import 'package:sales_system/viewmodel/controller/categories_controller.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';

class ProductFormPage extends StatefulWidget {
  const ProductFormPage({super.key});

  @override
  State<ProductFormPage> createState() => _ProductFormPageState();
}

class _ProductFormPageState extends State<ProductFormPage> {
  ProductsController get _ctrl => Get.find<ProductsController>();
  CategoriesController get _categories => Get.find<CategoriesController>();
  AuthController get _auth => Get.find<AuthController>();

  @override
  void initState() {
    super.initState();
    if (_categories.categories.isEmpty) _categories.fetch();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = _ctrl.editingId.value != null;
    final user = _auth.user.value;

    return Scaffold(
      backgroundColor: kBackgroundColor,
      body: SafeArea(
        top: false,
        bottom: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (user != null)
              Sidebar(
                user: user,
                activeId: 'products',
                onSelect: (_) => Get.back(),
                onLogout: _auth.logout,
              ),
            Expanded(
              child: Column(
                children: [
                  Header(
                    title: isEditing ? 'Изменение товара' : 'Новый товар',
                    subtitle: isEditing
                        ? 'Обновите данные товара и нажмите «Сохранить»'
                        : 'Заполните карточку товара',
                    actions: [
                      TextButton.icon(
                        onPressed: Get.back,
                        style: TextButton.styleFrom(foregroundColor: kTextMuted),
                        icon: const Icon(Icons.close_rounded, size: 16),
                        label: const Text('Закрыть'),
                      ),
                      const SizedBox(width: 12),
                    ],
                  ),
                  Expanded(
                    child: Center(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 720),
                          child: _buildCard(isEditing),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(bool isEditing) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Form(
        key: _ctrl.formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _SectionTitle('Основные данные'),
            const SizedBox(height: 12),
            _input(_ctrl.nameCtrl,
                label: 'Название',
                hint: 'Например: iPhone 17 Pro 256GB',
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Название обязательно'
                    : null),
            const SizedBox(height: 16),
            _input(_ctrl.skuCtrl,
                label: 'SKU (артикул)',
                hint: 'IPHONE-17-PRO-256',
                textCapitalization: TextCapitalization.characters,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'SKU обязателен' : null),
            const SizedBox(height: 16),
            _input(_ctrl.descriptionCtrl,
                label: 'Описание', maxLines: 3, hint: 'Краткое описание товара'),
            const SizedBox(height: 24),
            const _SectionTitle('Цена и себестоимость'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _input(_ctrl.costCtrl,
                      label: 'Себестоимость (UZS)',
                      hint: '0',
                      onChanged: (_) => setState(() {}),
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))
                      ],
                      validator: (v) {
                        final n = num.tryParse(v ?? '');
                        if (n == null) return 'Введите себестоимость';
                        if (n < 0) return 'Не может быть отрицательной';
                        return null;
                      }),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _input(_ctrl.priceCtrl,
                      label: 'Цена продажи (UZS)',
                      hint: '0',
                      onChanged: (_) => setState(() {}),
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))
                      ],
                      validator: (v) {
                        final n = num.tryParse(v ?? '');
                        if (n == null) return 'Введите цену';
                        if (n < 0) return 'Цена не может быть отрицательной';
                        return null;
                      }),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _marginPreview(),
            const SizedBox(height: 24),
            const _SectionTitle('Склад и поставка'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _input(_ctrl.stockCtrl,
                      label: 'Остаток',
                      hint: '0',
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      validator: (v) {
                        final n = num.tryParse(v ?? '');
                        if (n == null) return 'Введите остаток';
                        return null;
                      }),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 110,
                  child: _input(_ctrl.unitCtrl,
                      label: 'Ед.изм.', hint: 'шт / упак / кг'),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 160,
                  child: _input(_ctrl.leadTimeCtrl,
                      label: 'Lead Time (дн.)',
                      hint: '14',
                      keyboardType: TextInputType.number,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly]),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const _SectionTitle('Категория'),
            const SizedBox(height: 12),
            _categoryField(),
            const SizedBox(height: 28),
            Obx(() {
              final err = _ctrl.errorMessage.value;
              if (err == null) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: kErrorColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                    border:
                        Border.all(color: kErrorColor.withValues(alpha: 0.2)),
                  ),
                  child: Text(err,
                      style: const TextStyle(
                          fontSize: 13, color: kErrorColor)),
                ),
              );
            }),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: Get.back,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: kTextSecondary,
                      side: const BorderSide(color: kBorderColorStrong),
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Отмена'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: Obx(() => FilledButton.icon(
                        onPressed: _ctrl.isSaving.value
                            ? null
                            : () async {
                                if (!(_ctrl.formKey.currentState?.validate() ??
                                    false)) {
                                  return;
                                }
                                final ok = await _ctrl.save();
                                if (ok && mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                    backgroundColor: kSuccessColor,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text(isEditing
                                        ? 'Товар обновлён'
                                        : 'Товар создан'),
                                  ));
                                }
                              },
                        style: FilledButton.styleFrom(
                          backgroundColor: kPrimaryColor,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: _ctrl.isSaving.value
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : Icon(
                                isEditing
                                    ? Icons.save_rounded
                                    : Icons.add_circle_outline_rounded,
                                size: 18),
                        label: Text(_ctrl.isSaving.value
                            ? 'Сохранение...'
                            : (isEditing ? 'Сохранить' : 'Создать товар')),
                      )),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _marginPreview() {
    final cost = num.tryParse(_ctrl.costCtrl.text) ?? 0;
    final price = num.tryParse(_ctrl.priceCtrl.text) ?? 0;
    if (cost <= 0 && price <= 0) return const SizedBox.shrink();
    final profit = price - cost;
    final marginPct = price > 0 ? (profit / price) * 100 : 0;
    final markupPct = cost > 0 ? (profit / cost) * 100 : 0;
    final f = NumberFormat.decimalPattern();
    final isLoss = profit < 0;
    final color = isLoss ? kErrorColor : kSuccessColor;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Row(
        children: [
          Icon(isLoss ? Icons.trending_down_rounded : Icons.trending_up_rounded,
              color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Wrap(
              spacing: 16,
              runSpacing: 4,
              children: [
                _kv('Прибыль с шт', '${f.format(profit.toInt())} UZS', color),
                _kv('Маржа',
                    '${marginPct.toStringAsFixed(1)}%', color),
                _kv('Наценка',
                    '${markupPct.toStringAsFixed(1)}%', kTextSecondary),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _kv(String label, String value, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('$label: ',
            style: const TextStyle(fontSize: 12, color: kTextMuted)),
        Text(value,
            style: TextStyle(
                fontSize: 13, fontWeight: FontWeight.w700, color: color)),
      ],
    );
  }

  Widget _categoryField() {
    return Obx(() {
      final list = _categories.categories;
      // Determine current value: free text from categoryCtrl
      final currentSlug = _ctrl.categoryCtrl.text.trim();
      final hasMatch = list.any((c) =>
          c.slug.toLowerCase() == currentSlug.toLowerCase() ||
          c.name.toLowerCase() == currentSlug.toLowerCase());
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (list.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Wrap(
                spacing: 8,
                runSpacing: 6,
                children: list
                    .map((c) => _CategoryChip(
                          label: c.name,
                          isSelected: currentSlug.toLowerCase() ==
                                  c.slug.toLowerCase() ||
                              currentSlug.toLowerCase() ==
                                  c.name.toLowerCase(),
                          onTap: () {
                            setState(() {
                              _ctrl.categoryCtrl.text = c.slug;
                            });
                          },
                        ))
                    .toList(),
              ),
            ),
          _input(
            _ctrl.categoryCtrl,
            label: list.isEmpty
                ? 'Категория'
                : (hasMatch
                    ? 'Категория (выбрано)'
                    : 'Своя категория или выберите выше'),
            hint: 'electronics / accessories / appliances',
          ),
        ],
      );
    });
  }

  Widget _input(
    TextEditingController controller, {
    required String label,
    String? hint,
    int maxLines = 1,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    TextCapitalization textCapitalization = TextCapitalization.none,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      textCapitalization: textCapitalization,
      validator: validator,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 14, color: kTextPrimary),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        hintStyle: const TextStyle(color: kTextHint, fontSize: 13),
        labelStyle: const TextStyle(fontSize: 13, color: kTextSecondary),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        filled: true,
        fillColor: Colors.white,
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
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: kErrorColor),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.label);
  final String label;
  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: kTextHint,
        letterSpacing: 1.2,
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  const _CategoryChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
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
            color: isSelected ? kPrimaryColor : kPrimaryColorLight,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected
                  ? kPrimaryColor
                  : kPrimaryColor.withValues(alpha: 0.2),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : kPrimaryColor,
            ),
          ),
        ),
      ),
    );
  }
}
