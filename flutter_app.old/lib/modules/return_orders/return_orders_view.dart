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
import 'return_orders_controller.dart';

class ReturnOrdersView extends GetView<ReturnOrdersController> {
  const ReturnOrdersView({
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
      final approved = controller.items.where((item) => item.status.toUpperCase() == 'APPROVED').length;

      return ListView(
        key: const PageStorageKey('return-orders-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Return orders',
                  value: '${controller.items.length}',
                  icon: Icons.assignment_return_rounded,
                  changeLabel: 'service loop',
                  footnote: 'Return documents tracked for customer service and finance impact.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Refund exposure',
                  value: money.format(totalAmount).trim(),
                  icon: Icons.currency_exchange_rounded,
                  changeLabel: 'liability',
                  footnote: 'Potential refund or adjustment value represented by current returns.',
                  tone: KpiCardTone.warning,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Approved returns',
                  value: '$approved',
                  icon: Icons.assignment_turned_in_rounded,
                  changeLabel: 'processed',
                  footnote: 'Returns already approved and ready for stock or finance posting.',
                  tone: KpiCardTone.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Return Register',
            subtitle: 'A more controlled service-and-finance view for return processing.',
            filters: [
              ModuleSearchField(
                hintText: 'Search returns by number, source order, type',
                onChanged: controller.setSearch,
                width: 360,
              ),
              const FilterPill(label: 'All types', icon: Icons.swap_horiz_outlined),
              const FilterPill(label: 'Returns & refunds', icon: Icons.replay_circle_filled_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No return documents match the current filter.',
            columns: const [
              DataColumn(label: Text('Return')),
              DataColumn(label: Text('Source')),
              DataColumn(label: Text('Type')),
              DataColumn(label: Text('Created')),
              DataColumn(label: Text('Amount')),
              DataColumn(label: Text('Status')),
            ],
            rows: items
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item.number)),
                      DataCell(Text(item.partyName)),
                      DataCell(Text(item.type ?? 'Return')),
                      DataCell(Text(date.format(item.createdAt))),
                      DataCell(Text('${item.currencyCode} ${money.format(item.total).trim()}')),
                      DataCell(StatusChip(label: item.status)),
                    ],
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'Returns Workspace Intent',
            subtitle: 'This should become a controlled exception-processing screen, not a passive list.',
            child: _ReturnNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Return Orders',
      subtitle: 'Return intake, adjustment exposure, and approval visibility.',
      currentRoute: AppRoutes.returnOrders,
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

class _ReturnNotes extends StatelessWidget {
  const _ReturnNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _ReturnNoteTile(
            title: 'Next UX move',
            description: 'Add linked source document preview, warehouse intake, and refund workflow status.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _ReturnNoteTile(
            title: 'Why this is cleaner',
            description: 'Returns work better as a compact exception queue with strong status signaling and less visual noise.',
          ),
        ),
      ],
    );
  }
}

class _ReturnNoteTile extends StatelessWidget {
  const _ReturnNoteTile({
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
