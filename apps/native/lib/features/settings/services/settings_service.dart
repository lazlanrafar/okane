import '../../../core/network/api_client.dart';
import '../models/transaction_settings_model.dart';

class SettingsService {
  static Future<TransactionSettingsModel?> getTransactionSettings() async {
    try {
      final response = await ApiClient.instance.dio.get(
        '/settings/transaction',
      );

      final dynamic responseData = response.data;
      if (responseData == null) return null;

      // Extract from the generic ApiResponse structure
      final data = responseData is Map
          ? (responseData['data'] ?? responseData)
          : responseData;

      if (data is Map<String, dynamic>) {
        return TransactionSettingsModel.fromJson(data);
      }
      return null;
    } catch (e) {
      print('[SettingsService] Failed to fetch transaction settings: $e');
      return null;
    }
  }

  static Future<bool> updateTransactionSettings(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await ApiClient.instance.dio.patch(
        '/settings/transaction',
        data: data,
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('[SettingsService] Failed to update transaction settings: $e');
      return false;
    }
  }
}
