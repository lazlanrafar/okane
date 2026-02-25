import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../models/currency_model.dart';

class CurrencyService {
  static Dio get _dio => ApiClient.instance.dio;

  // ── Sub-currencies ────────────────────────────────────────────────────────

  static Future<List<SubCurrencyModel>> getSubCurrencies() async {
    final response = await _dio.get('/settings/sub-currencies');
    final dynamic raw = response.data;
    final dynamic inner = raw is Map ? (raw['data'] ?? raw) : raw;
    List<dynamic> list = [];
    if (inner is List) {
      list = inner;
    } else if (inner is Map) {
      final rows = inner['rows'];
      if (rows is List) list = rows;
    }
    return list
        .map((e) => SubCurrencyModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<void> addSubCurrency({required String currencyCode}) async {
    await _dio.post(
      '/settings/sub-currencies',
      data: {'currencyCode': currencyCode},
    );
  }

  static Future<void> deleteSubCurrency({required String id}) async {
    await _dio.delete('/settings/sub-currencies/$id');
  }

  // ── Main currency (via transaction settings PATCH) ────────────────────────

  static Future<bool> updateMainCurrency({
    required String code,
    required String symbol,
    required String symbolPosition, // 'front' | 'back'
    required int decimalPlaces,
  }) async {
    try {
      final response = await _dio.patch(
        '/settings/transaction',
        data: {
          'mainCurrencyCode': code,
          'mainCurrencySymbol': symbol,
          'mainCurrencySymbolPosition': symbolPosition,
          'mainCurrencyDecimalPlaces': decimalPlaces,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }
}
