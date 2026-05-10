import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../shared/navigation/app_sections.dart';
import '../../shared/widgets/app_shell.dart';
import '../analytics_overview/analytics_overview_view.dart';
import '../customers/customers_view.dart';
import '../dashboard/dashboard_view.dart';
import '../inventory/inventory_view.dart';
import '../master_data/master_data_view.dart';
import '../products/products_view.dart';
import '../purchase_orders/purchase_orders_view.dart';
import '../return_orders/return_orders_view.dart';
import '../sales_orders/sales_orders_view.dart';
import '../suppliers/suppliers_view.dart';
import 'workspace_controller.dart';

class WorkspaceView extends StatefulWidget {
  const WorkspaceView({
    super.key,
    required this.initialRoute,
  });

  final String initialRoute;

  @override
  State<WorkspaceView> createState() => _WorkspaceViewState();
}

class _WorkspaceViewState extends State<WorkspaceView> {
  WorkspaceController get controller => Get.find<WorkspaceController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      controller.ensureRoute(widget.initialRoute);
    });
  }

  @override
  void didUpdateWidget(covariant WorkspaceView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialRoute != widget.initialRoute) {
      controller.ensureRoute(widget.initialRoute);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final section = AppSection.fromRoute(controller.activeRoute.value);
      final index = AppSection.indexOfRoute(section.route);

      return AppShell(
        title: section.title,
        subtitle: section.description,
        currentRoute: section.route,
        onNavigate: controller.ensureRoute,
        onLogout: controller.logout,
        onNotificationsPressed: controller.openNotificationsPanel,
        actions: [
          Tooltip(
            message: 'Refresh current module',
            child: IconButton(
              onPressed: controller.refreshCurrentModule,
              icon: const Icon(Icons.refresh_rounded),
            ),
          ),
        ],
        body: PageStorage(
          bucket: controller.pageStorageBucket,
          child: IndexedStack(
            index: index < 0 ? 0 : index,
            children: const [
              DashboardView(embedded: true),
              AnalyticsOverviewView(embedded: true),
              MasterDataView(embedded: true),
              ProductsView(embedded: true),
              CustomersView(embedded: true),
              SuppliersView(embedded: true),
              InventoryView(embedded: true),
              SalesOrdersView(embedded: true),
              PurchaseOrdersView(embedded: true),
              ReturnOrdersView(embedded: true),
            ],
          ),
        ),
      );
    });
  }
}
