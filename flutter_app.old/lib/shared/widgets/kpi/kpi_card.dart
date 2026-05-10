import 'package:flutter/material.dart';

import '../../theme/tokens/app_colors.dart';
import '../../theme/tokens/app_radii.dart';
import '../../theme/tokens/app_shadows.dart';
import '../../theme/tokens/app_spacing.dart';

enum KpiCardTone {
  neutral,
  primary,
  success,
  info,
  warning,
  danger,
}

class KpiCard extends StatelessWidget {
  const KpiCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.changeLabel,
    this.footnote,
    this.tone = KpiCardTone.neutral,
  });

  final String label;
  final String value;
  final IconData icon;
  final String? changeLabel;
  final String? footnote;
  final KpiCardTone tone;

  @override
  Widget build(BuildContext context) {
    final palette = _paletteForTone(tone);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: palette.$2,
                    borderRadius: BorderRadius.circular(AppRadii.md),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.sm),
                    child: Icon(icon, color: palette.$1, size: 20),
                  ),
                ),
                const Spacer(),
                if (changeLabel != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: palette.$2,
                      borderRadius: BorderRadius.circular(AppRadii.pill),
                    ),
                    child: Text(
                      changeLabel!,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: palette.$1,
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              label,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              footnote ?? 'Updated from the latest posted operational data.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textMuted,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  (Color, Color) _paletteForTone(KpiCardTone tone) {
    return switch (tone) {
      KpiCardTone.primary => (AppColors.primary, AppColors.primarySoft),
      KpiCardTone.success => (AppColors.success, AppColors.successSoft),
      KpiCardTone.info => (AppColors.info, AppColors.infoSoft),
      KpiCardTone.warning => (AppColors.warning, AppColors.warningSoft),
      KpiCardTone.danger => (AppColors.danger, AppColors.dangerSoft),
      KpiCardTone.neutral => (AppColors.textPrimary, AppColors.surfaceMuted),
    };
  }
}
