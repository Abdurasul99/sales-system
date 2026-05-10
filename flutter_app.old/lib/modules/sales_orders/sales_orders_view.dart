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
import 'sales_orders_controller.dart';

class SalesOrdersView extends GetView<SalesOrdersController> {
  const SalesOrdersView({
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
      final confirmed = controller.items.where((item) => item.status.toUpperCase() == 'CONFIRMED').length;

      return ListView(
        key: const PageStorageKey('sales-orders-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Sales orders',
                  value: '${controller.items.length}',
                  icon: Icons.point_of_sale_rounded,
                  changeLabel: 'commercial flow',
                  footnote: 'Sales documents tracked across the operating period.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Booked value',
                  value: money.format(totalAmount).trim(),
                  icon: Icons.trending_up_rounded,
                  changeLabel: 'gross',
                  footnote: 'Total order value before returns and downstream adjustments.',
                  tone: KpiCardTone.success,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Confirmed',
                  value: '$confirmed',
                  icon: Icons.verified_rounded,
                  changeLabel: 'ready',
                  footnote: 'Orders already approved for fulfillment or next operational steps.',
                  tone: KpiCardTone.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Sales Order Register',
            subtitle: 'A more practical operations grid with search, status, and date visibility.',
            filters: [
              ModuleSearchField(
                hintText: 'Search orders by number, customer, status',
                onChanged: controller.setSearch,
                width: 360,
              ),
              const FilterPill(label: 'All statuses', icon: Icons.filter_list_rounded),
              const FilterPill(label: 'This period', icon: Icons.calendar_month_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No sales orders match the current filter.',
            columns: const [
              DataColumn(label: Text('Order')),
              DataColumn(label: Text('Customer')),
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
            title: 'Sales Workspace Intent',
            subtitle: 'This should feel like a sales command center, not a plain order dump.',
            child: _SalesNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Sales Orders',
      subtitle: 'Commercial execution, order visibility, and status-driven operations.',
      currentRoute: AppRoutes.salesOrders,
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

class _SalesNotes extends StatelessWidget {
  const _SalesNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _SalesNoteTile(
            title: 'What is missing next',
            description: 'Sticky filters, row actions, customer side panels, and fulfillment drill-down.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _SalesNoteTile(
            title: 'What already improved',
            description: 'Cleaner document hierarchy, status visibility, and better data density than card-per-order layouts.',
          ),
        ),
      ],
    );
  }
}

class _SalesNoteTile extends StatelessWidget {
  const _SalesNoteTile({
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
