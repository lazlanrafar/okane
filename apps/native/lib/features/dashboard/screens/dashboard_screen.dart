import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import 'setting_tab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final email = Supabase.instance.client.auth.currentUser?.email ?? '';

    final isMoreTab = _selectedIndex == 3;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isMoreTab ? 'Settings' : 'Trans.',
          style: TextStyle(
            color: context.colors.textPrimary,
            fontSize: isMoreTab ? 18 : 20,
            fontWeight: isMoreTab ? FontWeight.w600 : FontWeight.w700,
            letterSpacing: -0.3,
            fontFamily: 'Inter',
          ),
        ),
        leading: isMoreTab
            ? null
            : IconButton(
                icon: Icon(Icons.search, color: context.colors.textPrimary),
                onPressed: () {},
              ),
        actions: isMoreTab
            ? [
                Center(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 16.0),
                    child: Text(
                      '2.12.3 AP',
                      style: AppTextStyles.caption.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ),
                ),
              ]
            : [
                IconButton(
                  icon: Icon(Icons.tune, color: context.colors.textPrimary),
                  onPressed: () {},
                ),
              ],
      ),
      body: isMoreTab
          ? const SettingTab()
          : Column(
              children: [
                _MonthNavBar(),
                _TabBar(),
                _SummaryRow(),
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.receipt_long_outlined,
                          color: context.colors.textDisabled,
                          size: 56,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'No transactions yet',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          email,
                          style: AppTextStyles.caption.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
      floatingActionButton: isMoreTab
          ? null
          : FloatingActionButton(
              onPressed: () {},
              backgroundColor: context.colors.primary,
              child: Icon(Icons.add, color: context.colors.primaryForeground),
            ),
      bottomNavigationBar: _BottomNav(
        selectedIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
      ),
    );
  }
}

class _MonthNavBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(Icons.chevron_left, color: context.colors.textPrimary),
            onPressed: () {},
          ),
          Text('Jan 2026', style: AppTextStyles.titleMedium),
          IconButton(
            icon: Icon(Icons.chevron_right, color: context.colors.textPrimary),
            onPressed: () {},
          ),
        ],
      ),
    );
  }
}

class _TabBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const tabs = ['Daily', 'Calendar', 'Monthly', 'Summary', 'Description'];
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: tabs.length,
        itemBuilder: (_, i) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: _TabPill(label: tabs[i], active: i == 0),
        ),
      ),
    );
  }
}

class _TabPill extends StatelessWidget {
  const _TabPill({required this.label, required this.active});
  final String label;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        border: active
            ? Border(
                bottom: BorderSide(color: context.colors.primary, width: 2),
              )
            : null,
      ),
      child: Text(
        label,
        style: TextStyle(
          color: active
              ? context.colors.textPrimary
              : context.colors.textSecondary,
          fontWeight: active ? FontWeight.w600 : FontWeight.w400,
          fontSize: 13,
          fontFamily: 'Inter',
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: context.colors.surface,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _SummaryCell(
            label: 'Income',
            value: '0,00',
            color: context.colors.income,
          ),
          _SummaryCell(
            label: 'Exp.',
            value: '0,00',
            color: context.colors.accent,
          ),
          _SummaryCell(
            label: 'Total',
            value: '0,00',
            color: context.colors.textPrimary,
          ),
        ],
      ),
    );
  }
}

class _SummaryCell extends StatelessWidget {
  const _SummaryCell({
    required this.label,
    required this.value,
    required this.color,
  });
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.bodyMedium.copyWith(
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _BottomNav extends StatelessWidget {
  const _BottomNav({required this.selectedIndex, required this.onTap});
  final int selectedIndex;
  final void Function(int) onTap;

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: selectedIndex,
      onTap: onTap,
      backgroundColor: context.colors.surface,
      selectedItemColor: context.colors.primary,
      unselectedItemColor: context.colors.textSecondary,
      type: BottomNavigationBarType.fixed,
      selectedFontSize: 11,
      unselectedFontSize: 11,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.receipt_long_outlined),
          label: '05/01',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.bar_chart_outlined),
          label: 'Stats',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.account_balance_wallet_outlined),
          label: 'Accounts',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.settings_outlined),
          label: 'Setting',
        ),
      ],
    );
  }
}
