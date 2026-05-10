import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/customer_model.dart';
import 'envelope.dart';

class CustomerRepository {
  CustomerRepository(this._dio);
  final Dio _dio;

  Future<List<CustomerModel>> list({String? q}) async {
    final res = await _dio.get(kPathCustomers,
        queryParameters: {if (q != null && q.isNotEmpty) 'q': q});
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => CustomerModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<CustomerModel> create(CustomerModel c) async {
    final res = await _dio.post(kPathCustomers, data: c.toCreateJson());
    return CustomerModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<CustomerModel> update(String id, CustomerModel c) async {
    final res = await _dio.put(pathCustomerById(id), data: c.toCreateJson());
    return CustomerModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<void> remove(String id) async {
    await _dio.delete(pathCustomerById(id));
  }
}
