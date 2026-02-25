import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/category_model.dart';
import '../services/category_service.dart';

/// Shared form screen for both creating and editing a category.
/// Pass [category] as null to create a new one, or supply an existing
/// [CategoryModel] to edit it. [type] is required for creation ('income'|'expense').
class CategoryFormScreen extends StatefulWidget {
  final CategoryModel? category; // null = create mode
  final String type; // 'income' | 'expense'

  const CategoryFormScreen({super.key, required this.type, this.category});

  @override
  State<CategoryFormScreen> createState() => _CategoryFormScreenState();
}

class _CategoryFormScreenState extends State<CategoryFormScreen> {
  late final TextEditingController _nameController;
  bool _saving = false;

  bool get _isEdit => widget.category != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.category?.name ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    setState(() => _saving = true);
    try {
      CategoryModel result;
      if (_isEdit) {
        result = await CategoryService.updateCategory(
          id: widget.category!.id,
          name: name,
        );
      } else {
        result = await CategoryService.createCategory(
          name: name,
          type: widget.type,
        );
      }
      if (mounted) context.pop(result);
    } catch (_) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final parentTitle = widget.type == 'income' ? 'Income' : 'Exp.';

    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: AppBar(
        backgroundColor: context.colors.surface,
        title: Text(
          _isEdit ? 'Edit' : 'New Category',
          style: AppTextStyles.titleMedium.copyWith(
            color: context.colors.textPrimary,
          ),
        ),
        // Simple IconButton back — avoids the Row overflow inside the 56px leading
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.arrow_back_ios,
                color: context.colors.textSecondary,
                size: 16,
              ),
            ],
          ),
        ),
        leadingWidth: 48,
        // Show parent screen label as a subtitle-style prefix in the title
        // by placing it as a bottom widget in the appbar
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0),
          child: const SizedBox.shrink(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Back label hint
            Text(
              '< $parentTitle',
              style: AppTextStyles.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _nameController,
              autofocus: true,
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: 'Category name (e.g. 🍔 Food)',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: context.colors.border),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: context.colors.primary),
                ),
              ),
            ),
            const SizedBox(height: 28),
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.colors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
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
          ],
        ),
      ),
    );
  }
}
