import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/currency_model.dart';

/// Full-screen searchable currency picker.
/// Returns the selected [CurrencyEntry] via context.pop(entry).
class CurrencyPickerScreen extends StatefulWidget {
  const CurrencyPickerScreen({super.key});

  @override
  State<CurrencyPickerScreen> createState() => _CurrencyPickerScreenState();
}

class _CurrencyPickerScreenState extends State<CurrencyPickerScreen> {
  final _searchController = TextEditingController();
  List<CurrencyEntry> _filtered = kAllCurrencies;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearch);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearch() {
    final q = _searchController.text.trim().toLowerCase();
    setState(() {
      _filtered = q.isEmpty
          ? kAllCurrencies
          : kAllCurrencies
                .where(
                  (c) =>
                      c.code.toLowerCase().contains(q) ||
                      c.countryName.toLowerCase().contains(q) ||
                      c.symbol.toLowerCase().contains(q),
                )
                .toList();
    });
  }

  /// Group currencies by first letter of code
  Map<String, List<CurrencyEntry>> get _grouped {
    final map = <String, List<CurrencyEntry>>{};
    for (final c in _filtered) {
      final key = c.code[0].toUpperCase();
      (map[key] ??= []).add(c);
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    final grouped = _grouped;
    final letters = grouped.keys.toList()..sort();

    // Build a flat list: header + items interleaved
    final items = <_ListItem>[];
    for (final letter in letters) {
      items.add(_ListItem.header(letter));
      for (final c in grouped[letter]!) {
        items.add(_ListItem.currency(c));
      }
    }

    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: AppBar(
        backgroundColor: context.colors.surface,
        title: Text(
          'Currency Setting',
          style: AppTextStyles.titleMedium.copyWith(
            color: context.colors.textPrimary,
          ),
        ),
        leading: TextButton(
          onPressed: () => context.pop(),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.arrow_back_ios,
                color: context.colors.textSecondary,
                size: 16,
              ),
              Text(
                'Back',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        leadingWidth: 80,
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              controller: _searchController,
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: 'Search currency...',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
                prefixIcon: Icon(
                  Icons.search,
                  color: context.colors.textSecondary,
                ),
                filled: true,
                fillColor: context.colors.surface,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Grouped list
          Expanded(
            child: ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                if (item.isHeader) {
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                    child: Text(
                      item.letter!,
                      style: AppTextStyles.caption.copyWith(
                        color: context.colors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }
                final currency = item.currency!;
                return InkWell(
                  onTap: () => context.pop(currency),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    child: Text(
                      currency.label,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: context.colors.textPrimary,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ListItem {
  final bool isHeader;
  final String? letter;
  final CurrencyEntry? currency;

  const _ListItem.header(this.letter) : isHeader = true, currency = null;

  const _ListItem.currency(this.currency) : isHeader = false, letter = null;
}
