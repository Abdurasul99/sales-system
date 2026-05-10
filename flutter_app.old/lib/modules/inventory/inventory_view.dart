import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/models/inventory_item_model.dart';
import '../../routes/app_routes.dart';
import '../../shared/theme/tokens/app_colors.dart';
import '../../shared/theme/tokens/app_radii.dart';
import '../../shared/theme/tokens/app_spacing.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/data/enterprise_data_table_wrapper.dart';
import '../../shared/widgets/filters/filter_pill.dart';
import '../../shared/widgets/kpi/kpi_card.dart';
import '../../shared/widgets/surfaces/section_card.dart';
import '../workspace/workspace_controller.dart';
import 'inventory_controller.dart';

class InventoryView extends GetView<InventoryController> {
  const InventoryView({
    super.key,
    this.embedded = false,
    this.onReorderRequested,
  });

  final bool embedded;
  final ValueChanged<InventoryItemModel>? onReorderRequested;

  void _handleReorderRequested(InventoryItemModel item) {
    if (onReorderRequested != null) {
      onReorderRequested!(item);
      return;
    }

    final shortfall = (item.reorderPoint - item.available).clamp(0, double.infinity);

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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Reorder Assistant',
                style: Get.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                'Review the shortage and continue to purchase planning.',
                style: Get.textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              _ReorderInfoRow(label: 'SKU', value: item.article),
              const SizedBox(height: AppSpacing.sm),
              _ReorderInfoRow(label: 'Product', value: item.productName),
              const SizedBox(height: AppSpacing.sm),
              _ReorderInfoRow(label: 'Warehouse', value: item.warehouseName),
              const SizedBox(height: AppSpacing.sm),
              _ReorderInfoRow(
                label: 'Available / ROP',
                value: '${item.available.toStringAsFixed(0)} / ${item.reorderPoint.toStringAsFixed(0)}',
              ),
              const SizedBox(height: AppSpacing.sm),
              _ReorderInfoRow(
                label: 'Minimum top-up',
                value: shortfall.toStringAsFixed(0),
              ),
              const SizedBox(height: AppSpacing.xl),
              Row(
                children: [
                  OutlinedButton(
                    onPressed: Get.back,
                    child: const Text('Close'),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  FilledButton(
                    onPressed: () {
                      Get.back<void>();
                      if (Get.isRegistered<WorkspaceController>()) {
                        Get.find<WorkspaceController>().openPurchaseOrders();
                      } else {
                        Get.offNamed(AppRoutes.purchaseOrders);
                      }
                    },
                    child: const Text('Open purchase orders'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      backgroundColor: const Color(0x00000000),
      isScrollControlled: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    final content = Obx(() {
      if (controller.isLoading.value && controller.items.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }

      final items = controller.items;
      final critical = items.where((item) => item.available <= item.reorderPoint / 2).length;
      final totalShortfall = items.fold<double>(
        0,
        (sum, item) => sum + (item.reorderPoint - item.available).clamp(0, double.infinity),
      );

      return ListView(
        key: const PageStorageKey('inventory-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Low-stock SKUs',
                  value: '${items.length}',
                  icon: Icons.warning_amber_rounded,
                  changeLabel: 'exceptions',
                  footnote: 'Items currently below policy and needing inventory attention.',
                  tone: KpiCardTone.warning,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Critical cases',
                  value: '$critical',
                  icon: Icons.priority_high_rounded,
                  changeLabel: 'urgent',
                  footnote: 'Items already at or below half of their reorder point.',
                  tone: critical == 0 ? KpiCardTone.neutral : KpiCardTone.danger,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Shortfall volume',
                  value: totalShortfall.toStringAsFixed(0),
                  icon: Icons.stacked_line_chart_rounded,
                  changeLabel: 'units',
                  footnote: 'Estimated top-up needed to bring risky items back to reorder baseline.',
                  tone: KpiCardTone.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Inventory Risk Register',
            subtitle: 'Operational low-stock grid with practical replenishment actions.',
            filters: const [
              FilterPill(label: 'Low stock only', icon: Icons.warning_amber_outlined),
              FilterPill(label: 'Multi-warehouse', icon: Icons.warehouse_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No low stock items right now.',
            columns: const [
              DataColumn(label: Text('SKU')),
              DataColumn(label: Text('Product')),
              DataColumn(label: Text('Warehouse')),
              DataColumn(label: Text('Available')),
              DataColumn(label: Text('ROP')),
              DataColumn(label: Text('Shortfall')),
              DataColumn(label: Text('Action')),
            ],
            rows: items
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item.article)),
                      DataCell(Text(item.productName)),
                      DataCell(Text(item.warehouseName)),
                      DataCell(Text(item.available.toStringAsFixed(0))),
                      DataCell(Text(item.reorderPoint.toStringAsFixed(0))),
                      DataCell(
                        Text(
                          (item.reorderPoint - item.available).clamp(0, double.infinity).toStringAsFixed(0),
                        ),
                      ),
                      DataCell(
                        FilledButton.tonal(
                          onPressed: () => _handleReorderRequested(item),
                          child: const Text('Reorder'),
                        ),
                      ),
                    ],
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'Inventory UX Direction',
            subtitle: 'Low-stock management should feel like a control desk, not a warning list.',
            child: _InventoryNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Inventory Alerts',
      subtitle: 'Low-stock exceptions, warehouse pressure, and replenishment follow-up.',
      currentRoute: AppRoutes.inventory,
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

class _InventoryNotes extends StatelessWidget {
  const _InventoryNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _InventoryNoteTile(
            title: 'Next UX move',
            description: 'Add warehouse filters, reservation impact, and linked PO suggestions by supplier.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _InventoryNoteTile(
            title: 'Why this is cleaner',
            description: 'A compact risk register is easier for planners to scan than a long stack of warning cards.',
          ),
        ),
      ],
    );
  }
}

class _InventoryNoteTile extends StatelessWidget {
  const _InventoryNoteTile({
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
          style: Theme.of(context).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(description),
      ],
    );
  }
}

class _ReorderInfoRow extends StatelessWidget {
  const _ReorderInfoRow({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
        ),
      ],
    );
  }
}
