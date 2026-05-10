import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/purchase_model.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';
import 'package:sales_system/viewmodel/controller/purchases_controller.dart';
import 'package:sales_system/viewmodel/controller/suppliers_controller.dart';

class TabPurchases extends StatefulWidget {
  const TabPurchases({super.key});

  @override
  State<TabPurchases> createState() => _TabPurchasesState();
}

class _TabPurchasesState extends State<TabPurchases> {
  PurchasesController get _pc => Get.find<PurchasesController>();
  ProductsController get _products => Get.find<ProductsController>();
  SuppliersController get _suppliers => Get.find<SuppliersController>();

  @override
  void initState() {
    super.initState();
    _pc.fetch();
    if (_products.products.isEmpty) _products.fetch();
    if (_suppliers.suppliers.isEmpty) _suppliers.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: LayoutBuilder(builder: (ctx, c) {
        final isWide = c.maxWidth > 980;
        if (!isWide) {
          return _list();
        }
        return Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(flex: 5, child: _newPurchaseCard()),
            const SizedBox(width: 16),
            Expanded(flex: 4, child: _list()),
          ],
        );
      }),
    );
  }

  // ─── New purchase form ───

  Widget _newPurchaseCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Expanded(
                  child: Text('Новая закупка',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: kTextPrimary)),
                ),
                Obx(() => _pc.cart.isEmpty
                    ? const SizedBox.shrink()
                    : TextButton.icon(
                        onPressed: _pc.clear,
                        style: TextButton.styleFrom(foregroundColor: kTextMuted),
                        icon: const Icon(Icons.refresh, size: 16),
                        label: const Text('Очистить'),
                      )),
              ],
            ),
          ),
          const Divider(height: 1, color: kBorderColor),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: _supplierPicker(),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: _productPicker(),
          ),
          const Divider(height: 1, color: kBorderColor),
          Expanded(child: _cart()),
          const Divider(height: 1, color: kBorderColor),
          Padding(
            padding: const EdgeInsets.all(16),
            child: _bottomBar(),
          ),
        ],
      ),
    );
  }

  Widget _supplierPicker() {
    return Obx(() {
      final list = _suppliers.suppliers;
      return DropdownButtonFormField<String>(
        initialValue: _pc.supplierId.value.isEmpty ? null : _pc.supplierId.value,
        decoration: InputDecoration(
          labelText: 'Поставщик',
          prefixIcon: const Icon(Icons.local_shipping_outlined,
              size: 18, color: kTextMuted),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
        items: [
          const DropdownMenuItem(value: '', child: Text('— без поставщика —')),
          ...list.map((s) => DropdownMenuItem(value: s.id, child: Text(s.name))),
        ],
        onChanged: (v) => _pc.supplierId.value = v ?? '',
      );
    });
  }

  Widget _productPicker() {
    return Obx(() {
      final products = _products.products.where((p) => p.isActive).toList();
      if (products.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 12),
          child: Text('Нет товаров для приёмки',
              style: TextStyle(fontSize: 13, color: kTextMuted)),
        );
      }
      return DropdownButtonFormField<String>(
        decoration: InputDecoration(
          labelText: 'Добавить товар',
          prefixIcon: const Icon(Icons.add_box_outlined,
              size: 18, color: kTextMuted),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
        items: products
            .map((p) => DropdownMenuItem<String>(
                  value: p.id,
                  child: Text(p.name, overflow: TextOverflow.ellipsis),
                ))
            .toList(),
        onChanged: (id) {
          if (id == null) return;
          final p = products.firstWhere((it) => it.id == id);
          _pc.addItem(p);
        },
      );
    });
  }

  Widget _cart() {
    return Obx(() {
      if (_pc.cart.isEmpty) {
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.archive_outlined,
                    size: 36, color: kTextHint.withValues(alpha: 0.7)),
                const SizedBox(height: 8),
                const Text('Корзина закупки пуста',
                    style: TextStyle(fontSize: 13, color: kTextMuted)),
                const SizedBox(height: 4),
                const Text('Добавьте товар выше',
                    style: TextStyle(fontSize: 11, color: kTextHint)),
              ],
            ),
          ),
        );
      }
      return ListView.separated(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _pc.cart.length,
        separatorBuilder: (_, __) => const Divider(height: 16, color: kBorderColor),
        itemBuilder: (_, i) => _cartItem(_pc.cart[i]),
      );
    });
  }

  Widget _cartItem(PurchaseItem it) {
    final f = NumberFormat.decimalPattern();
    return Row(
      children: [
        Expanded(
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
              Text('${f.format(it.cost)} × ${it.quantity}',
                  style: const TextStyle(fontSize: 11, color: kTextHint)),
            ],
          ),
        ),
        InkWell(
          onTap: () => _pc.updateQty(it.productId, it.quantity - 1),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: kGray100,
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.remove, size: 14, color: kTextSecondary),
          ),
        ),
        SizedBox(
          width: 28,
          child: Text('${it.quantity}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: kTextPrimary)),
        ),
        InkWell(
          onTap: () => _pc.updateQty(it.productId, it.quantity + 1),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: kGray100,
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.add, size: 14, color: kTextSecondary),
          ),
        ),
        const SizedBox(width: 12),
        SizedBox(
          width: 100,
          child: Text(f.format(it.total),
              textAlign: TextAlign.right,
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: kPrimaryColor)),
        ),
        IconButton(
          iconSize: 16,
          splashRadius: 16,
          onPressed: () => _pc.removeItem(it.productId),
          icon: const Icon(Icons.close_rounded, color: kTextHint),
        ),
      ],
    );
  }

  Widget _bottomBar() {
    return Obx(() {
      final f = NumberFormat.decimalPattern();
      final canSubmit = _pc.cart.isNotEmpty && !_pc.isSaving.value;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('Итого', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
              Text('${f.format(_pc.cartTotal)} UZS',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: kPrimaryColor)),
            ],
          ),
          const SizedBox(height: 12),
          if (_pc.errorMessage.value != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_pc.errorMessage.value!,
                  style: const TextStyle(fontSize: 12, color: kErrorColor)),
            ),
          SizedBox(
            height: 44,
            child: FilledButton.icon(
              onPressed: canSubmit ? _commit : null,
              style: FilledButton.styleFrom(
                backgroundColor: kPrimaryColor,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              icon: _pc.isSaving.value
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.check_rounded),
              label: Text(_pc.isSaving.value ? 'Приёмка...' : 'Принять на склад',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      );
    });
  }

  Future<void> _commit() async {
    final created = await _pc.commit();
    if (created != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: kSuccessColor,
          behavior: SnackBarBehavior.floating,
          content: Text('Закупка ${created.number} принята'),
        ),
      );
      _products.fetch();
      _suppliers.fetch();
    }
  }

  // ─── Purchase history list ───

  Widget _list() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Expanded(
                  child: Text('История закупок',
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: kTextPrimary)),
                ),
                IconButton(
                  iconSize: 18,
                  splashRadius: 16,
                  onPressed: _pc.fetch,
                  icon: const Icon(Icons.refresh, color: kTextMuted),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: kBorderColor),
          Expanded(
            child: Obx(() {
              if (_pc.isLoading.value && _pc.purchases.isEmpty) {
                return const Center(
                    child: CircularProgressIndicator(color: kPrimaryColor));
              }
              if (_pc.purchases.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text('Закупок пока нет',
                        style: TextStyle(fontSize: 13, color: kTextMuted)),
                  ),
                );
              }
              return ListView.separated(
                itemCount: _pc.purchases.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: kBorderColor),
                itemBuilder: (_, i) => _purchaseRow(_pc.purchases[i]),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _purchaseRow(PurchaseModel p) {
    final f = NumberFormat.decimalPattern();
    final fmt = DateFormat('dd.MM HH:mm');
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
            child: const Icon(Icons.local_shipping_outlined,
                size: 18, color: Color(0xFFD97706)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(p.number,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: kTextPrimary)),
                Text(
                  '${fmt.format(p.date)} · ${p.items.length} поз. · ${p.supplier.name.isEmpty ? '—' : p.supplier.name}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, color: kTextHint),
                ),
              ],
            ),
          ),
          Text('${f.format(p.total)} ${p.currency}',
              style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: kPrimaryColor)),
        ],
      ),
    );
  }
}
