import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/transaction_model.dart';
import 'envelope.dart';

class FinanceRepository {
  FinanceRepository(this._dio);
  final Dio _dio;

  String _basePath(String kind) =>
      kind == 'income' ? kPathIncome : kPathExpenses;
  String _summaryPath(String kind) =>
      kind == 'income' ? kPathIncomeSummary : kPathExpensesSummary;

  Future<List<TransactionModel>> list(String kind) async {
    final res = await _dio.get(_basePath(kind));
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => TransactionModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<FinanceSummary> summary(String kind) async {
    final res = await _dio.get(_summaryPath(kind));
    return FinanceSummary.fromJson(unwrapEnvelope(res.data));
  }

  Future<TransactionModel> create(String kind, TransactionModel t) async {
    final res = await _dio.post(_basePath(kind), data: t.toCreateJson());
    return TransactionModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<void> remove(String kind, String id) async {
    final path = kind == 'income' ? pathIncomeById(id) : pathExpenseById(id);
    await _dio.delete(path);
  }
}
