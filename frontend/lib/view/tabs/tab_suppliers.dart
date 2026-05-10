import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/responsive_table.dart';

import 'package:sales_system/model/supplier_model.dart';
import 'package:sales_system/viewmodel/controller/suppliers_controller.dart';

class TabSuppliers extends StatefulWidget {
  const TabSuppliers({super.key});

  @override
  State<TabSuppliers> createState() => _TabSuppliersState();
}

class _TabSuppliersState extends State<TabSuppliers> {
  SuppliersController get _ctrl => Get.find<SuppliersController>();

  @override
  void initState() {
    super.initState();
    if (_ctrl.suppliers.isEmpty) _ctrl.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _toolbar(),
          const SizedBox(height: 16),
          _table(),
        ],
      ),
    );
  }

  Widget _toolbar() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kBorderColor),
            ),
            child: Row(
              children: [
                const Icon(Icons.search_rounded, size: 16, color: kTextHint),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: (v) {
                      _ctrl.onSearch(v);
                      _ctrl.fetch();
                    },
                    decoration: const InputDecoration(
                      hintText: 'Поиск поставщика',
                      hintStyle: TextStyle(fontSize: 13, color: kTextHint),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    style: const TextStyle(fontSize: 13, color: kTextPrimary),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        _PrimaryButton(
          label: 'Новый поставщик',
          icon: Icons.add_business_rounded,
          onTap: () => _openForm(),
        ),
      ],
    );
  }

  Widget _table() {
    return ResponsiveTable(
      minWidth: 900,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: kBorderColor),
        ),
        child: Obx(() {
          if (_ctrl.isLoading.value && _ctrl.suppliers.isEmpty) {
            return const Padding(
              padding: EdgeInsets.all(48),
              child: Center(
                  child: CircularProgressIndicator(color: kPrimaryColor)),
            );
          }
          if (_ctrl.suppliers.isEmpty) {
            return _empty();
          }
          return Column(
            children: [
              _header(),
              for (var i = 0; i < _ctrl.suppliers.length; i++)
                _row(_ctrl.suppliers[i],
                    isLast: i == _ctrl.suppliers.length - 1),
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
          Expanded(flex: 4, child: _Th('Поставщик')),
          Expanded(flex: 3, child: _Th('Контакт')),
          Expanded(flex: 3, child: _Th('Телефон')),
          Expanded(flex: 2, child: _Th('Заказов', align: TextAlign.right)),
          Expanded(flex: 3, child: _Th('Сумма', align: TextAlign.right)),
          SizedBox(width: 56),
        ],
      ),
    );
  }

  Widget _row(SupplierModel s, {required bool isLast}) {
    final f = NumberFormat.decimalPattern();
    final initial = s.name.isNotEmpty ? s.name[0].toUpperCase() : '?';
    return InkWell(
      onTap: () => _openForm(supplier: s),
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
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      initial,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFD97706),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: kTextPrimary,
                          ),
                        ),
                        if (s.category.isNotEmpty)
                          Text(
                            s.category,
                            style: const TextStyle(
                                fontSize: 11, color: kTextHint),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 3,
              child: Text(
                s.contactPerson.isEmpty ? '—' : s.contactPerson,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 12, color: kTextSecondary),
              ),
            ),
            Expanded(
              flex: 3,
              child: Text(
                s.phone.isEmpty ? '—' : s.phone,
                style: const TextStyle(
                  fontSize: 12,
                  color: kTextSecondary,
                  fontFamily: 'monospace',
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                '${s.totalOrders}',
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: kTextPrimary,
                ),
              ),
            ),
            Expanded(
              flex: 3,
              child: Text(
                '${f.format(s.totalSpent)} UZS',
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: kPrimaryColor,
                ),
              ),
            ),
            SizedBox(
              width: 56,
              child: IconButton(
                iconSize: 16,
                splashRadius: 16,
                onPressed: () => _confirmDelete(s),
                icon: const Icon(Icons.delete_outline_rounded, color: kTextHint),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _empty() {
    return const Padding(
      padding: EdgeInsets.all(48),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.local_shipping_outlined, size: 48, color: kTextHint),
            SizedBox(height: 12),
            Text('Поставщиков пока нет',
                style: TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w600, color: kTextPrimary)),
            SizedBox(height: 4),
            Text('Создайте первого поставщика',
                style: TextStyle(fontSize: 12, color: kTextMuted)),
          ],
        ),
      ),
    );
  }

  Future<void> _openForm({SupplierModel? supplier}) async {
    final name = TextEditingController(text: supplier?.name ?? '');
    final contactPerson = TextEditingController(text: supplier?.contactPerson ?? '');
    final phone = TextEditingController(text: supplier?.phone ?? '');
    final email = TextEditingController(text: supplier?.email ?? '');
    final address = TextEditingController(text: supplier?.address ?? '');
    final category = TextEditingController(text: supplier?.category ?? '');
    final notes = TextEditingController(text: supplier?.notes ?? '');
    final formKey = GlobalKey<FormState>();
    final isEdit = supplier != null;

    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(isEdit ? 'Изменить поставщика' : 'Новый поставщик'),
        content: SizedBox(
          width: 420,
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _field(name, 'Название', required: true),
                  const SizedBox(height: 12),
                  _field(contactPerson, 'Контактное лицо'),
                  const SizedBox(height: 12),
                  _field(phone, 'Телефон'),
                  const SizedBox(height: 12),
                  _field(email, 'Email'),
                  const SizedBox(height: 12),
                  _field(category, 'Категория поставок'),
                  const SizedBox(height: 12),
                  _field(address, 'Адрес'),
                  const SizedBox(height: 12),
                  _field(notes, 'Заметки', maxLines: 2),
                ],
              ),
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
                        final draft = SupplierModel(
                          id: supplier?.id ?? '',
                          name: name.text.trim(),
                          contactPerson: contactPerson.text.trim(),
                          phone: phone.text.trim(),
                          email: email.text.trim(),
                          address: address.text.trim(),
                          category: category.text.trim(),
                          notes: notes.text.trim(),
                        );
                        final ok = await _ctrl.save(
                          draft,
                          editingId: isEdit ? supplier.id : null,
                        );
                        if (ok && ctx.mounted) {
                          Navigator.of(ctx).pop();
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                            backgroundColor: kSuccessColor,
                            behavior: SnackBarBehavior.floating,
                            content: Text(isEdit
                                ? 'Поставщик обновлён'
                                : 'Поставщик создан'),
                          ));
                        }
                      },
                style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
                child: Text(isEdit ? 'Сохранить' : 'Создать'),
              )),
        ],
      ),
    );

    name.dispose();
    contactPerson.dispose();
    phone.dispose();
    email.dispose();
    address.dispose();
    category.dispose();
    notes.dispose();
  }

  Widget _field(
    TextEditingController c,
    String label, {
    bool required = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: c,
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

  Future<void> _confirmDelete(SupplierModel s) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Удалить поставщика?'),
        content: Text('«${s.name}» будет удалён.'),
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
    if (ok == true) {
      await _ctrl.remove(s);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          backgroundColor: kSuccessColor,
          behavior: SnackBarBehavior.floating,
          content: Text('Поставщик удалён'),
        ));
      }
    }
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
          height: 40,
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
