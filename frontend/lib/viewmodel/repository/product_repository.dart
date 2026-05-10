import 'package:dio/dio.dart';

import 'package:sales_system/model/product_model.dart';
import 'api_endpoints.dart';
import 'envelope.dart';

class ProductRepository {
  ProductRepository(this._dio);

  final Dio _dio;

  Future<List<ProductModel>> list({String? q, String? category}) async {
    final res = await _dio.get(
      ApiEndpoints.products,
      queryParameters: {
        if (q != null && q.isNotEmpty) 'q': q,
        if (category != null && category.isNotEmpty) 'category': category,
      },
    );
    final body = unwrapEnvelope(res.data);
    final items = (body['items'] as List? ?? const []);
    return items
        .map((e) => ProductModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<ProductModel> getById(String id) async {
    final res = await _dio.get(ApiEndpoints.productById(id));
    return ProductModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<ProductModel> create(ProductModel product) async {
    final res = await _dio.post(ApiEndpoints.products, data: product.toCreateJson());
    return ProductModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<ProductModel> update(String id, ProductModel product) async {
    final res = await _dio.put(
      ApiEndpoints.productById(id),
      data: product.toCreateJson(),
    );
    return ProductModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<void> remove(String id) async {
    await _dio.delete(ApiEndpoints.productById(id));
  }
}
