import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/model/sale_model.dart';
import 'package:sales_system/viewmodel/repository/sale_repository.dart';

class SalesController extends GetxController {
  SalesController({required SaleRepository repository}) : _repo = repository;

  final SaleRepository _repo;

  // History
  final sales = <SaleModel>[].obs;
  final isLoading = false.obs;
  final errorMessage = RxnString();
  final summary = SaleSummary.empty.obs;

  // POS / new sale state
  final cart = <SaleItemModel>[].obs;
  final paymentMethod = 'cash'.obs;
  final customerName = ''.obs;
  final customerPhone = ''.obs;
  final notes = ''.obs;
  final discount = (0 as num).obs;
  final isSaving = false.obs;

  num get cartSubtotal =>
      cart.fold<num>(0, (sum, it) => sum + it.total);
  num get cartCogs =>
      cart.fold<num>(0, (sum, it) => sum + it.cogs);
  num get cartTotal {
    final subtotal = cartSubtotal;
    return (subtotal - discount.value).clamp(0, double.infinity);
  }
  num get cartProfit => cartTotal - cartCogs;
  num get cartMarginPct =>
      cartTotal > 0 ? (cartProfit / cartTotal) * 100 : 0;

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final results = await Future.wait([
        _repo.list(),
        _repo.summary(),
      ]);
      sales.value = results[0] as List<SaleModel>;
      summary.value = results[1] as SaleSummary;
      return true;
    } on DioException catch (e) {
      errorMessage.value = _readError(e);
      return false;
    } catch (e) {
      errorMessage.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  void addToCart(ProductModel product, {num quantity = 1}) {
    final i = cart.indexWhere((it) => it.productId == product.id);
    if (i == -1) {
      cart.add(SaleItemModel(
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        quantity: quantity,
        total: product.price * quantity,
        cogs: product.cost * quantity,
        profit: (product.price - product.cost) * quantity,
      ));
    } else {
      final existing = cart[i];
      final newQty = existing.quantity + quantity;
      cart[i] = SaleItemModel(
        productId: existing.productId,
        name: existing.name,
        sku: existing.sku,
        price: existing.price,
        cost: existing.cost,
        quantity: newQty,
        total: existing.price * newQty,
        cogs: existing.cost * newQty,
        profit: (existing.price - existing.cost) * newQty,
      );
    }
  }

  void updateCartQuantity(String productId, num quantity) {
    final i = cart.indexWhere((it) => it.productId == productId);
    if (i == -1) return;
    if (quantity <= 0) {
      cart.removeAt(i);
      return;
    }
    final it = cart[i];
    cart[i] = SaleItemModel(
      productId: it.productId,
      name: it.name,
      sku: it.sku,
      price: it.price,
      cost: it.cost,
      quantity: quantity,
      total: it.price * quantity,
      cogs: it.cost * quantity,
      profit: (it.price - it.cost) * quantity,
    );
  }

  void removeFromCart(String productId) {
    cart.removeWhere((it) => it.productId == productId);
  }

  void clearCart() {
    cart.clear();
    discount.value = 0;
    customerName.value = '';
    customerPhone.value = '';
    notes.value = '';
    paymentMethod.value = 'cash';
  }

  Future<SaleModel?> checkout() async {
    if (cart.isEmpty) {
      errorMessage.value = 'Корзина пуста';
      return null;
    }
    isSaving.value = true;
    errorMessage.value = null;
    try {
      final created = await _repo.create(
        items: cart.toList(),
        discount: discount.value,
        paymentMethod: paymentMethod.value,
        customer: SaleCustomer(
          name: customerName.value.trim(),
          phone: customerPhone.value.trim(),
        ),
        notes: notes.value.trim(),
      );
      sales.insert(0, created);
      clearCart();
      return created;
    } on DioException catch (e) {
      errorMessage.value = _readError(e);
      return null;
    } catch (e) {
      errorMessage.value = e.toString();
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> voidSale(SaleModel sale) async {
    try {
      final updated = await _repo.voidSale(sale.id);
      final i = sales.indexWhere((s) => s.id == sale.id);
      if (i != -1) sales[i] = updated;
      return true;
    } on DioException catch (e) {
      errorMessage.value = _readError(e);
      return false;
    }
  }

  String _readError(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) return data['message'].toString();
    return e.message ?? 'Network error';
  }
}
