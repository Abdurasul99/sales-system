import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/model/sale_model.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';
import 'package:sales_system/viewmodel/controller/sales_controller.dart';

class TabSales extends StatefulWidget {
  const TabSales({super.key});

  @override
  State<TabSales> createState() => _TabSalesState();
}

class _TabSalesState extends State<TabSales> {
  SalesController get _sales => Get.find<SalesController>();
  ProductsController get _products => Get.find<ProductsController>();

  @override
  void initState() {
    super.initState();
    _sales.fetch();
    if (_products.products.isEmpty) _products.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: LayoutBuilder(
        builder: (ctx, c) {
          final isWide = c.maxWidth > 980;
          if (!isWide) {
            return Column(
              children: [
                _summaryRow(),
                const SizedBox(height: 16),
                Expanded(child: _salesList()),
              ],
            );
          }
          return Column(
            children: [
              _summaryRow(),
              const SizedBox(height: 16),
              Expanded(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(flex: 5, child: _newSaleCard()),
                    const SizedBox(width: 16),
                    Expanded(flex: 4, child: _salesList()),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ---------- Summary cards ----------

  Widget _summaryRow() {
    return Obx(() {
      final s = _sales.summary.value;
      final f = NumberFormat.decimalPattern();
      return Wrap(
        spacing: 12,
        runSpacing: 12,
        children: [
          _statCard('Продаж', '${s.count}',
              Icons.receipt_long_rounded, kPrimaryColor),
          _statCard('Выручка', '${f.format(s.totalRevenue)} UZS',
              Icons.payments_rounded, kPrimaryColor),
          _statCard('Себестоимость', '${f.format(s.totalCost)} UZS',
              Icons.savings_outlined, kTextSecondary),
          _statCard('Прибыль', '${f.format(s.totalProfit)} UZS',
              Icons.trending_up_rounded, kSuccessColor),
          _statCard('Маржа', '${s.marginPct.toStringAsFixed(1)}%',
              Icons.percent_rounded, kIndigoColor),
          _statCard('Средний чек', '${f.format(s.averageCheck.toInt())} UZS',
              Icons.shopping_cart_rounded, kIndigoColor),
        ],
      );
    });
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return SizedBox(
      width: 220,
      child: _statCardInner(label, value, icon, color),
    );
  }

  Widget _statCardInner(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
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
                const SizedBox(height: 2),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: kTextPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ---------- Left: New sale (POS) ----------

  Widget _newSaleCard() {
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
                  child: Text(
                    'Новая продажа',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: kTextPrimary,
                    ),
                  ),
                ),
                Obx(() => _sales.cart.isEmpty
                    ? const SizedBox.shrink()
                    : TextButton.icon(
                        onPressed: _sales.clearCart,
                        icon: const Icon(Icons.refresh, size: 16),
                        label: const Text('Очистить'),
                        style: TextButton.styleFrom(foregroundColor: kTextMuted),
                      )),
              ],
            ),
          ),
          const Divider(height: 1, color: kBorderColor),
          Padding(
            padding: const EdgeInsets.all(16),
            child: _productPicker(),
          ),
          const Divider(height: 1, color: kBorderColor),
          Expanded(child: _cartList()),
          const Divider(height: 1, color: kBorderColor),
          Padding(
            padding: const EdgeInsets.all(16),
            child: _checkoutPanel(),
          ),
        ],
      ),
    );
  }

  Widget _productPicker() {
    return Obx(() {
      final products = _products.products
          .where((p) => p.isActive && p.stock > 0)
          .toList();
      if (products.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 12),
          child: Text(
            'Нет товаров в наличии',
            style: TextStyle(fontSize: 13, color: kTextMuted),
          ),
        );
      }
      return DropdownButtonFormField<String>(
        decoration: InputDecoration(
          hintText: 'Добавить товар в чек',
          prefixIcon: const Icon(Icons.add_shopping_cart_rounded,
              size: 18, color: kTextMuted),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        items: products
            .map((p) => DropdownMenuItem<String>(
                  value: p.id,
                  child: _productItemRow(p),
                ))
            .toList(),
        onChanged: (id) {
          if (id == null) return;
          final p = products.firstWhere((it) => it.id == id);
          _sales.addToCart(p);
        },
      );
    });
  }

  Widget _productItemRow(ProductModel p) {
    final f = NumberFormat.decimalPattern();
    return Row(
      children: [
        Expanded(child: Text(p.name, overflow: TextOverflow.ellipsis)),
        const SizedBox(width: 8),
        Text(
          '${f.format(p.price)} ${p.currency}',
          style: const TextStyle(
            fontSize: 12,
            color: kPrimaryColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _cartList() {
    return Obx(() {
      if (_sales.cart.isEmpty) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 32),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shopping_cart_outlined,
                    size: 36, color: kTextHint.withValues(alpha: 0.7)),
                const SizedBox(height: 8),
                const Text(
                  'Корзина пуста',
                  style: TextStyle(fontSize: 13, color: kTextMuted),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Выберите товар выше',
                  style: TextStyle(fontSize: 11, color: kTextHint),
                ),
              ],
            ),
          ),
        );
      }
      return ListView.separated(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _sales.cart.length,
        separatorBuilder: (_, __) => const Divider(height: 16, color: kBorderColor),
        itemBuilder: (_, i) => _cartItem(_sales.cart[i]),
      );
    });
  }

  Widget _cartItem(SaleItemModel it) {
    final f = NumberFormat.decimalPattern();
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                it.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: kTextPrimary,
                ),
              ),
              Text(
                '${f.format(it.price)} × ${it.quantity}',
                style: const TextStyle(fontSize: 11, color: kTextHint),
              ),
            ],
          ),
        ),
        _qtyButton(Icons.remove,
            onTap: () => _sales.updateCartQuantity(it.productId, it.quantity - 1)),
        SizedBox(
          width: 28,
          child: Text(
            '${it.quantity}',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: kTextPrimary,
            ),
          ),
        ),
        _qtyButton(Icons.add,
            onTap: () => _sales.updateCartQuantity(it.productId, it.quantity + 1)),
        const SizedBox(width: 12),
        SizedBox(
          width: 90,
          child: Text(
            f.format(it.total),
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: kPrimaryColor,
            ),
          ),
        ),
        IconButton(
          iconSize: 16,
          splashRadius: 16,
          onPressed: () => _sales.removeFromCart(it.productId),
          icon: const Icon(Icons.close_rounded, color: kTextHint),
        ),
      ],
    );
  }

  Widget _qtyButton(IconData icon, {required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          color: kGray100,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Icon(icon, size: 14, color: kTextSecondary),
      ),
    );
  }

  Widget _checkoutPanel() {
    return Obx(() {
      final f = NumberFormat.decimalPattern();
      final canCheckout = _sales.cart.isNotEmpty && !_sales.isSaving.value;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Customer + payment
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Клиент (необязательно)',
                    prefixIcon: const Icon(Icons.person_outline,
                        size: 18, color: kTextMuted),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10)),
                    isDense: true,
                  ),
                  onChanged: (v) => _sales.customerName.value = v,
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                width: 160,
                child: DropdownButtonFormField<String>(
                  initialValue: _sales.paymentMethod.value,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10)),
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'cash', child: Text('Наличные')),
                    DropdownMenuItem(value: 'card', child: Text('Карта')),
                    DropdownMenuItem(value: 'transfer', child: Text('Перевод')),
                  ],
                  onChanged: (v) {
                    if (v != null) _sales.paymentMethod.value = v;
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _row('Подытог', '${f.format(_sales.cartSubtotal)} UZS'),
          const SizedBox(height: 6),
          _row('Себестоимость', '${f.format(_sales.cartCogs)} UZS',
              color: kTextSecondary),
          if (_sales.discount.value > 0) ...[
            const SizedBox(height: 6),
            _row('Скидка', '−${f.format(_sales.discount.value)} UZS',
                color: kErrorColor),
          ],
          const SizedBox(height: 8),
          const Divider(color: kBorderColor),
          const SizedBox(height: 8),
          _row(
            'К оплате',
            '${f.format(_sales.cartTotal)} UZS',
            big: true,
            color: kPrimaryColor,
          ),
          const SizedBox(height: 6),
          _row(
            'Прибыль',
            '${f.format(_sales.cartProfit)} UZS · ${_sales.cartMarginPct.toStringAsFixed(1)}%',
            color: _sales.cartProfit >= 0 ? kSuccessColor : kErrorColor,
          ),
          const SizedBox(height: 12),
          if (_sales.errorMessage.value != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                _sales.errorMessage.value!,
                style: const TextStyle(fontSize: 12, color: kErrorColor),
              ),
            ),
          SizedBox(
            height: 44,
            child: FilledButton.icon(
              onPressed: canCheckout ? _checkout : null,
              style: FilledButton.styleFrom(
                backgroundColor: kPrimaryColor,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              icon: _sales.isSaving.value
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.check_rounded),
              label: Text(
                _sales.isSaving.value ? 'Проводим...' : 'Провести продажу',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      );
    });
  }

  Widget _row(String label, String value, {bool big = false, Color? color}) {
    return Row(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: big ? 14 : 13,
            color: kTextMuted,
            fontWeight: big ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: TextStyle(
            fontSize: big ? 18 : 13,
            color: color ?? kTextPrimary,
            fontWeight: big ? FontWeight.w700 : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Future<void> _checkout() async {
    final sale = await _sales.checkout();
    if (sale != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: kSuccessColor,
          behavior: SnackBarBehavior.floating,
          content: Text('Продажа ${sale.number} оформлена'),
        ),
      );
      // refresh products to reflect new stock
      _products.fetch();
    }
  }

  // ---------- Right: Sales list ----------

  Widget _salesList() {
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
                  child: Text(
                    'История продаж',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: kTextPrimary,
                    ),
                  ),
                ),
                IconButton(
                  iconSize: 18,
                  splashRadius: 16,
                  onPressed: _sales.fetch,
                  icon: const Icon(Icons.refresh, color: kTextMuted),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: kBorderColor),
          Expanded(
            child: Obx(() {
              if (_sales.isLoading.value && _sales.sales.isEmpty) {
                return const Center(
                    child: CircularProgressIndicator(color: kPrimaryColor));
              }
              if (_sales.sales.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text(
                      'Продаж пока нет',
                      style: TextStyle(fontSize: 13, color: kTextMuted),
                    ),
                  ),
                );
              }
              return ListView.separated(
                itemCount: _sales.sales.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: kBorderColor),
                itemBuilder: (_, i) => _saleRow(_sales.sales[i]),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _saleRow(SaleModel s) {
    final f = NumberFormat.decimalPattern();
    final timeFmt = DateFormat('dd.MM HH:mm');
    final isVoided = s.status == 'voided';
    return InkWell(
      onTap: () => _showSaleDetail(s),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: isVoided
                    ? kErrorColor.withValues(alpha: 0.1)
                    : kPrimaryColorLight,
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: Icon(
                isVoided
                    ? Icons.cancel_outlined
                    : Icons.receipt_long_rounded,
                size: 18,
                color: isVoided ? kErrorColor : kPrimaryColor,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    s.number,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isVoided ? kTextMuted : kTextPrimary,
                      decoration: isVoided ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${timeFmt.format(s.date)} · ${s.items.length} поз.',
                    style: const TextStyle(fontSize: 11, color: kTextHint),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '${f.format(s.total)} ${s.currency}',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isVoided ? kTextHint : kPrimaryColor,
                  ),
                ),
                if (!isVoided && s.totalProfit > 0)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(
                      '+${f.format(s.totalProfit)} · ${s.marginPct.toStringAsFixed(0)}%',
                      style: const TextStyle(
                        fontSize: 11,
                        color: kSuccessColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showSaleDetail(SaleModel s) {
    final f = NumberFormat.decimalPattern();
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(s.number),
        content: SizedBox(
          width: 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Статус: ${s.status == 'completed' ? 'Завершена' : 'Аннулирована'}',
                style: const TextStyle(fontSize: 12, color: kTextMuted),
              ),
              const SizedBox(height: 12),
              for (final it in s.items)
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Expanded(child: Text(it.name)),
                      Text('× ${it.quantity}',
                          style: const TextStyle(color: kTextMuted)),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 90,
                        child: Text(
                          f.format(it.total),
                          textAlign: TextAlign.right,
                          style:
                              const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              const Divider(),
              Row(
                children: [
                  const Text('Выручка',
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Text('${f.format(s.total)} ${s.currency}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: kPrimaryColor)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Text('Себестоимость',
                      style: TextStyle(color: kTextSecondary)),
                  const Spacer(),
                  Text('${f.format(s.totalCost)} ${s.currency}',
                      style: const TextStyle(color: kTextSecondary)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Text('Прибыль',
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  const Spacer(),
                  Text(
                    '${f.format(s.totalProfit)} ${s.currency}  ·  ${s.marginPct.toStringAsFixed(1)}%',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: s.totalProfit >= 0 ? kSuccessColor : kErrorColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        actions: [
          if (s.status == 'completed')
            TextButton(
              onPressed: () async {
                Get.back();
                await _sales.voidSale(s);
                _products.fetch();
              },
              style: TextButton.styleFrom(foregroundColor: kErrorColor),
              child: const Text('Аннулировать'),
            ),
          FilledButton(
            onPressed: Get.back,
            style: FilledButton.styleFrom(backgroundColor: kPrimaryColor),
            child: const Text('Закрыть'),
          ),
        ],
      ),
    );
  }
}
