import 'package:dio/dio.dart';

import 'package:sales_system/model/sale_model.dart';
import 'api_endpoints.dart';
import 'envelope.dart';

class SaleRepository {
  SaleRepository(this._dio);
  final Dio _dio;

  Future<List<SaleModel>> list({
    DateTime? from,
    DateTime? to,
    String? status,
    String? q,
  }) async {
    final res = await _dio.get(
      ApiEndpoints.sales,
      queryParameters: {
        if (from != null) 'from': from.toIso8601String(),
        if (to != null) 'to': to.toIso8601String(),
        if (status != null) 'status': status,
        if (q != null && q.isNotEmpty) 'q': q,
      },
    );
    final body = unwrapEnvelope(res.data);
    final items = (body['items'] as List? ?? const []);
    return items
        .map((e) => SaleModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<SaleModel> getById(String id) async {
    final res = await _dio.get(ApiEndpoints.saleById(id));
    return SaleModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<SaleModel> create({
    required List<SaleItemModel> items,
    num discount = 0,
    num tax = 0,
    String paymentMethod = 'cash',
    SaleCustomer customer = const SaleCustomer(),
    String notes = '',
    String currency = 'UZS',
  }) async {
    final res = await _dio.post(ApiEndpoints.sales, data: {
      'items': items.map((it) => it.toCreateJson()).toList(),
      'discount': discount,
      'tax': tax,
      'paymentMethod': paymentMethod,
      'customer': customer.toJson(),
      'notes': notes,
      'currency': currency,
    });
    return SaleModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<SaleModel> voidSale(String id) async {
    final res = await _dio.post(ApiEndpoints.saleVoid(id));
    return SaleModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<SaleSummary> summary({DateTime? from, DateTime? to}) async {
    final res = await _dio.get(
      ApiEndpoints.salesSummary,
      queryParameters: {
        if (from != null) 'from': from.toIso8601String(),
        if (to != null) 'to': to.toIso8601String(),
      },
    );
    return SaleSummary.fromJson(unwrapEnvelope(res.data));
  }
}
