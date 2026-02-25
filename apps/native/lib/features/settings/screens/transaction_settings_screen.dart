import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/services/auth_service.dart';
import '../models/transaction_settings_model.dart';
import '../services/settings_service.dart';

class TransactionSettingsScreen extends StatefulWidget {
  const TransactionSettingsScreen({super.key});

  @override
  State<TransactionSettingsScreen> createState() =>
      _TransactionSettingsScreenState();
}

class _TransactionSettingsScreenState extends State<TransactionSettingsScreen> {
  bool _isLoading = true;
  TransactionSettingsModel? _settings;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final settings = await SettingsService.getTransactionSettings();
    if (mounted) {
      setState(() {
        _settings = settings;
        _isLoading = false;
      });
    }
  }

  Future<void> _updateSetting(String key, dynamic value) async {
    if (_settings == null) return;

    // Optimistic UI update
    setState(() {
      _settings = _settings!.copyWith(
        monthlyStartDate: key == 'monthlyStartDate'
            ? value as int
            : _settings!.monthlyStartDate,
        monthlyStartDateWeekendHandling:
            key == 'monthlyStartDateWeekendHandling'
            ? value as String
            : _settings!.monthlyStartDateWeekendHandling,
        weeklyStartDay: key == 'weeklyStartDay'
            ? value as String
            : _settings!.weeklyStartDay,
        carryOver: key == 'carryOver' ? value as bool : _settings!.carryOver,
        period: key == 'period' ? value as String : _settings!.period,
        incomeExpensesColor: key == 'incomeExpensesColor'
            ? value as String
            : _settings!.incomeExpensesColor,
        autocomplete: key == 'autocomplete'
            ? value as bool
            : _settings!.autocomplete,
        timeInput: key == 'timeInput' ? value as String : _settings!.timeInput,
        startScreen: key == 'startScreen'
            ? value as String
            : _settings!.startScreen,
        swipeAction: key == 'swipeAction'
            ? value as String
            : _settings!.swipeAction,
        showDescription: key == 'showDescription'
            ? value as bool
            : _settings!.showDescription,
        inputOrder: key == 'inputOrder'
            ? value as String
            : _settings!.inputOrder,
        noteButton: key == 'noteButton' ? value as bool : _settings!.noteButton,
      );
    });

    final success = await SettingsService.updateTransactionSettings({
      key: value,
    });
    if (!success && mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Failed to update setting')));
      // Revert if failed (simplified for now by reloading from server)
      _loadSettings();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_settings == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Transaction Settings')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Failed to load settings'),
              const SizedBox(height: 16),
              TextButton(onPressed: _loadSettings, child: const Text('Retry')),
              TextButton(
                onPressed: () async {
                  await AuthService.signOut();
                  if (context.mounted) context.go('/login');
                },
                child: Text(
                  'Sign Out & Reconnect',
                  style: TextStyle(color: Colors.red[400]),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.colors.textPrimary),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Transaction Settings',
          style: AppTextStyles.titleMedium.copyWith(
            color: context.colors.textPrimary,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          _buildSectionHeader('Date & Time'),
          _buildDropdownSetting<int>(
            title: 'Monthly Start Date',
            value: _settings!.monthlyStartDate ?? 1,
            items: List.generate(31, (i) => i + 1)
                .map(
                  (e) => DropdownMenuItem(value: e, child: Text(e.toString())),
                )
                .toList(),
            onChanged: (val) => _updateSetting('monthlyStartDate', val),
          ),
          _buildDropdownSetting<String>(
            title: 'Weekend Handling',
            value: _settings!.monthlyStartDateWeekendHandling ?? 'no-changes',
            items: const [
              DropdownMenuItem(value: 'no-changes', child: Text('No changes')),
              DropdownMenuItem(
                value: 'previous-friday',
                child: Text('Previous Friday'),
              ),
              DropdownMenuItem(
                value: 'following-monday',
                child: Text('Following Monday'),
              ),
            ],
            onChanged: (val) =>
                _updateSetting('monthlyStartDateWeekendHandling', val),
          ),
          _buildDropdownSetting<String>(
            title: 'Weekly Start Day',
            value: _settings!.weeklyStartDay ?? 'Monday',
            items: const [
              DropdownMenuItem(value: 'Sunday', child: Text('Sunday')),
              DropdownMenuItem(value: 'Monday', child: Text('Monday')),
              DropdownMenuItem(value: 'Tuesday', child: Text('Tuesday')),
              DropdownMenuItem(value: 'Wednesday', child: Text('Wednesday')),
              DropdownMenuItem(value: 'Thursday', child: Text('Thursday')),
              DropdownMenuItem(value: 'Friday', child: Text('Friday')),
              DropdownMenuItem(value: 'Saturday', child: Text('Saturday')),
            ],
            onChanged: (val) => _updateSetting('weeklyStartDay', val),
          ),

          const Divider(height: 32),
          _buildSectionHeader('General Preferences'),
          _buildDropdownSetting<String>(
            title: 'Default Period',
            value: _settings!.period ?? 'Monthly',
            items: const [
              DropdownMenuItem(value: 'Daily', child: Text('Daily')),
              DropdownMenuItem(value: 'Weekly', child: Text('Weekly')),
              DropdownMenuItem(value: 'Monthly', child: Text('Monthly')),
              DropdownMenuItem(value: 'Yearly', child: Text('Yearly')),
            ],
            onChanged: (val) => _updateSetting('period', val),
          ),
          _buildDropdownSetting<String>(
            title: 'Start Screen',
            value: _settings!.startScreen ?? 'Daily',
            items: const [
              DropdownMenuItem(value: 'Daily', child: Text('Daily')),
              DropdownMenuItem(value: 'Calendar', child: Text('Calendar')),
              DropdownMenuItem(value: 'Weekly', child: Text('Weekly')),
              DropdownMenuItem(value: 'Monthly', child: Text('Monthly')),
              DropdownMenuItem(value: 'Summary', child: Text('Summary')),
            ],
            onChanged: (val) => _updateSetting('startScreen', val),
          ),
          // Income Exp Colors omitted for brevity or simple dropdown:
          _buildDropdownSetting<String>(
            title: 'Income / Expenses Color',
            value: _settings!.incomeExpensesColor ?? 'blue-red',
            items: const [
              DropdownMenuItem(
                value: 'blue-red',
                child: Text('Income: Blue, Expenses: Red'),
              ),
              DropdownMenuItem(
                value: 'red-blue',
                child: Text('Income: Red, Expenses: Blue'),
              ),
            ],
            onChanged: (val) => _updateSetting('incomeExpensesColor', val),
          ),

          const Divider(height: 32),
          _buildSectionHeader('Input & Interaction'),
          _buildSwitchSetting(
            title: 'Carry Over',
            value: _settings!.carryOver ?? false,
            onChanged: (val) => _updateSetting('carryOver', val),
          ),
          _buildSwitchSetting(
            title: 'Autocomplete',
            value: _settings!.autocomplete ?? false,
            onChanged: (val) => _updateSetting('autocomplete', val),
          ),
          _buildDropdownSetting<String>(
            title: 'Time Input',
            value: _settings!.timeInput ?? 'None',
            items: const [
              DropdownMenuItem(value: 'None', child: Text('None')),
              DropdownMenuItem(
                value: 'None, Desc.',
                child: Text('None, Desc.'),
              ),
              DropdownMenuItem(value: 'Time', child: Text('Time')),
            ],
            onChanged: (val) => _updateSetting('timeInput', val),
          ),
          _buildDropdownSetting<String>(
            title: 'Swipe Action',
            value: _settings!.swipeAction ?? 'Change Date',
            items: const [
              DropdownMenuItem(
                value: 'Change Date',
                child: Text('Change Date'),
              ),
              DropdownMenuItem(value: 'Delete', child: Text('Delete')),
              DropdownMenuItem(value: 'None', child: Text('None')),
            ],
            onChanged: (val) => _updateSetting('swipeAction', val),
          ),
          _buildDropdownSetting<String>(
            title: 'Input Order',
            value: _settings!.inputOrder ?? 'Amount',
            items: const [
              DropdownMenuItem(value: 'Amount', child: Text('From Amount')),
              DropdownMenuItem(value: 'Category', child: Text('From Category')),
            ],
            onChanged: (val) => _updateSetting('inputOrder', val),
          ),
          _buildSwitchSetting(
            title: 'Show Description',
            value: _settings!.showDescription ?? false,
            onChanged: (val) => _updateSetting('showDescription', val),
          ),
          _buildSwitchSetting(
            title: 'Quick Note Button',
            value: _settings!.noteButton ?? false,
            onChanged: (val) => _updateSetting('noteButton', val),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title,
        style: AppTextStyles.titleMedium.copyWith(
          color: context.colors.textPrimary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildSwitchSetting({
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return InkWell(
      onTap: () => onChanged(!value),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              title,
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            Text(
              value ? 'On' : 'Off',
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.primary, // Red text for value
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdownSetting<T>({
    required String title,
    required T value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    // Prevent assertion errors if DB holds an unsupported option
    final hasValidValue = items.any((item) => item.value == value);
    final safeValue = hasValidValue ? value : items.first.value;

    // Extract the text content from the selected DropdownMenuItem's child
    final selectedItem = items.firstWhere(
      (item) => item.value == safeValue,
      orElse: () => items.first,
    );

    // Using a simple extraction assuming child is a Text widget (based on our usage)
    String selectedTextStr = '';
    if (selectedItem.child is Text) {
      selectedTextStr = (selectedItem.child as Text).data ?? '';
    }

    return InkWell(
      onTap: () {
        showCupertinoModalPopup(
          context: context,
          builder: (BuildContext context) => CupertinoActionSheet(
            title: Text(
              title,
              style: AppTextStyles.bodyMedium.copyWith(
                color: this.context.colors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            actions: items.map((item) {
              final itemText = item.child is Text
                  ? (item.child as Text).data ?? ''
                  : '';
              final isSelected = item.value == safeValue;

              return CupertinoActionSheetAction(
                onPressed: () {
                  onChanged(item.value);
                  Navigator.pop(context);
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      itemText,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: isSelected
                            ? this.context.colors.primary
                            : this.context.colors.textPrimary,
                      ),
                    ),
                    if (isSelected) ...[
                      const SizedBox(width: 8),
                      Icon(
                        Icons.check,
                        color: this.context.colors.primary,
                        size: 20,
                      ),
                    ],
                  ],
                ),
              );
            }).toList(),
            cancelButton: CupertinoActionSheetAction(
              isDefaultAction: true,
              onPressed: () {
                Navigator.pop(context);
              },
              child: Text(
                'Cancel',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: this.context.colors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                title,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Text(
              selectedTextStr,
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.primary, // Red text
              ),
            ),
          ],
        ),
      ),
    );
  }
}
