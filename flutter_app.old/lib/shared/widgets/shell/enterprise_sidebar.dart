import 'package:flutter/material.dart';

import '../../navigation/app_sections.dart';
import '../../theme/tokens/app_colors.dart';
import '../../theme/tokens/app_radii.dart';
import '../../theme/tokens/app_spacing.dart';

class EnterpriseSidebar extends StatelessWidget {
  const EnterpriseSidebar({
    super.key,
    required this.currentRoute,
    required this.onNavigate,
  });

  final String currentRoute;
  final ValueChanged<String> onNavigate;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.sidebar,
        borderRadius: BorderRadius.circular(AppRadii.xxl),
        border: Border.all(color: AppColors.sidebarBorder),
      ),
      child: SizedBox(
        width: 292,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.xl,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.sm,
                      vertical: AppSpacing.xs,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(AppRadii.pill),
                    ),
                    child: const Text(
                      'Business Operating System',
                      style: TextStyle(
                        color: Color(0xFFCCFBF1),
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  const Text(
                    'Sales System',
                    style: TextStyle(
                      color: AppColors.textInverse,
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  const Text(
                    'Premium ERP workspace for trade, stock, procurement, and analytics.',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.sidebarMuted,
                  borderRadius: BorderRadius.circular(AppRadii.lg),
                  border: Border.all(color: const Color(0xFF243041)),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Current scope',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: AppSpacing.xs),
                    Text(
                      'Global HQ · 3 warehouses · UZS / USD / CNY',
                      style: TextStyle(
                        color: AppColors.textInverse,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const Divider(height: 1, color: Color(0x1FFFFFFF)),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(AppSpacing.sm),
                itemCount: AppSection.values.length,
                itemBuilder: (context, index) {
                  final section = AppSection.values[index];
                  final selected = currentRoute == section.route;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.xs),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      onTap: () => onNavigate(section.route),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: selected
                              ? AppColors.primary.withValues(alpha: 0.18)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                          border: Border.all(
                            color: selected
                                ? AppColors.primary.withValues(alpha: 0.32)
                                : Colors.transparent,
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: selected
                                    ? Colors.white.withValues(alpha: 0.12)
                                    : AppColors.sidebarMuted,
                                borderRadius: BorderRadius.circular(AppRadii.md),
                              ),
                              child: Icon(
                                section.icon,
                                size: 20,
                                color: selected
                                    ? AppColors.textInverse
                                    : const Color(0xFF94A3B8),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    section.label,
                                    style: TextStyle(
                                      color: selected
                                          ? AppColors.textInverse
                                          : const Color(0xFFE2E8F0),
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    section.description,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: selected
                                          ? const Color(0xFFCCFBF1)
                                          : const Color(0xFF94A3B8),
                                      fontSize: 12,
                                      height: 1.35,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Phase 1 workspace foundation',
                  style: TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 12,
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
