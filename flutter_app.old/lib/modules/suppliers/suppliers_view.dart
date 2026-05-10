import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../routes/app_routes.dart';
import '../../shared/theme/tokens/app_spacing.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/data/enterprise_data_table_wrapper.dart';
import '../../shared/widgets/filters/filter_pill.dart';
import '../../shared/widgets/kpi/kpi_card.dart';
import '../../shared/widgets/module_search_field.dart';
import '../../shared/widgets/surfaces/section_card.dart';
import 'suppliers_controller.dart';

class SuppliersView extends GetView<SuppliersController> {
  const SuppliersView({
    super.key,
    this.embedded = false,
  });

  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final content = Obx(() {
      final items = controller.filteredItems;
      final total = controller.items.length;
      final avgLead = controller.items.isEmpty
          ? 0.0
          : controller.items
                  .map((item) => item.averageLeadDays)
                  .reduce((left, right) => left + right) /
              controller.items.length;
      final fastSuppliers =
          controller.items.where((item) => item.averageLeadDays <= 7).length;

      return ListView(
        key: const PageStorageKey('suppliers-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Suppliers',
                  value: '$total',
                  icon: Icons.local_shipping_rounded,
                  changeLabel: 'active vendors',
                  footnote: 'Approved suppliers available for procurement operations.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Avg lead time',
                  value: '${avgLead.toStringAsFixed(1)} d',
                  icon: Icons.schedule_rounded,
                  changeLabel: 'service level',
                  footnote: 'Average supplier delivery lead time used in replenishment planning.',
                  tone: KpiCardTone.info,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Fast suppliers',
                  value: '$fastSuppliers',
                  icon: Icons.bolt_rounded,
                  changeLabel: '<= 7 days',
                  footnote: 'Vendors that are suitable for short-cycle replenishment scenarios.',
                  tone: KpiCardTone.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Supplier Directory',
            subtitle: 'Cleaner procurement-facing list with contact and lead-time visibility.',
            filters: [
              ModuleSearchField(
                hintText: 'Search suppliers by code, name, contact',
                onChanged: controller.setSearch,
                width: 360,
              ),
              const FilterPill(label: 'All vendors', icon: Icons.list_alt_outlined),
              const FilterPill(label: 'Fast lead time', icon: Icons.bolt_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No suppliers match the current filter.',
            columns: const [
              DataColumn(label: Text('Code')),
              DataColumn(label: Text('Supplier')),
              DataColumn(label: Text('Contact')),
              DataColumn(label: Text('Phone')),
              DataColumn(label: Text('Lead time')),
              DataColumn(label: Text('Class')),
            ],
            rows: items
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item.code)),
                      DataCell(Text(item.name)),
                      DataCell(Text(item.contactName)),
                      DataCell(Text(item.phone)),
                      DataCell(Text('${item.averageLeadDays} d')),
                      DataCell(
                        Text(item.averageLeadDays <= 7 ? 'Fast' : 'Standard'),
                      ),
                    ],
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'Procurement Direction',
            subtitle: 'This page should become the supplier scorecard center over time.',
            child: _SupplierNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Suppliers',
      subtitle: 'Vendor coverage, lead-time visibility, and procurement readiness.',
      currentRoute: AppRoutes.suppliers,
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

class _SupplierNotes extends StatelessWidget {
  const _SupplierNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _SupplierNoteTile(
            title: 'Next UX move',
            description: 'Add supplier ratings, procurement price history, and lead-time reliability trends.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _SupplierNoteTile(
            title: 'Role of this screen',
            description: 'Fast vendor discovery and procurement planning before PO creation and replenishment decisions.',
          ),
        ),
      ],
    );
  }
}

class _SupplierNoteTile extends StatelessWidget {
  const _SupplierNoteTile({
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
