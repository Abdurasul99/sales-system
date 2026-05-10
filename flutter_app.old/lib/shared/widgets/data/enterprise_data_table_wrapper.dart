import 'package:flutter/material.dart';

import '../../theme/tokens/app_colors.dart';
import '../../theme/tokens/app_radii.dart';
import '../../theme/tokens/app_spacing.dart';
import '../surfaces/section_card.dart';

class EnterpriseDataTableWrapper extends StatelessWidget {
  const EnterpriseDataTableWrapper({
    super.key,
    required this.title,
    required this.columns,
    required this.rows,
    this.subtitle,
    this.filters = const [],
    this.actions = const [],
    this.emptyMessage = 'No records available.',
    this.isLoading = false,
  });

  final String title;
  final String? subtitle;
  final List<DataColumn> columns;
  final List<DataRow> rows;
  final List<Widget> filters;
  final List<Widget> actions;
  final String emptyMessage;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: title,
      subtitle: subtitle,
      trailing: actions.isEmpty
          ? null
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: actions
                  .map(
                    (action) => Padding(
                      padding: const EdgeInsets.only(left: AppSpacing.xs),
                      child: action,
                    ),
                  )
                  .toList(),
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (filters.isNotEmpty) ...[
            Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              children: filters,
            ),
            const SizedBox(height: AppSpacing.md),
          ],
          DecoratedBox(
            decoration: BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.circular(AppRadii.lg),
              border: Border.all(color: AppColors.border),
            ),
            child: isLoading
                ? const Padding(
                    padding: EdgeInsets.all(AppSpacing.xxxl),
                    child: Center(child: CircularProgressIndicator()),
                  )
                : rows.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(AppSpacing.xxxl),
                        child: Center(
                          child: Text(
                            emptyMessage,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textMuted,
                                ),
                          ),
                        ),
                      )
                    : Theme(
                        data: Theme.of(context).copyWith(
                          dividerColor: Colors.transparent,
                        ),
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            headingRowColor: const WidgetStatePropertyAll(
                              AppColors.surface,
                            ),
                            dataRowMinHeight: 60,
                            dataRowMaxHeight: 68,
                            columnSpacing: 28,
                            horizontalMargin: 18,
                            columns: columns,
                            rows: rows,
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
