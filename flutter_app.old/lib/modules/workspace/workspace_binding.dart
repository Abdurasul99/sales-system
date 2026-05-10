import 'package:get/get.dart';

import '../../data/repositories/auth_repository.dart';
import '../../shared/utils/get_registrar.dart';
import '../analytics_overview/analytics_overview_binding.dart';
import '../auth/auth_binding.dart';
import '../customers/customers_binding.dart';
import '../dashboard/dashboard_binding.dart';
import '../inventory/inventory_binding.dart';
import '../master_data/master_data_binding.dart';
import '../products/products_binding.dart';
import '../purchase_orders/purchase_orders_binding.dart';
import '../return_orders/return_orders_binding.dart';
import '../sales_orders/sales_orders_binding.dart';
import '../suppliers/suppliers_binding.dart';
import 'workspace_controller.dart';

class WorkspaceBinding extends Bindings {
  @override
  void dependencies() {
    AuthBinding().dependencies();
    DashboardBinding().dependencies();
    AnalyticsOverviewBinding().dependencies();
    MasterDataBinding().dependencies();
    ProductsBinding().dependencies();
    CustomersBinding().dependencies();
    SuppliersBinding().dependencies();
    InventoryBinding().dependencies();
    SalesOrdersBinding().dependencies();
    PurchaseOrdersBinding().dependencies();
    ReturnOrdersBinding().dependencies();

    lazyPutIfAbsent(
      () => WorkspaceController(Get.find<AuthRepository>()),
      fenix: true,
    );
  }
}
