import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:sales_system_mobile/data/models/dashboard_kpis.dart';
import 'package:sales_system_mobile/data/models/inventory_item_model.dart';
import 'package:sales_system_mobile/data/providers/analytics_api_provider.dart';
import 'package:sales_system_mobile/data/providers/catalog_api_provider.dart';
import 'package:sales_system_mobile/data/repositories/analytics_repository.dart';
import 'package:sales_system_mobile/data/repositories/catalog_repository.dart';
import 'package:sales_system_mobile/modules/dashboard/dashboard_controller.dart';
import 'package:sales_system_mobile/modules/dashboard/dashboard_view.dart';
import 'package:sales_system_mobile/modules/inventory/inventory_controller.dart';
import 'package:sales_system_mobile/modules/inventory/inventory_view.dart';
import 'package:sales_system_mobile/routes/app_routes.dart';
import 'package:sales_system_mobile/shared/services/api_service.dart';
import 'package:sales_system_mobile/shared/widgets/app_shell.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const pathProviderChannel = MethodChannel('plugins.flutter.io/path_provider');

  setUpAll(() async {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(pathProviderChannel, (methodCall) async {
      if (methodCall.method == 'getApplicationDocumentsDirectory') {
        return '.';
      }
      return '.';
    });
    await GetStorage.init();
  });

  tearDownAll(() {
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(pathProviderChannel, null);
  });

  tearDown(() {
    Get.reset();
  });

  testWidgets('app shell renders current section title', (tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      GetMaterialApp(
        home: const AppShell(
          title: 'Dashboard',
          subtitle: 'Operational overview',
          currentRoute: AppRoutes.dashboard,
          body: Text('Body content'),
        ),
      ),
    );

    expect(find.text('Dashboard'), findsWidgets);
    expect(find.text('Operational overview'), findsOneWidget);
    expect(find.text('Body content'), findsOneWidget);
  });

  testWidgets('tab switch keeps workspace body state alive', (tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(const GetMaterialApp(home: _ShellHarness()));

    await tester.enterText(find.byType(TextFormField).last, 'persist me');
    expect(find.text('persist me'), findsOneWidget);

    await tester.tap(find.text('Products').first);
    await tester.pumpAndSettle();
    expect(find.text('Products body'), findsOneWidget);

    await tester.tap(find.text('Dashboard').first);
    await tester.pumpAndSettle();
    expect(find.text('persist me'), findsOneWidget);
  });

  testWidgets('notification button triggers callback', (tester) async {
    var tapped = false;

    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      GetMaterialApp(
        home: AppShell(
          title: 'Dashboard',
          currentRoute: AppRoutes.dashboard,
          onNotificationsPressed: () => tapped = true,
          body: const Text('Body content'),
        ),
      ),
    );

    await tester.tap(find.byIcon(Icons.notifications_none_rounded));
    await tester.pump();

    expect(tapped, isTrue);
  });

  testWidgets('dashboard open analytics button triggers callback', (tester) async {
    var opened = false;

    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    Get.put<DashboardController>(
      DashboardController(_FakeAnalyticsRepository()),
    );

    await tester.pumpWidget(
      GetMaterialApp(
        home: DashboardView(
          embedded: true,
          onOpenAnalytics: () => opened = true,
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester.tap(find.text('Open analytics'));
    await tester.pump();

    expect(opened, isTrue);
  });

  testWidgets('inventory reorder button triggers callback with selected item', (tester) async {
    InventoryItemModel? selected;

    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    Get.put<InventoryController>(
      InventoryController(_FakeCatalogRepository()),
    );

    await tester.pumpWidget(
      GetMaterialApp(
        home: InventoryView(
          embedded: true,
          onReorderRequested: (item) => selected = item,
        ),
      ),
    );

    await tester.pumpAndSettle();
    await tester.tap(find.text('Reorder').first);
    await tester.pump();

    expect(selected, isNotNull);
    expect(selected?.article, 'SKU-001');
  });
}

class _ShellHarness extends StatefulWidget {
  const _ShellHarness();

  @override
  State<_ShellHarness> createState() => _ShellHarnessState();
}

class _ShellHarnessState extends State<_ShellHarness> {
  String currentRoute = AppRoutes.dashboard;

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: currentRoute == AppRoutes.dashboard ? 'Dashboard' : 'Products',
      currentRoute: currentRoute,
      onNavigate: (route) => setState(() => currentRoute = route),
      body: IndexedStack(
        index: currentRoute == AppRoutes.dashboard ? 0 : 1,
        children: const [
          _StatefulDashboardBody(),
          Center(child: Text('Products body')),
        ],
      ),
    );
  }
}

class _StatefulDashboardBody extends StatefulWidget {
  const _StatefulDashboardBody();

  @override
  State<_StatefulDashboardBody> createState() => _StatefulDashboardBodyState();
}

class _StatefulDashboardBodyState extends State<_StatefulDashboardBody> {
  final controller = TextEditingController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topLeft,
      child: SizedBox(
        width: 320,
        child: TextFormField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Filter dashboard'),
        ),
      ),
    );
  }
}

class _FakeAnalyticsRepository extends AnalyticsRepository {
  _FakeAnalyticsRepository() : super(AnalyticsApiProvider(ApiService()));

  @override
  Future<DashboardKpis> fetchDashboard() async {
    return DashboardKpis(
      salesTotal: 1500000,
      purchaseTotal: 900000,
      grossSpread: 600000,
      activeCustomers: 34,
      openLeads: 8,
      winRate: 41.5,
      lowStockCount: 3,
    );
  }

  @override
  Future<List<Map<String, dynamic>>> fetchReplenishment() async {
    return [
      {
        'article': 'SKU-001',
        'productName': 'Premium Cable',
        'warehouseName': 'Main DC',
        'available': 12,
        'reorderPoint': 30,
        'suggestedOrderQty': 18,
      },
    ];
  }
}

class _FakeCatalogRepository extends CatalogRepository {
  _FakeCatalogRepository() : super(CatalogApiProvider(ApiService()));

  @override
  Future<List<InventoryItemModel>> fetchInventory({bool lowOnly = false}) async {
    return [
      InventoryItemModel(
        productName: 'Premium Cable',
        article: 'SKU-001',
        warehouseName: 'Main DC',
        available: 12,
        reorderPoint: 30,
      ),
    ];
  }
}
