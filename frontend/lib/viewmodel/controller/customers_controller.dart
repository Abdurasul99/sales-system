import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/customer_model.dart';
import 'package:sales_system/viewmodel/repository/customer_repository.dart';

class CustomersController extends GetxController {
  CustomersController({required CustomerRepository repository})
      : _repo = repository;
  final CustomerRepository _repo;

  final customers = <CustomerModel>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();
  final search = ''.obs;

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      customers.value = await _repo.list(q: search.value);
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

  Future<bool> save(CustomerModel draft, {String? editingId}) async {
    isSaving.value = true;
    errorMessage.value = null;
    try {
      if (editingId == null || editingId.isEmpty) {
        customers.insert(0, await _repo.create(draft));
      } else {
        final updated = await _repo.update(editingId, draft);
        final i = customers.indexWhere((c) => c.id == editingId);
        if (i != -1) customers[i] = updated;
      }
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> remove(CustomerModel c) async {
    try {
      await _repo.remove(c.id);
      customers.removeWhere((it) => it.id == c.id);
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
