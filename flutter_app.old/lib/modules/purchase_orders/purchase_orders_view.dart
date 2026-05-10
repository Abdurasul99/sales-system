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
import '../../shared/widgets/status_chip.dart';
import '../../shared/widgets/surfaces/section_card.dart';
import 'purchase_orders_controller.dart';

class PurchaseOrdersView extends GetView<PurchaseOrdersController> {
  const PurchaseOrdersView({
    super.key,
    this.embedded = false,
  });

  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final money = NumberFormat.compactCurrency(symbol: '', decimalDigits: 1);
    final date = DateFormat('dd MMM yyyy');

    final content = Obx(() {
      final items = controller.filteredItems;
      final totalAmount = controller.items.fold<double>(0, (sum, item) => sum + item.total);
      final received = controller.items.where((item) => item.status.toUpperCase() == 'RECEIVED').length;

      return ListView(
        key: const PageStorageKey('purchase-orders-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Purchase orders',
                  value: '${controller.items.length}',
                  icon: Icons.shopping_cart_rounded,
                  changeLabel: 'procurement flow',
                  footnote: 'Supplier-facing documents currently managed in the procurement cycle.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Committed spend',
                  value: money.format(totalAmount).trim(),
                  icon: Icons.payments_rounded,
                  changeLabel: 'inbound',
                  footnote: 'Total committed purchase value across active procurement documents.',
                  tone: KpiCardTone.warning,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Received',
                  value: '$received',
                  icon: Icons.inventory_rounded,
                  changeLabel: 'completed',
                  footnote: 'Purchase orders already received into stock and ready for downstream costing.',
                  tone: KpiCardTone.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Purchase Order Register',
            subtitle: 'Clean procurement view with supplier, date, value, and receipt status.',
            filters: [
              ModuleSearchField(
                hintText: 'Search POs by number, supplier, status',
                onChanged: controller.setSearch,
                width: 360,
              ),
              const FilterPill(label: 'All suppliers', icon: Icons.factory_outlined),
              const FilterPill(label: 'Inbound cycle', icon: Icons.local_shipping_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No purchase orders match the current filter.',
            columns: const [
              DataColumn(label: Text('PO')),
              DataColumn(label: Text('Supplier')),
              DataColumn(label: Text('Created')),
              DataColumn(label: Text('Currency')),
              DataColumn(label: Text('Amount')),
              DataColumn(label: Text('Lines')),
              DataColumn(label: Text('Status')),
            ],
            rows: items
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item.number)),
                      DataCell(Text(item.partyName)),
                      DataCell(Text(date.format(item.createdAt))),
                      DataCell(Text(item.currencyCode)),
                      DataCell(Text(money.format(item.total).trim())),
                      DataCell(Text('${item.linesCount}')),
                      DataCell(StatusChip(label: item.status)),
                    ],
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'Procurement Workspace Intent',
            subtitle: 'This should evolve into a lead-time and inbound control center.',
            child: _PurchaseNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Purchase Orders',
      subtitle: 'Procurement execution, inbound commitments, and receipt visibility.',
      currentRoute: AppRoutes.purchaseOrders,
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

class _PurchaseNotes extends StatelessWidget {
  const _PurchaseNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _PurchaseNoteTile(
            title: 'Next UX move',
            description: 'Add expected delivery, receiving progress, and supplier SLA indicators directly in the grid.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _PurchaseNoteTile(
            title: 'Why this is cleaner',
            description: 'A restrained enterprise table reads faster than stacked cards for procurement teams handling volume.',
          ),
        ),
      ],
    );
  }
}

class _PurchaseNoteTile extends StatelessWidget {
  const _PurchaseNoteTile({
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
