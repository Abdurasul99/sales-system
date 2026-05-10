import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/transaction_model.dart';
import 'package:sales_system/viewmodel/repository/finance_repository.dart';

class FinanceController extends GetxController {
  FinanceController({required FinanceRepository repository, required this.kind})
      : _repo = repository;
  final FinanceRepository _repo;
  final String kind; // 'expense' or 'income'

  final items = <TransactionModel>[].obs;
  final summary = FinanceSummary.empty.obs;
  final isLoading = false.obs;
  final isSaving = false.obs;
  final errorMessage = RxnString();

  Future<bool> fetch() async {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      final results = await Future.wait([
        _repo.list(kind),
        _repo.summary(kind),
      ]);
      items.value = results[0] as List<TransactionModel>;
      summary.value = results[1] as FinanceSummary;
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> save(TransactionModel t) async {
    isSaving.value = true;
    errorMessage.value = null;
    try {
      final created = await _repo.create(kind, t);
      items.insert(0, created);
      await fetch(); // refresh summary
      return true;
    } on DioException catch (e) {
      errorMessage.value = _err(e);
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  Future<bool> remove(TransactionModel t) async {
    try {
      await _repo.remove(kind, t.id);
      items.removeWhere((x) => x.id == t.id);
      await fetch();
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
