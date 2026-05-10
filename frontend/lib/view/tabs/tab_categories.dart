import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/category_model.dart';
import 'package:sales_system/view/components/responsive_table.dart';
import 'package:sales_system/viewmodel/controller/categories_controller.dart';

class TabCategories extends StatefulWidget {
  const TabCategories({super.key});

  @override
  State<TabCategories> createState() => _TabCategoriesState();
}

class _TabCategoriesState extends State<TabCategories> {
  CategoriesController get _ctrl => Get.find<CategoriesController>();

  @override
  void initState() {
    super.initState();
    if (_ctrl.categories.isEmpty) _ctrl.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildToolbar(),
          const SizedBox(height: 16),
          _buildList(),
        ],
      ),
    );
  }

  Widget _buildToolbar() {
    return Row(
      children: [
        const Expanded(
          child: Text(
            'Управление категориями товаров',
            style: TextStyle(fontSize: 13, color: kTextMuted),
          ),
        ),
        _PrimaryButton(
          label: 'Новая категория',
          icon: Icons.add_rounded,
          onTap: () => _openForm(),
        ),
      ],
    );
  }

  Widget _buildList() {
    return ResponsiveTable(
      minWidth: 700,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderColor),
        ),
        child: Obx(() {
          if (_ctrl.isLoading.value && _ctrl.categories.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(48),
              child: Center(child: CircularProgressIndicator(color: kPrimaryColor)),
            );
          }
          if (_ctrl.categories.isEmpty) {
            return _empty();
          }
          return Column(
            children: [
              for (var i = 0; i < _ctrl.categories.length; i++)
                _row(_ctrl.categories[i],
                    isLast: i == _ctrl.categories.length - 1),
            ],
          );
        }),
      ),
    );
  }

  Widget _empty() {
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
              child: const Icon(Icons.local_offer_outlined,
                  size: 28, color: kTextMuted),
            ),
            const SizedBox(height: 16),
            const Text(
              'Категорий пока нет',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: kTextPrimary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Создайте первую категорию для группировки товаров',
              style: TextStyle(fontSize: 12, color: kTextMuted),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(CategoryModel c, {required bool isLast}) {
    return InkWell(
      onTap: () => _openForm(category: c),
      child: Container(
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
                color: _hex(c.color).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: Icon(Icons.local_offer_outlined,
                  size: 18, color: _hex(c.color)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.name,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: kTextPrimary,
                    ),
                  ),
                  if (c.description.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        c.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 11, color: kTextHint),
                      ),
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: kGray100,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                c.slug,
                style: const TextStyle(
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: kTextMuted,
                ),
              ),
            ),
            const SizedBox(width: 12),
            IconButton(
              iconSize: 16,
              splashRadius: 16,
              onPressed: () => _confirmDelete(c),
              icon: const Icon(Icons.delete_outline_rounded, color: kTextHint),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openForm({CategoryModel? category}) async {
    final nameCtrl = TextEditingController(text: category?.name ?? '');
    final descCtrl = TextEditingController(text: category?.description ?? '');
    final colorCtrl =
        TextEditingController(text: category?.color ?? '#9333EA');
    final formKey = GlobalKey<FormState>();
    final isEdit = category != null;

    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(isEdit ? 'Изменить категорию' : 'Новая категория'),
        content: SizedBox(
          width: 380,
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _field(nameCtrl, 'Название', required: true),
                const SizedBox(height: 12),
                _field(descCtrl, 'Описание', maxLines: 2),
                const SizedBox(height: 12),
                _field(colorCtrl, 'Цвет (#RRGGBB)'),
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
                        final draft = CategoryModel(
                          id: category?.id ?? '',
                          name: nameCtrl.text.trim(),
                          description: descCtrl.text.trim(),
                          color: colorCtrl.text.trim().isEmpty
                              ? '#9333EA'
                              : colorCtrl.text.trim(),
                        );
                        final ok = await _ctrl.save(
                          draft,
                          editingId: isEdit ? category.id : null,
                        );
                        if (ok && ctx.mounted) Navigator.of(ctx).pop();
                      },
                style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                child: Text(isEdit ? 'Сохранить' : 'Создать'),
              )),
        ],
      ),
    );

    nameCtrl.dispose();
    descCtrl.dispose();
    colorCtrl.dispose();
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    bool required = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? 'Обязательное поле' : null
          : null,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
    );
  }

  Future<void> _confirmDelete(CategoryModel c) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Удалить категорию?'),
        content: Text(
          'Категория «${c.name}» будет удалена.',
          style: const TextStyle(fontSize: 13, color: kTextMuted),
        ),
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
    if (result == true) await _ctrl.remove(c);
  }

  Color _hex(String s) {
    var v = s.replaceFirst('#', '');
    if (v.length == 6) v = 'FF$v';
    return Color(int.tryParse(v, radix: 16) ?? 0xFF9333EA);
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({required this.label, required this.icon, required this.onTap});
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
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
