import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/supplier_model.dart';
import 'package:sales_system/viewmodel/repository/supplier_repository.dart';

class SuppliersController extends GetxController {
  SuppliersController({required SupplierRepository repository})
      : _repo = repository;
  final SupplierRepository _repo;

  final suppliers = <SupplierModel>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();
  final search = ''.obs;

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      suppliers.value = await _repo.list(q: search.value);
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  void onSearch(String v) {
    search.value = v;
  }

  Future<bool> save(SupplierModel draft, {String? editingId}) async {
    isSaving.value = true;
    errorMessage.value = null;
    try {
      if (editingId == null || editingId.isEmpty) {
        suppliers.insert(0, await _repo.create(draft));
      } else {
        final updated = await _repo.update(editingId, draft);
        final i = suppliers.indexWhere((s) => s.id == editingId);
        if (i != -1) suppliers[i] = updated;
      }
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> remove(SupplierModel s) async {
    try {
      await _repo.remove(s.id);
      suppliers.removeWhere((it) => it.id == s.id);
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    }
  }

  String _err(DioException e) {
    final d = e.response?.data;
    if (d is Map && d['message'] != null) return d['message'].toString();
    return e.message ?? 'Network error';
  }
}
