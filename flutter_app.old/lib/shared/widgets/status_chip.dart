import 'package:flutter/material.dart';

import '../theme/tokens/app_colors.dart';
import '../theme/tokens/app_radii.dart';
import '../theme/tokens/app_spacing.dart';

class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
  });

  final String label;

  @override
  Widget build(BuildContext context) {
    final normalized = label.toUpperCase();
    Color background = AppColors.surfaceMuted;
    Color foreground = AppColors.textSecondary;

    if (normalized == 'FULFILLED' || normalized == 'APPROVED') {
      background = AppColors.successSoft;
      foreground = AppColors.success;
    } else if (normalized == 'CONFIRMED' || normalized == 'RECEIVED') {
      background = AppColors.infoSoft;
      foreground = AppColors.info;
    } else if (normalized == 'CANCELLED' || normalized == 'REJECTED') {
      background = AppColors.dangerSoft;
      foreground = AppColors.danger;
    } else if (normalized == 'PENDING' || normalized == 'DRAFT') {
      background = AppColors.warningSoft;
      foreground = AppColors.warning;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppRadii.pill),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}
