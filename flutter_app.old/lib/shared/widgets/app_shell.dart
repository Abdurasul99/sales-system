import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../routes/app_routes.dart';
import '../theme/tokens/app_colors.dart';
import '../theme/tokens/app_radii.dart';
import '../theme/tokens/app_shadows.dart';
import '../theme/tokens/app_spacing.dart';
import 'shell/enterprise_sidebar.dart';
import 'shell/enterprise_top_bar.dart';

class AppShell extends StatelessWidget {
  const AppShell({
    super.key,
    required this.title,
    required this.currentRoute,
    required this.body,
    this.actions = const [],
    this.subtitle,
    this.onNavigate,
    this.onLogout,
    this.onNotificationsPressed,
    this.searchHint = 'Search documents, customers, orders, or SKUs',
    this.contextLabel = 'Global operating context',
    this.profileName = 'Owner',
    this.profileRole = 'System owner',
    this.notificationCount = 3,
  });

  final String title;
  final String currentRoute;
  final Widget body;
  final List<Widget> actions;
  final String? subtitle;
  final ValueChanged<String>? onNavigate;
  final Future<void> Function()? onLogout;
  final VoidCallback? onNotificationsPressed;
  final String searchHint;
  final String contextLabel;
  final String profileName;
  final String profileRole;
  final int notificationCount;

  void _handleNavigate(String route) {
    if (route == currentRoute) {
      return;
    }

    if (onNavigate != null) {
      onNavigate!(route);
      return;
    }

    Get.offNamed(route);
  }

  Future<void> _handleLogout() async {
    if (onLogout != null) {
      await onLogout!();
      return;
    }

    Get.offAllNamed(AppRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 1180;

        return Scaffold(
          backgroundColor: AppColors.background,
          drawer: wide ? null : _buildDrawer(context),
          body: SafeArea(
            child: Padding(
              padding: EdgeInsets.all(wide ? AppSpacing.xl : AppSpacing.md),
              child: wide
                  ? Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        EnterpriseSidebar(
                          currentRoute: currentRoute,
                          onNavigate: _handleNavigate,
                        ),
                        const SizedBox(width: AppSpacing.xl),
                        Expanded(child: _buildContentColumn(wide: true)),
                      ],
                    )
                  : _buildContentColumn(wide: false),
            ),
          ),
        );
      },
    );
  }

  Widget _buildContentColumn({required bool wide}) {
    return Builder(
      builder: (context) => Column(
        children: [
          EnterpriseTopBar(
            title: title,
            subtitle: subtitle,
            actions: [
              ...actions,
              IconButton(
                onPressed: _handleLogout,
                icon: const Icon(Icons.logout_rounded),
              ),
            ],
            searchHint: searchHint,
            contextLabel: contextLabel,
            profileName: profileName,
            profileRole: profileRole,
            notificationCount: notificationCount,
            onNotificationsPressed: onNotificationsPressed,
            onMenuPressed: wide ? null : () => Scaffold.of(context).openDrawer(),
          ),
          const SizedBox(height: AppSpacing.xl),
          Expanded(
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: AppColors.surfaceRaised,
                borderRadius: BorderRadius.circular(AppRadii.xxl),
                border: Border.all(color: AppColors.border),
                boxShadow: AppShadows.floating,
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppRadii.xxl),
                child: Padding(
                  padding: EdgeInsets.all(wide ? AppSpacing.xl : AppSpacing.md),
                  child: body,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.transparent,
      elevation: 0,
      shadowColor: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: EnterpriseSidebar(
          currentRoute: currentRoute,
          onNavigate: (route) {
            Navigator.of(context).pop();
            _handleNavigate(route);
          },
        ),
      ),
    );
  }
}
