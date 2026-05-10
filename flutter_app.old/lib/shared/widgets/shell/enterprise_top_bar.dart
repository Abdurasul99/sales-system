import 'package:flutter/material.dart';

import '../../theme/tokens/app_colors.dart';
import '../../theme/tokens/app_radii.dart';
import '../../theme/tokens/app_shadows.dart';
import '../../theme/tokens/app_spacing.dart';

class EnterpriseTopBar extends StatelessWidget {
  const EnterpriseTopBar({
    super.key,
    required this.title,
    required this.actions,
    this.subtitle,
    this.searchHint = 'Search documents, customers, orders, or SKUs',
    this.contextLabel = 'Global operating context',
    this.profileName = 'Owner',
    this.profileRole = 'System owner',
    this.notificationCount = 3,
    this.onNotificationsPressed,
    this.onMenuPressed,
  });

  final String title;
  final String? subtitle;
  final List<Widget> actions;
  final String searchHint;
  final String contextLabel;
  final String profileName;
  final String profileRole;
  final int notificationCount;
  final VoidCallback? onNotificationsPressed;
  final VoidCallback? onMenuPressed;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 980;
            final titleBlock = Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textMuted,
                        ),
                  ),
                ],
              ],
            );
            final contextPill = Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.sm,
                vertical: AppSpacing.xs,
              ),
              decoration: BoxDecoration(
                color: AppColors.primarySoft,
                borderRadius: BorderRadius.circular(AppRadii.pill),
              ),
              child: Text(
                contextLabel,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
              ),
            );
            final actionRow = Wrap(
              spacing: AppSpacing.xs,
              runSpacing: AppSpacing.xs,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                ...actions,
                _NotificationButton(
                  count: notificationCount,
                  onPressed: onNotificationsPressed,
                ),
                _ProfileChip(
                  profileName: profileName,
                  profileRole: profileRole,
                ),
              ],
            );

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (compact)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: AppSpacing.md,
                        runSpacing: AppSpacing.md,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          if (onMenuPressed != null)
                            IconButton(
                              onPressed: onMenuPressed,
                              icon: const Icon(Icons.menu_rounded),
                            ),
                          titleBlock,
                          contextPill,
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      actionRow,
                    ],
                  )
                else
                  Row(
                    children: [
                      if (onMenuPressed != null)
                        IconButton(
                          onPressed: onMenuPressed,
                          icon: const Icon(Icons.menu_rounded),
                        ),
                      Expanded(
                        child: Wrap(
                          spacing: AppSpacing.md,
                          runSpacing: AppSpacing.md,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            titleBlock,
                            contextPill,
                          ],
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Flexible(child: Align(alignment: Alignment.centerRight, child: actionRow)),
                    ],
                  ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        textInputAction: TextInputAction.search,
                        decoration: InputDecoration(
                          hintText: searchHint,
                          prefixIcon: const Icon(Icons.search_rounded),
                          suffixIcon: const Icon(Icons.tune_rounded),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _NotificationButton extends StatelessWidget {
  const _NotificationButton({
    required this.count,
    this.onPressed,
  });

  final int count;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onPressed,
          icon: const Icon(Icons.notifications_none_rounded),
        ),
        if (count > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              width: 18,
              height: 18,
              decoration: const BoxDecoration(
                color: AppColors.danger,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                '$count',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: AppColors.textInverse,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ProfileChip extends StatelessWidget {
  const _ProfileChip({
    required this.profileName,
    required this.profileRole,
  });

  final String profileName;
  final String profileRole;

  @override
  Widget build(BuildContext context) {
    final initials = profileName.isEmpty
        ? 'U'
        : profileName
            .split(' ')
            .where((part) => part.isNotEmpty)
            .take(2)
            .map((part) => part[0].toUpperCase())
            .join();

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primarySoft,
            child: Text(
              initials,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                  ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                profileName,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
              ),
              Text(
                profileRole,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textMuted,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
