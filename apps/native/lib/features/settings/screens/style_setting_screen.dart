import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/theme/theme_provider.dart';

class StyleSettingScreen extends StatefulWidget {
  const StyleSettingScreen({super.key});

  @override
  State<StyleSettingScreen> createState() => _StyleSettingScreenState();
}

class _StyleSettingScreenState extends State<StyleSettingScreen> {
  final _themeProvider = ThemeProvider.instance;

  @override
  void initState() {
    super.initState();
    _themeProvider.addListener(_rebuild);
  }

  @override
  void dispose() {
    _themeProvider.removeListener(_rebuild);
    super.dispose();
  }

  void _rebuild() => setState(() {});

  @override
  Widget build(BuildContext context) {
    final current = _themeProvider.mode;

    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: AppBar(
        backgroundColor: context.colors.surface,
        title: Text(
          'Style',
          style: AppTextStyles.titleMedium.copyWith(
            color: context.colors.textPrimary,
          ),
        ),
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios,
            color: context.colors.textSecondary,
            size: 20,
          ),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
            child: Text(
              'Theme',
              style: AppTextStyles.caption.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
          ),
          _ThemeOption(
            label: 'System Default',
            description: 'Follow OS setting (auto)',
            icon: Icons.brightness_auto_outlined,
            selected: current == ThemeMode.system,
            onTap: () => _themeProvider.setMode(ThemeMode.system),
          ),
          Divider(
            height: 1,
            thickness: 0.5,
            indent: 56,
            color: context.colors.border,
          ),
          _ThemeOption(
            label: 'Light',
            description: 'Always use light mode',
            icon: Icons.light_mode_outlined,
            selected: current == ThemeMode.light,
            onTap: () => _themeProvider.setMode(ThemeMode.light),
          ),
          Divider(
            height: 1,
            thickness: 0.5,
            indent: 56,
            color: context.colors.border,
          ),
          _ThemeOption(
            label: 'Dark',
            description: 'Always use dark mode',
            icon: Icons.dark_mode_outlined,
            selected: current == ThemeMode.dark,
            onTap: () => _themeProvider.setMode(ThemeMode.dark),
          ),
        ],
      ),
    );
  }
}

class _ThemeOption extends StatelessWidget {
  final String label;
  final String description;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _ThemeOption({
    required this.label,
    required this.description,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          children: [
            Icon(
              icon,
              color: selected
                  ? context.colors.primary
                  : context.colors.textSecondary,
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: selected
                          ? context.colors.primary
                          : context.colors.textPrimary,
                      fontWeight: selected
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (selected)
              Icon(Icons.check_circle, color: context.colors.primary, size: 20),
          ],
        ),
      ),
    );
  }
}
