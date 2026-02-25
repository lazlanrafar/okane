import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/currency_model.dart';
import '../services/currency_service.dart';

class SubCurrencyScreen extends StatefulWidget {
  const SubCurrencyScreen({super.key});

  @override
  State<SubCurrencyScreen> createState() => _SubCurrencyScreenState();
}

class _SubCurrencyScreenState extends State<SubCurrencyScreen> {
  List<SubCurrencyModel> _list = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await CurrencyService.getSubCurrencies();
      if (mounted)
        setState(() {
          _list = list;
          _loading = false;
        });
    } catch (e) {
      if (mounted)
        setState(() {
          _error = e.toString();
          _loading = false;
        });
    }
  }

  Future<void> _addCurrency() async {
    final selected = await context.push<CurrencyEntry>(
      '/settings/currency-picker',
    );
    if (selected == null || !mounted) return;

    // Prevent duplicates
    if (_list.any((s) => s.currencyCode == selected.code)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${selected.code} is already added.')),
      );
      return;
    }

    try {
      await CurrencyService.addSubCurrency(currencyCode: selected.code);
      await _load();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to add currency.')),
        );
      }
    }
  }

  Future<void> _confirmDelete(SubCurrencyModel sub) async {
    final confirmed = await showCupertinoDialog<bool>(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Remove Sub-Currency'),
        content: Text('Remove ${sub.currencyCode}?'),
        actions: [
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove'),
          ),
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await CurrencyService.deleteSubCurrency(id: sub.id);
      if (mounted) setState(() => _list.removeWhere((s) => s.id == sub.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: AppBar(
        backgroundColor: context.colors.surface,
        title: Text(
          'Sub Currency Setting',
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
          // Edit mode (future) — placeholder matching screenshot
          IconButton(
            icon: Icon(
              Icons.edit_outlined,
              color: context.colors.textSecondary,
              size: 22,
            ),
            onPressed: () {},
          ),
          IconButton(
            icon: Icon(Icons.add, color: context.colors.textPrimary, size: 26),
            onPressed: _addCurrency,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Failed to load',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextButton(onPressed: _load, child: const Text('Retry')),
                ],
              ),
            )
          : _list.isEmpty
          ? Center(
              child: Text(
                'No sub currencies added.\nTap + to add one.',
                textAlign: TextAlign.center,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            )
          : ListView.separated(
              itemCount: _list.length,
              separatorBuilder: (_, __) => Divider(
                height: 1,
                thickness: 0.5,
                color: context.colors.border,
              ),
              itemBuilder: (context, index) {
                final sub = _list[index];
                final entry = _findEntry(sub.currencyCode);
                final mainCode = 'IDR'; // shown from workspace settings ideally
                final rate = sub.exchangeRate;
                final rateText = rate != null
                    ? '${sub.currencyCode} 1.00 = $mainCode ${_formatRate(rate)}'
                    : '${sub.currencyCode} 1.00 = $mainCode —';

                return Dismissible(
                  key: ValueKey(sub.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 20),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  onDismissed: (_) => _confirmDelete(sub),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          rateText,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: context.colors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          entry != null
                              ? '${sub.currencyCode} - ${entry.countryName} (${entry.symbol})'
                              : sub.currencyCode,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      // Refresh FAB matching screenshot
      floatingActionButton: FloatingActionButton(
        mini: true,
        backgroundColor: context.colors.surface,
        onPressed: _load,
        child: Icon(Icons.refresh, color: context.colors.textSecondary),
      ),
    );
  }

  CurrencyEntry? _findEntry(String code) {
    try {
      return kAllCurrencies.firstWhere((c) => c.code == code);
    } catch (_) {
      return null;
    }
  }

  String _formatRate(double rate) {
    if (rate >= 1000) {
      // e.g. 13319.648... → "13.319,6486421"
      final parts = rate.toStringAsFixed(7).split('.');
      final intStr = parts[0];
      final dec = parts.length > 1 ? parts[1] : '';
      // Insert thousands separator (.)
      final buffer = StringBuffer();
      for (var i = 0; i < intStr.length; i++) {
        if (i > 0 && (intStr.length - i) % 3 == 0) buffer.write('.');
        buffer.write(intStr[i]);
      }
      return '$buffer,$dec';
    }
    return rate.toStringAsFixed(7);
  }
}
