import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/supplier_model.dart';
import 'envelope.dart';

class SupplierRepository {
  SupplierRepository(this._dio);
  final Dio _dio;

  Future<List<SupplierModel>> list({String? q}) async {
    final res = await _dio.get(kPathSuppliers,
        queryParameters: {if (q != null && q.isNotEmpty) 'q': q});
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => SupplierModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<SupplierModel> create(SupplierModel s) async {
    final res = await _dio.post(kPathSuppliers, data: s.toCreateJson());
    return SupplierModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<SupplierModel> update(String id, SupplierModel s) async {
    final res = await _dio.put(pathSupplierById(id), data: s.toCreateJson());
    return SupplierModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<void> remove(String id) async {
    await _dio.delete(pathSupplierById(id));
  }
}
