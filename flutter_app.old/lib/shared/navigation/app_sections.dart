import 'package:flutter/material.dart';

import '../../routes/app_routes.dart';

class AppSection {
  const AppSection._({
    required this.route,
    required this.label,
    required this.title,
    required this.description,
    required this.icon,
  });

  final String route;
  final String label;
  final String title;
  final String description;
  final IconData icon;

  static const dashboard = AppSection._(
    route: AppRoutes.dashboard,
    label: 'Dashboard',
    title: 'Executive Dashboard',
    description: 'Operational KPIs, funnel health, and replenishment signals.',
    icon: Icons.dashboard_rounded,
  );

  static const masterData = AppSection._(
    route: AppRoutes.masterData,
    label: 'Master Data',
    title: 'Master Data',
    description: 'Reference catalogs, currencies, and governance controls.',
    icon: Icons.account_tree_rounded,
  );

  static const products = AppSection._(
    route: AppRoutes.products,
    label: 'Products',
    title: 'Products',
    description: 'SKU catalog, pricing baselines, and reorder thresholds.',
    icon: Icons.inventory_2_rounded,
  );

  static const customers = AppSection._(
    route: AppRoutes.customers,
    label: 'Customers',
    title: 'Customers',
    description: 'Account portfolios, segments, and commercial profiles.',
    icon: Icons.people_alt_rounded,
  );

  static const suppliers = AppSection._(
    route: AppRoutes.suppliers,
    label: 'Suppliers',
    title: 'Suppliers',
    description: 'Lead time visibility and procurement partner management.',
    icon: Icons.local_shipping_rounded,
  );

  static const inventory = AppSection._(
    route: AppRoutes.inventory,
    label: 'Inventory',
    title: 'Inventory Alerts',
    description: 'Low stock exceptions and replenishment priorities.',
    icon: Icons.warehouse_rounded,
  );

  static const analytics = AppSection._(
    route: AppRoutes.analytics,
    label: 'Analytics',
    title: 'Analytics Overview',
    description: 'Cross-functional insights for revenue, stock risk, and decisions.',
    icon: Icons.insights_rounded,
  );

  static const salesOrders = AppSection._(
    route: AppRoutes.salesOrders,
    label: 'Sales',
    title: 'Sales Orders',
    description: 'Sales execution, fulfillment status, and order exposure.',
    icon: Icons.point_of_sale_rounded,
  );

  static const purchaseOrders = AppSection._(
    route: AppRoutes.purchaseOrders,
    label: 'Purchases',
    title: 'Purchase Orders',
    description: 'Committed spend, inbound stock, and supplier pipelines.',
    icon: Icons.shopping_cart_rounded,
  );

  static const returnOrders = AppSection._(
    route: AppRoutes.returnOrders,
    label: 'Returns',
    title: 'Return Orders',
    description: 'Customer return intake, refund exposure, and traceability.',
    icon: Icons.assignment_return_rounded,
  );

  static const values = <AppSection>[
    dashboard,
    analytics,
    masterData,
    products,
    customers,
    suppliers,
    inventory,
    salesOrders,
    purchaseOrders,
    returnOrders,
  ];

  static AppSection fromRoute(String? route) {
    return values.firstWhere(
      (section) => section.route == route,
      orElse: () => dashboard,
    );
  }

  static int indexOfRoute(String route) {
    return values.indexWhere((section) => section.route == route);
  }
}
