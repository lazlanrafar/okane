import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/category_model.dart';
import '../services/category_service.dart';

class CategorySettingsScreen extends StatefulWidget {
  final String type; // 'income' | 'expense'
  const CategorySettingsScreen({super.key, required this.type});

  @override
  State<CategorySettingsScreen> createState() => _CategorySettingsScreenState();
}

class _CategorySettingsScreenState extends State<CategorySettingsScreen> {
  List<CategoryModel> _categories = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final cats = await CategoryService.getCategories(type: widget.type);
      cats.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
      if (mounted) {
        setState(() {
          _categories = cats;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _confirmDelete(CategoryModel cat) async {
    final confirmed = await showCupertinoDialog<bool>(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Delete Category'),
        content: Text('Delete "${cat.name}"? This cannot be undone.'),
        actions: [
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await CategoryService.deleteCategory(id: cat.id);
      if (mounted) {
        setState(() => _categories.removeWhere((c) => c.id == cat.id));
      }
    }
  }

  /// Navigate to the unified form screen in create mode
  Future<void> _openCreateForm() async {
    final created = await context.push<CategoryModel>(
      '/settings/categories/${widget.type}/form',
      extra: {'type': widget.type, 'category': null},
    );
    if (created != null && mounted) {
      setState(() => _categories.add(created));
    }
  }

  /// Navigate to the unified form screen in edit mode
  Future<void> _openEditForm(CategoryModel cat) async {
    final updated = await context.push<CategoryModel>(
      '/settings/categories/${widget.type}/${cat.id}/form',
      extra: {'type': widget.type, 'category': cat},
    );
    if (updated != null && mounted) {
      setState(() {
        final i = _categories.indexWhere((c) => c.id == updated.id);
        if (i >= 0) _categories[i] = updated;
      });
    }
  }

  Future<void> _onReorder(int oldIndex, int newIndex) async {
    if (newIndex > oldIndex) newIndex -= 1;
    setState(() {
      final item = _categories.removeAt(oldIndex);
      _categories.insert(newIndex, item);
    });
    final updates = _categories
        .asMap()
        .entries
        .map((e) => {'id': e.value.id, 'sortOrder': e.key})
        .toList();
    await CategoryService.reorderCategories(updates: updates);
  }

  AppBar _buildAppBar(BuildContext context, String title) {
    return AppBar(
      backgroundColor: context.colors.surface,
      title: Text(
        title,
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
        IconButton(
          icon: Icon(Icons.add, color: context.colors.textPrimary, size: 28),
          onPressed: _openCreateForm,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.type == 'income' ? 'Income' : 'Expenses';

    if (_loading) {
      return Scaffold(
        backgroundColor: context.colors.background,
        appBar: _buildAppBar(context, title),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: context.colors.background,
        appBar: _buildAppBar(context, title),
        body: Center(
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
        ),
      );
    }

    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: _buildAppBar(context, title),
      body: ReorderableListView.builder(
        onReorder: _onReorder,
        itemCount: _categories.length,
        proxyDecorator: (child, index, animation) =>
            Material(color: Colors.transparent, child: child),
        itemBuilder: (context, index) {
          final cat = _categories[index];
          return _CategoryRow(
            key: ValueKey(cat.id),
            index: index,
            isLast: index == _categories.length - 1,
            category: cat,
            onDelete: () => _confirmDelete(cat),
            onEdit: () => _openEditForm(cat),
          );
        },
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  final int index;
  final bool isLast;
  final CategoryModel category;
  final VoidCallback onDelete;
  final VoidCallback onEdit;

  const _CategoryRow({
    super.key,
    required this.index,
    required this.isLast,
    required this.category,
    required this.onDelete,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: context.colors.background,
          child: Row(
            children: [
              // Red delete circle
              GestureDetector(
                onTap: onDelete,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  child: Container(
                    width: 22,
                    height: 22,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.remove,
                      color: Colors.white,
                      size: 14,
                    ),
                  ),
                ),
              ),

              // Category name
              Expanded(
                child: Text(
                  category.name,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: context.colors.textPrimary,
                  ),
                ),
              ),

              // Edit icon
              IconButton(
                icon: Icon(
                  Icons.edit_outlined,
                  color: context.colors.textSecondary,
                  size: 18,
                ),
                onPressed: onEdit,
              ),

              // Drag handle
              ReorderableDragStartListener(
                index: index,
                child: Icon(
                  Icons.drag_handle,
                  color: context.colors.textSecondary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
            ],
          ),
        ),
        if (!isLast)
          Divider(
            height: 1,
            thickness: 0.5,
            indent: 56,
            color: context.colors.border,
          ),
      ],
    );
  }
}
