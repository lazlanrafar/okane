import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../network/api_client.dart';
import 'app_routes.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';

import '../../features/settings/screens/transaction_settings_screen.dart';
import '../../features/settings/screens/category_settings_screen.dart';
import '../../features/settings/screens/category_form_screen.dart';
import '../../features/settings/screens/style_setting_screen.dart';
import '../../features/settings/models/category_model.dart';

final appRouter = GoRouter(
  initialLocation: AppRoutes.login,
  redirect: _globalRedirect,
  routes: [
    GoRoute(
      path: AppRoutes.login,
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: AppRoutes.register,
      name: 'register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: AppRoutes.forgotPassword,
      name: 'forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: AppRoutes.dashboard,
      name: 'dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: AppRoutes.settingsTransaction,
      name: 'settings-transaction',
      builder: (context, state) => const TransactionSettingsScreen(),
    ),
    GoRoute(
      path: AppRoutes.settingsCategoriesIncome,
      name: 'settings-categories-income',
      builder: (context, state) => const CategorySettingsScreen(type: 'income'),
    ),
    GoRoute(
      path: AppRoutes.settingsCategoriesExpense,
      name: 'settings-categories-expense',
      builder: (context, state) =>
          const CategorySettingsScreen(type: 'expense'),
    ),
    GoRoute(
      path: '/settings/style',
      name: 'settings-style',
      builder: (context, state) => const StyleSettingScreen(),
    ),
    // Create new category form (no existing category in extra)
    GoRoute(
      path: '/settings/categories/:type/form',
      name: 'category-create',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        return CategoryFormScreen(type: extra['type'] as String);
      },
    ),
    // Edit existing category form
    GoRoute(
      path: '/settings/categories/:type/:id/form',
      name: 'category-form',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>;
        return CategoryFormScreen(
          type: extra['type'] as String,
          category: extra['category'] as CategoryModel?,
        );
      },
    ),
  ],
);

/// Global redirect guard:
///   - Has app JWT → dashboard (if attempting an auth route)
///   - No JWT      → login
Future<String?> _globalRedirect(
  BuildContext context,
  GoRouterState state,
) async {
  final token = await ApiClient.instance.getToken();
  final isAuthRoute = AppRoutes.authRoutes.contains(state.matchedLocation);

  if (token != null && isAuthRoute) return AppRoutes.dashboard;
  if (token == null && !isAuthRoute) return AppRoutes.login;
  return null;
}
