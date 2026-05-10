import 'package:get/get.dart';

import 'package:sales_system/viewmodel/controller/analytics_controller.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';
import 'package:sales_system/viewmodel/controller/categories_controller.dart';
import 'package:sales_system/viewmodel/controller/copilot_controller.dart';
import 'package:sales_system/viewmodel/controller/customers_controller.dart';
import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/controller/finance_controller.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';
import 'package:sales_system/viewmodel/controller/purchases_controller.dart';
import 'package:sales_system/viewmodel/controller/sales_controller.dart';
import 'package:sales_system/viewmodel/controller/suppliers_controller.dart';
import 'package:sales_system/viewmodel/repository/analytics_repository.dart';
import 'package:sales_system/viewmodel/repository/api_client.dart';
import 'package:sales_system/viewmodel/repository/auth_repository.dart';
import 'package:sales_system/viewmodel/repository/category_repository.dart';
import 'package:sales_system/viewmodel/repository/copilot_repository.dart';
import 'package:sales_system/viewmodel/repository/customer_repository.dart';
import 'package:sales_system/viewmodel/repository/extra_repository.dart';
import 'package:sales_system/viewmodel/repository/finance_repository.dart';
import 'package:sales_system/viewmodel/repository/product_repository.dart';
import 'package:sales_system/viewmodel/repository/purchase_repository.dart';
import 'package:sales_system/viewmodel/repository/sale_repository.dart';
import 'package:sales_system/viewmodel/repository/supplier_repository.dart';
import 'local_storage.dart';

class InitialBinding extends Bindings {
  @override
  void dependencies() {
    final storage = LocalStorage();
    final api = ApiClient(storage: storage);

    Get.put<LocalStorage>(storage, permanent: true);
    Get.put<ApiClient>(api, permanent: true);

    // ── Repositories ──
    Get.put<AuthRepository>(AuthRepository(api.dio), permanent: true);
    Get.put<ProductRepository>(ProductRepository(api.dio), permanent: true);
    Get.put<CategoryRepository>(CategoryRepository(api.dio), permanent: true);
    Get.put<SaleRepository>(SaleRepository(api.dio), permanent: true);
    Get.put<CustomerRepository>(CustomerRepository(api.dio), permanent: true);
    Get.put<SupplierRepository>(SupplierRepository(api.dio), permanent: true);
    Get.put<PurchaseRepository>(PurchaseRepository(api.dio), permanent: true);
    Get.put<FinanceRepository>(FinanceRepository(api.dio), permanent: true);
    Get.put<AnalyticsRepository>(AnalyticsRepository(api.dio), permanent: true);
    Get.put<ExtraRepository>(ExtraRepository(api.dio), permanent: true);
    Get.put<CopilotRepository>(CopilotRepository(api.dio), permanent: true);

    // ── Controllers ──
    Get.put<AuthController>(
      AuthController(repository: Get.find(), storage: storage),
      permanent: true,
    );
    Get.put<ProductsController>(
      ProductsController(repository: Get.find()),
      permanent: true,
    );
    Get.put<CategoriesController>(
      CategoriesController(repository: Get.find()),
      permanent: true,
    );
    Get.put<SalesController>(
      SalesController(repository: Get.find()),
      permanent: true,
    );
    Get.put<CustomersController>(
      CustomersController(repository: Get.find()),
      permanent: true,
    );
    Get.put<SuppliersController>(
      SuppliersController(repository: Get.find()),
      permanent: true,
    );
    Get.put<PurchasesController>(
      PurchasesController(repository: Get.find()),
      permanent: true,
    );
    Get.put<FinanceController>(
      FinanceController(repository: Get.find(), kind: 'expense'),
      tag: 'expense',
      permanent: true,
    );
    Get.put<FinanceController>(
      FinanceController(repository: Get.find(), kind: 'income'),
      tag: 'income',
      permanent: true,
    );
    Get.put<AnalyticsController>(
      AnalyticsController(repository: Get.find()),
      permanent: true,
    );
    Get.put<ExtraController>(
      ExtraController(repository: Get.find()),
      permanent: true,
    );
    Get.put<CopilotController>(
      CopilotController(repository: Get.find()),
      permanent: true,
    );
  }
}
