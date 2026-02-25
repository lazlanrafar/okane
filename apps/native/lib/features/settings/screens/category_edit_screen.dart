import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/category_model.dart';
import '../services/category_service.dart';

class CategoryEditScreen extends StatefulWidget {
  // The category to edit, passed via GoRouter's extra param
  final CategoryModel category;

  const CategoryEditScreen({super.key, required this.category});

  @override
  State<CategoryEditScreen> createState() => _CategoryEditScreenState();
}

class _CategoryEditScreenState extends State<CategoryEditScreen> {
  late final TextEditingController _nameController;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.category.name);
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
      final updated = await CategoryService.updateCategory(
        id: widget.category.id,
        name: name,
      );
      if (mounted) context.pop(updated);
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
    final parentTitle = widget.category.type == 'income' ? 'Income' : 'Exp.';

    return Scaffold(
      backgroundColor: context.colors.background,
      appBar: AppBar(
        backgroundColor: context.colors.surface,
        title: Text(
          'Edit',
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
                parentTitle,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        leadingWidth: 80,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _nameController,
              autofocus: true,
              style: AppTextStyles.bodyMedium.copyWith(
                color: context.colors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: 'Category name',
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
            const SizedBox(height: 24),
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
