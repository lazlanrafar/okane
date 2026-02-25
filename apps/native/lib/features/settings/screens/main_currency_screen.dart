import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/currency_model.dart';
import '../services/settings_service.dart';
import '../services/currency_service.dart';

class MainCurrencyScreen extends StatefulWidget {
  const MainCurrencyScreen({super.key});

  @override
  State<MainCurrencyScreen> createState() => _MainCurrencyScreenState();
}

class _MainCurrencyScreenState extends State<MainCurrencyScreen> {
  bool _loading = true;
  bool _saving = false;

  // Working copies of main currency fields
  String _code = 'IDR';
  String _symbol = 'Rp';
  String _position = 'front'; // 'front' | 'back'
  int _decimalPlaces = 2;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final settings = await SettingsService.getTransactionSettings();
    if (mounted) {
      setState(() {
        if (settings != null) {
          _code = settings.mainCurrencyCode ?? 'IDR';
          _symbol = settings.mainCurrencySymbol ?? 'Rp';
          _position = settings.mainCurrencySymbolPosition ?? 'front';
          _decimalPlaces = settings.mainCurrencyDecimalPlaces ?? 2;
        }
        _loading = false;
      });
    }
  }

  Future<void> _pickCurrency() async {
    final selected = await context.push<CurrencyEntry>(
      '/settings/currency-picker',
    );
    if (selected != null && mounted) {
      setState(() {
        _code = selected.code;
        _symbol = selected.symbol;
      });
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    final ok = await CurrencyService.updateMainCurrency(
      code: _code,
      symbol: _symbol,
      symbolPosition: _position,
      decimalPlaces: _decimalPlaces,
    );
    if (mounted) {
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(ok ? 'Saved!' : 'Failed to save. Please try again.'),
        ),
      );
    }
  }

  /// Format preview: e.g. "Rp 1,00" or "1,00 Rp"
  String get _preview {
    final decimals = _decimalPlaces == 0
        ? ''
        : ',${List.filled(_decimalPlaces, '0').join()}';
    final amount = '1$decimals';
    return _position == 'front' ? '$_symbol $amount' : '$amount $_symbol';
  }

  void _showPositionPicker() {
    final options = ['front', 'back'];
    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: Text(
          'Symbol Position',
          style: AppTextStyles.bodyMedium.copyWith(
            color: ctx.colors.textPrimary,
          ),
        ),
        actions: options.map((opt) {
          return CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() => _position = opt);
            },
            child: Text(
              opt == 'front' ? 'Front' : 'Back',
              style: AppTextStyles.bodyMedium.copyWith(
                color: _position == opt
                    ? ctx.colors.primary
                    : ctx.colors.textPrimary,
                fontWeight: _position == opt
                    ? FontWeight.w600
                    : FontWeight.normal,
              ),
            ),
          );
        }).toList(),
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(ctx),
          child: Text(
            'Cancel',
            style: AppTextStyles.bodyMedium.copyWith(
              color: ctx.colors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  void _showDecimalPicker() {
    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: Text(
          'Decimal Places',
          style: AppTextStyles.bodyMedium.copyWith(
            color: ctx.colors.textPrimary,
          ),
        ),
        actions: [0, 1, 2, 3].map((n) {
          return CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() => _decimalPlaces = n);
            },
            child: Text(
              n.toString(),
              style: AppTextStyles.bodyMedium.copyWith(
                color: _decimalPlaces == n
                    ? ctx.colors.primary
                    : ctx.colors.textPrimary,
                fontWeight: _decimalPlaces == n
                    ? FontWeight.w600
                    : FontWeight.normal,
              ),
            ),
          );
        }).toList(),
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(ctx),
          child: Text(
            'Cancel',
            style: AppTextStyles.bodyMedium.copyWith(
              color: ctx.colors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: AppBar(
        backgroundColor: context.colors.surface,
        title: Text(
          'Main Currency Setting',
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
        actions: [
          TextButton(
            onPressed: _loading ? null : _pickCurrency,
            child: Text(
              'Change',
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.textPrimary,
              ),
            ),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Preview panel
                Container(
                  color: context.colors.surface,
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 24),
                  child: Column(
                    children: [
                      Text(
                        '$_code - ${_currencyCountry()}  ($_symbol)',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _preview,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: context.colors.textPrimary,
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 1),

                // Settings rows
                _SettingRow(
                  label: 'Unit position',
                  value: _position == 'front' ? 'Front' : 'Back',
                  onTap: _showPositionPicker,
                ),
                Divider(
                  height: 1,
                  thickness: 0.5,
                  indent: 16,
                  color: context.colors.border,
                ),
                _SettingRow(
                  label: 'Decimal point',
                  value: _decimalPlaces == 0
                      ? '0'
                      : '1.${'0' * _decimalPlaces}',
                  onTap: _showDecimalPicker,
                ),

                const Spacer(),

                // Save button
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 40),
                  child: SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _saving ? null : _save,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: _saving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Text(
                              'Save',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  String _currencyCountry() {
    try {
      return kAllCurrencies.firstWhere((c) => c.code == _code).countryName;
    } catch (_) {
      return _code;
    }
  }
}

class _SettingRow extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;

  const _SettingRow({
    required this.label,
    required this.value,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            Text(
              value,
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
