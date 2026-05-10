import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/purchase_model.dart';
import 'envelope.dart';

class PurchaseRepository {
  PurchaseRepository(this._dio);
  final Dio _dio;

  Future<List<PurchaseModel>> list() async {
    final res = await _dio.get(kPathPurchases);
    final body = unwrapEnvelope(res.data);
    return ((body['items'] as List?) ?? const [])
        .map((e) => PurchaseModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<PurchaseModel> create({
    String? supplierId,
    required List<PurchaseItem> items,
    String paymentMethod = 'transfer',
    String notes = '',
    String currency = 'UZS',
  }) async {
    final res = await _dio.post(kPathPurchases, data: {
      if (supplierId != null && supplierId.isNotEmpty) 'supplierId': supplierId,
      'items': items.map((it) => it.toCreateJson()).toList(),
      'paymentMethod': paymentMethod,
      'notes': notes,
      'currency': currency,
    });
    return PurchaseModel.fromJson(unwrapEnvelope(res.data));
  }
}
