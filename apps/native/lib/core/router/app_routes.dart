abstract class AppRoutes {
  static const login = '/login';
  static const register = '/register';
  static const forgotPassword = '/forgot-password';
  static const dashboard = '/dashboard';
  static const settingsTransaction = '/settings/transaction';
  static const settingsCategoriesIncome = '/settings/categories/income';
  static const settingsCategoriesExpense = '/settings/categories/expense';
  // Dynamic: /settings/categories/{type}/{id}/edit
  static String categoryEdit(String type, String id) =>
      '/settings/categories/$type/$id/edit';

  static const authRoutes = [login, register, forgotPassword];
}
