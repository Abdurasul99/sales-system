import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/category_model.dart';
import 'package:sales_system/viewmodel/repository/category_repository.dart';

class CategoriesController extends GetxController {
  CategoriesController({required CategoryRepository repository})
      : _repo = repository;

  final CategoryRepository _repo;

  final categories = <CategoryModel>[].obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      categories.value = await _repo.list();
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

  Future<bool> save(CategoryModel draft, {String? editingId}) async {
    isSaving.value = true;
    errorMessage.value = null;
    try {
      if (editingId == null || editingId.isEmpty) {
        final created = await _repo.create(draft);
        categories.add(created);
      } else {
        final updated = await _repo.update(editingId, draft);
        final i = categories.indexWhere((c) => c.id == editingId);
        if (i != -1) categories[i] = updated;
      }
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

  Future<bool> remove(CategoryModel c) async {
    try {
      await _repo.remove(c.id);
      categories.removeWhere((it) => it.id == c.id);
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
