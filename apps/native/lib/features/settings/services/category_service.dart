import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../models/category_model.dart';

class CategoryService {
  static Dio get _dio => ApiClient.instance.dio;

  static Future<List<CategoryModel>> getCategories({
    required String type, // 'income' | 'expense'
  }) async {
    // ignore: avoid_print
    print('[CategoryService] getCategories type=$type');

    final response = await _dio.get(
      '/categories',
      queryParameters: {'type': type},
    );

    final dynamic responseData = response.data;
    // ignore: avoid_print
    // print('[CategoryService] raw response: $responseData');

    if (responseData == null) return [];

    // Safely handle both {data: {rows: [...]}} and {rows: [...]} shapes
    final dynamic inner = responseData is Map
        ? (responseData['data'] ?? responseData)
        : responseData;

    List<dynamic> rows = [];
    if (inner is Map) {
      final dynamic r = inner['rows'];
      if (r is List) rows = r;
    } else if (inner is List) {
      rows = inner;
    }

    return rows
        .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<CategoryModel> createCategory({
    required String name,
    required String type,
  }) async {
    final response = await _dio.post(
      '/categories',
      data: {'name': name, 'type': type},
    );
    final dynamic raw = response.data;
    final Map<String, dynamic> body =
        (raw is Map ? (raw['data'] ?? raw) : raw) as Map<String, dynamic>;
    return CategoryModel.fromJson(body);
  }

  static Future<CategoryModel> updateCategory({
    required String id,
    required String name,
  }) async {
    final response = await _dio.patch('/categories/$id', data: {'name': name});
    final dynamic raw = response.data;
    final Map<String, dynamic> body =
        (raw is Map ? (raw['data'] ?? raw) : raw) as Map<String, dynamic>;
    return CategoryModel.fromJson(body);
  }

  static Future<void> reorderCategories({
    required List<Map<String, dynamic>> updates,
  }) async {
    await _dio.put('/categories/reorder', data: {'updates': updates});
  }

  static Future<void> deleteCategory({required String id}) async {
    await _dio.delete('/categories/$id');
  }
}
