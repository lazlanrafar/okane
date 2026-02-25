import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/env.dart';
import 'core/network/api_client.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/router/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Load .env first — everything else reads from it
  await dotenv.load(fileName: 'assets/.env');

  // 2. Initialize ApiClient (wires Dio + decrypt interceptor)
  await ApiClient.instance.init();

  // 3. Initialize Supabase
  await Supabase.initialize(url: Env.supabaseUrl, anonKey: Env.supabaseAnonKey);

  runApp(const OkaneApp());
}

class OkaneApp extends StatefulWidget {
  const OkaneApp({super.key});

  @override
  State<OkaneApp> createState() => _OkaneAppState();
}

class _OkaneAppState extends State<OkaneApp> {
  final _themeProvider = ThemeProvider.instance;

  @override
  void initState() {
    super.initState();
    _themeProvider.addListener(_onThemeChanged);
  }

  @override
  void dispose() {
    _themeProvider.removeListener(_onThemeChanged);
    super.dispose();
  }

  void _onThemeChanged() => setState(() {});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Okane',
      debugShowCheckedModeBanner: false,
      themeMode: _themeProvider.mode,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      routerConfig: appRouter,
    );
  }
}
