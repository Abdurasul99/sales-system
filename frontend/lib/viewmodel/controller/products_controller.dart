import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/viewmodel/repository/product_repository.dart';
import 'package:sales_system/utils/app_routes.dart';

typedef AppNavigator = void Function(String route);
typedef PopFn = void Function();

class ProductsController extends GetxController {
  ProductsController({
    required ProductRepository repository,
    AppNavigator? navigateTo,
    PopFn? pop,
  })  : _repository = repository,
        _navigateTo = navigateTo ?? _defaultNavigate,
        _pop = pop ?? _defaultPop;

  final ProductRepository _repository;
  final AppNavigator _navigateTo;
  final PopFn _pop;

  static void _defaultNavigate(String route) {
    Get.toNamed(route);
  }

  static void _defaultPop() {
    Get.back();
  }

  final products = <ProductModel>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();
  final search = ''.obs;

  // form state
  final formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
  final skuCtrl = TextEditingController();
  final priceCtrl = TextEditingController();
  final costCtrl = TextEditingController();
  final stockCtrl = TextEditingController();
  final leadTimeCtrl = TextEditingController(text: '14');
  final unitCtrl = TextEditingController(text: 'шт');
  final categoryCtrl = TextEditingController();
  final descriptionCtrl = TextEditingController();
  final editingId = RxnString();

  @override
  void onClose() {
    nameCtrl.dispose();
    skuCtrl.dispose();
    priceCtrl.dispose();
    costCtrl.dispose();
    stockCtrl.dispose();
    leadTimeCtrl.dispose();
    unitCtrl.dispose();
    categoryCtrl.dispose();
    descriptionCtrl.dispose();
    super.onClose();
  }

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      products.value = await _repository.list(q: search.value);
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

  void onSearchChanged(String value) {
    search.value = value;
  }

  void openCreateForm() {
    _clearForm();
    editingId.value = null;
    _navigateTo(AppRoutes.productForm);
  }

  void openEditForm(ProductModel product) {
    editingId.value = product.id;
    nameCtrl.text = product.name;
    skuCtrl.text = product.sku;
    priceCtrl.text = product.price.toString();
    costCtrl.text = product.cost.toString();
    stockCtrl.text = product.stock.toString();
    leadTimeCtrl.text = product.leadTimeDays.toString();
    unitCtrl.text = product.unit;
    categoryCtrl.text = product.category;
    descriptionCtrl.text = product.description;
    _navigateTo(AppRoutes.productForm);
  }

  Future<bool> save() async {
    isSaving.value = true;
    errorMessage.value = null;
    try {
      final draft = ProductModel(
        id: editingId.value ?? '',
        name: nameCtrl.text.trim(),
        sku: skuCtrl.text.trim(),
        price: num.tryParse(priceCtrl.text) ?? 0,
        cost: num.tryParse(costCtrl.text) ?? 0,
        currency: 'UZS',
        stock: num.tryParse(stockCtrl.text) ?? 0,
        leadTimeDays: num.tryParse(leadTimeCtrl.text) ?? 14,
        unit: unitCtrl.text.trim().isEmpty ? 'шт' : unitCtrl.text.trim(),
        category: categoryCtrl.text.trim().isEmpty
            ? 'general'
            : categoryCtrl.text.trim(),
        description: descriptionCtrl.text.trim(),
      );

      if (editingId.value == null) {
        await _repository.create(draft);
      } else {
        await _repository.update(editingId.value!, draft);
      }
      await fetch();
      _pop();
      return true;
    } on DioException catch (e) {
      errorMessage.value = _readError(e);
      return false;
    } catch (e) {
      errorMessage.value = e.toString();
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> remove(ProductModel product) async {
    try {
      await _repository.remove(product.id);
      products.removeWhere((p) => p.id == product.id);
      return true;
    } on DioException catch (e) {
      errorMessage.value = _readError(e);
      return false;
    }
  }

  void _clearForm() {
    nameCtrl.clear();
    skuCtrl.clear();
    priceCtrl.clear();
    costCtrl.clear();
    stockCtrl.clear();
    leadTimeCtrl.text = '14';
    unitCtrl.text = 'шт';
    categoryCtrl.clear();
    descriptionCtrl.clear();
  }

  String _readError(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) return data['message'].toString();
    return e.message ?? 'Network error';
  }
}
