import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/model/purchase_model.dart';
import 'package:sales_system/viewmodel/repository/purchase_repository.dart';

class PurchasesController extends GetxController {
  PurchasesController({required PurchaseRepository repository})
      : _repo = repository;
  final PurchaseRepository _repo;

  final purchases = <PurchaseModel>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();

  // Receive form
  final cart = <PurchaseItem>[].obs;
  final supplierId = ''.obs;
  final paymentMethod = 'transfer'.obs;
  final notes = ''.obs;

  num get cartTotal => cart.fold<num>(0, (s, it) => s + it.total);

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      purchases.value = await _repo.list();
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  void addItem(ProductModel p, {num quantity = 1, num? cost}) {
    final c = cost ?? p.price;
    final i = cart.indexWhere((x) => x.productId == p.id);
    if (i == -1) {
      cart.add(PurchaseItem(
        productId: p.id,
        name: p.name,
        sku: p.sku,
        cost: c,
        quantity: quantity,
        total: c * quantity,
      ));
    } else {
      final ex = cart[i];
      final newQty = ex.quantity + quantity;
      cart[i] = PurchaseItem(
        productId: ex.productId,
        name: ex.name,
        sku: ex.sku,
        cost: ex.cost,
        quantity: newQty,
        total: ex.cost * newQty,
      );
    }
  }

  void updateQty(String productId, num quantity) {
    final i = cart.indexWhere((x) => x.productId == productId);
    if (i == -1) return;
    if (quantity <= 0) {
      cart.removeAt(i);
      return;
    }
    final ex = cart[i];
    cart[i] = PurchaseItem(
      productId: ex.productId,
      name: ex.name,
      sku: ex.sku,
      cost: ex.cost,
      quantity: quantity,
      total: ex.cost * quantity,
    );
  }

  void removeItem(String productId) {
    cart.removeWhere((x) => x.productId == productId);
  }

  void clear() {
    cart.clear();
    supplierId.value = '';
    paymentMethod.value = 'transfer';
    notes.value = '';
  }

  Future<PurchaseModel?> commit() async {
    if (cart.isEmpty) {
      errorMessage.value = 'Добавьте хотя бы одну позицию';
      return null;
    }
    isSaving.value = true;
    errorMessage.value = null;
    try {
      final created = await _repo.create(
        supplierId: supplierId.value.isEmpty ? null : supplierId.value,
        items: cart.toList(),
        paymentMethod: paymentMethod.value,
        notes: notes.value,
      );
      purchases.insert(0, created);
      clear();
      return created;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  String _err(DioException e) {
    final d = e.response?.data;
    if (d is Map && d['message'] != null) return d['message'].toString();
    return e.message ?? 'Network error';
  }
}
