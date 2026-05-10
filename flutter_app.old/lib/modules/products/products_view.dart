import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../routes/app_routes.dart';
import '../../shared/theme/tokens/app_spacing.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/data/enterprise_data_table_wrapper.dart';
import '../../shared/widgets/filters/filter_pill.dart';
import '../../shared/widgets/kpi/kpi_card.dart';
import '../../shared/widgets/module_search_field.dart';
import '../../shared/widgets/surfaces/section_card.dart';
import 'products_controller.dart';

class ProductsView extends GetView<ProductsController> {
  const ProductsView({
    super.key,
    this.embedded = false,
  });

  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final money = NumberFormat.compactCurrency(symbol: '', decimalDigits: 1);

    final content = Obx(() {
      if (controller.isLoading.value && controller.items.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      final items = controller.items;
      final filteredItems = controller.filteredItems;
      final avgMargin = items.isEmpty
          ? 0.0
          : items
                  .map((item) => item.basePrice == 0 ? 0 : ((item.basePrice - item.baseCost) / item.basePrice) * 100)
                  .reduce((left, right) => left + right) /
              items.length;
      final lowStockCount = items.where((item) => item.reorderPoint > 0).length;

      return ListView(
        key: const PageStorageKey('products-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Catalog SKUs',
                  value: '${items.length}',
                  icon: Icons.inventory_2_rounded,
                  changeLabel: 'active',
                  footnote: 'Distinct saleable and stocked products in the catalog.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Average margin',
                  value: '${avgMargin.toStringAsFixed(1)}%',
                  icon: Icons.show_chart_rounded,
                  changeLabel: 'price health',
                  footnote: 'Estimated spread between current base cost and base price.',
                  tone: KpiCardTone.success,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Pricing base',
                  value: money.format(
                    items.fold<double>(0, (sum, item) => sum + item.basePrice),
                  ).trim(),
                  icon: Icons.sell_rounded,
                  changeLabel: 'portfolio',
                  footnote: 'Combined base sales pricing footprint across the product set.',
                  tone: KpiCardTone.info,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'ROP-enabled items',
                  value: '$lowStockCount',
                  icon: Icons.rule_folder_rounded,
                  changeLabel: 'policy',
                  footnote: 'Products already configured with reorder-point discipline.',
                  tone: KpiCardTone.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Product Catalog',
            subtitle: 'Pricing, replenishment policy, and margin visibility in one operational grid.',
            filters: [
              ModuleSearchField(
                hintText: 'Search SKU, product name, pricing',
                onChanged: controller.setSearch,
                width: 360,
              ),
              const FilterPill(label: 'All SKUs', icon: Icons.inventory_2_outlined),
              const FilterPill(label: 'Price-managed', icon: Icons.sell_outlined),
              const FilterPill(label: 'ROP enabled', icon: Icons.rule_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No products are available in the catalog yet.',
            columns: const [
              DataColumn(label: Text('SKU')),
              DataColumn(label: Text('Product')),
              DataColumn(label: Text('Cost')),
              DataColumn(label: Text('Price')),
              DataColumn(label: Text('Margin')),
              DataColumn(label: Text('ROP')),
            ],
            rows: filteredItems
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item.article)),
                      DataCell(
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.name,
                              style: Theme.of(context).textTheme.labelLarge,
                            ),
                            Text(
                              'ID ${item.id.substring(0, 8)}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                      DataCell(Text(money.format(item.baseCost).trim())),
                      DataCell(Text(money.format(item.basePrice).trim())),
                      DataCell(
                        Text(
                          '${(item.basePrice == 0 ? 0 : ((item.basePrice - item.baseCost) / item.basePrice) * 100).toStringAsFixed(1)}%',
                        ),
                      ),
                      DataCell(Text(item.reorderPoint.toStringAsFixed(0))),
                    ],
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'Catalog Operating Notes',
            subtitle: 'Design intent for a more practical product workspace.',
            child: _ProductWorkspaceNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Products',
      subtitle: 'Catalog, pricing baseline, and replenishment policy management.',
      currentRoute: AppRoutes.products,
      actions: [
        IconButton(
          onPressed: controller.load,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      body: content,
    );
  }
}

class _ProductWorkspaceNotes extends StatelessWidget {
  const _ProductWorkspaceNotes();

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _WorkspaceNoteTile(
            title: 'What belongs here',
            description: 'SKU governance, pricing history, reorder policy, and category discipline.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _WorkspaceNoteTile(
            title: 'Next design step',
            description: 'Slide-over create and edit flows, margin bands, and attribute-driven filtering.',
          ),
        ),
      ],
    );
  }
}

class _WorkspaceNoteTile extends StatelessWidget {
  const _WorkspaceNoteTile({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(description),
      ],
    );
  }
}
