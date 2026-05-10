import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/repositories/auth_repository.dart';
import '../../routes/app_routes.dart';
import '../../shared/navigation/app_sections.dart';
import '../../shared/theme/tokens/app_colors.dart';
import '../../shared/theme/tokens/app_radii.dart';
import '../../shared/theme/tokens/app_spacing.dart';
import '../analytics_overview/analytics_overview_controller.dart';
import '../customers/customers_controller.dart';
import '../dashboard/dashboard_controller.dart';
import '../inventory/inventory_controller.dart';
import '../master_data/master_data_controller.dart';
import '../products/products_controller.dart';
import '../purchase_orders/purchase_orders_controller.dart';
import '../return_orders/return_orders_controller.dart';
import '../sales_orders/sales_orders_controller.dart';
import '../suppliers/suppliers_controller.dart';

class WorkspaceController extends GetxController {
  WorkspaceController(this._authRepository);

  final AuthRepository _authRepository;
  final activeRoute = AppRoutes.dashboard.obs;
  final pageStorageBucket = PageStorageBucket();

  void ensureRoute(String route) {
    final normalized = AppSection.fromRoute(route).route;
    if (activeRoute.value != normalized) {
      activeRoute.value = normalized;
    }
  }

  void openAnalytics() {
    ensureRoute(AppRoutes.analytics);
  }

  void openPurchaseOrders() {
    ensureRoute(AppRoutes.purchaseOrders);
  }

  Future<void> refreshCurrentModule() async {
    switch (activeRoute.value) {
      case AppRoutes.dashboard:
        if (Get.isRegistered<DashboardController>()) {
          await Get.find<DashboardController>().load();
        }
        return;
      case AppRoutes.analytics:
        if (Get.isRegistered<AnalyticsOverviewController>()) {
          await Get.find<AnalyticsOverviewController>().load();
        }
        return;
      case AppRoutes.masterData:
        if (Get.isRegistered<MasterDataController>()) {
          await Get.find<MasterDataController>().load();
        }
        return;
      case AppRoutes.products:
        if (Get.isRegistered<ProductsController>()) {
          await Get.find<ProductsController>().load();
        }
        return;
      case AppRoutes.customers:
        if (Get.isRegistered<CustomersController>()) {
          await Get.find<CustomersController>().load();
        }
        return;
      case AppRoutes.suppliers:
        if (Get.isRegistered<SuppliersController>()) {
          await Get.find<SuppliersController>().load();
        }
        return;
      case AppRoutes.inventory:
        if (Get.isRegistered<InventoryController>()) {
          await Get.find<InventoryController>().load();
        }
        return;
      case AppRoutes.salesOrders:
        if (Get.isRegistered<SalesOrdersController>()) {
          await Get.find<SalesOrdersController>().load();
        }
        return;
      case AppRoutes.purchaseOrders:
        if (Get.isRegistered<PurchaseOrdersController>()) {
          await Get.find<PurchaseOrdersController>().load();
        }
        return;
      case AppRoutes.returnOrders:
        if (Get.isRegistered<ReturnOrdersController>()) {
          await Get.find<ReturnOrdersController>().load();
        }
        return;
    }
  }

  void openNotificationsPanel() {
    final alerts = <_WorkspaceAlert>[
      ..._buildDashboardAlerts(),
      ..._buildInventoryAlerts(),
    ];

    Get.bottomSheet<void>(
      SafeArea(
        child: Container(
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(AppRadii.xxl),
            ),
          ),
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Notifications',
                  style: Get.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Actionable operational signals from the current workspace.',
                  style: Get.textTheme.bodyMedium?.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                if (alerts.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: BorderRadius.circular(AppRadii.lg),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Text('No critical notifications right now.'),
                  )
                else
                  ...alerts.map(
                    (alert) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: _NotificationCard(
                        alert: alert,
                        onOpen: () {
                          Get.back<void>();
                          ensureRoute(alert.route);
                        },
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
      isScrollControlled: true,
      backgroundColor: const Color(0x00000000),
    );
  }

  List<_WorkspaceAlert> _buildDashboardAlerts() {
    if (!Get.isRegistered<DashboardController>()) {
      return const [];
    }

    final dashboard = Get.find<DashboardController>();
    final kpis = dashboard.kpis.value;
    if (kpis == null) {
      return const [];
    }

    final alerts = <_WorkspaceAlert>[];

    if (kpis.openLeads > 0) {
      alerts.add(
        _WorkspaceAlert(
          title: 'Open lead queue needs review',
          message: '${kpis.openLeads} leads remain active in the funnel and may require manager follow-up.',
          route: AppRoutes.dashboard,
          actionLabel: 'Open dashboard',
          tone: AppColors.info,
        ),
      );
    }

    if (kpis.lowStockCount > 0) {
      alerts.add(
        _WorkspaceAlert(
          title: 'Low-stock pressure detected',
          message: '${kpis.lowStockCount} SKUs are below or near reorder point and need replenishment review.',
          route: AppRoutes.inventory,
          actionLabel: 'Open inventory',
          tone: AppColors.warning,
        ),
      );
    }

    return alerts;
  }

  List<_WorkspaceAlert> _buildInventoryAlerts() {
    if (!Get.isRegistered<InventoryController>()) {
      return const [];
    }

    final inventory = Get.find<InventoryController>();
    if (inventory.items.isEmpty) {
      return const [];
    }

    final firstItem = inventory.items.first;
    return [
      _WorkspaceAlert(
        title: 'Top reorder candidate',
        message:
            '${firstItem.article} at ${firstItem.warehouseName} is below policy with ${firstItem.available.toStringAsFixed(0)} on hand.',
        route: AppRoutes.purchaseOrders,
        actionLabel: 'Open purchases',
        tone: AppColors.danger,
      ),
    ];
  }

  Future<void> logout() async {
    await _authRepository.logout();
    activeRoute.value = AppRoutes.dashboard;
    Get.offAllNamed(AppRoutes.login);
  }
}

class _WorkspaceAlert {
  const _WorkspaceAlert({
    required this.title,
    required this.message,
    required this.route,
    required this.actionLabel,
    required this.tone,
  });

  final String title;
  final String message;
  final String route;
  final String actionLabel;
  final Color tone;
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({
    required this.alert,
    required this.onOpen,
  });

  final _WorkspaceAlert alert;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: alert.tone.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: alert.tone.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            alert.title,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            alert.message,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
          const SizedBox(height: AppSpacing.md),
          Align(
            alignment: Alignment.centerLeft,
            child: FilledButton.tonal(
              onPressed: onOpen,
              child: Text(alert.actionLabel),
            ),
          ),
        ],
      ),
    );
  }
}
