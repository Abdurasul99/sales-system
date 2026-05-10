import 'package:dio/dio.dart';

import 'package:sales_system/model/category_model.dart';
import 'api_endpoints.dart';
import 'envelope.dart';

class CategoryRepository {
  CategoryRepository(this._dio);
  final Dio _dio;

  Future<List<CategoryModel>> list() async {
    final res = await _dio.get(ApiEndpoints.categories);
    final body = unwrapEnvelope(res.data);
    final items = (body['items'] as List? ?? const []);
    return items
        .map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<CategoryModel> create(CategoryModel category) async {
    final res = await _dio.post(
      ApiEndpoints.categories,
      data: category.toCreateJson(),
    );
    return CategoryModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<CategoryModel> update(String id, CategoryModel category) async {
    final res = await _dio.put(
      ApiEndpoints.categoryById(id),
      data: category.toCreateJson(),
    );
    return CategoryModel.fromJson(unwrapEnvelope(res.data));
  }

  Future<void> remove(String id) async {
    await _dio.delete(ApiEndpoints.categoryById(id));
  }
}
