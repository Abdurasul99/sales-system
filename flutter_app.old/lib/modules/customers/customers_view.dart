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
import 'customers_controller.dart';

class CustomersView extends GetView<CustomersController> {
  const CustomersView({
    super.key,
    this.embedded = false,
  });

  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final content = Obx(() {
      final items = controller.filteredItems;
      final total = controller.items.length;
      final segments = controller.items.map((item) => item.segment).toSet().length;
      final businessAccounts = controller.items.where((item) => item.type.toUpperCase() == 'B2B').length;

      return ListView(
        key: const PageStorageKey('customers-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Customers',
                  value: '$total',
                  icon: Icons.people_alt_rounded,
                  changeLabel: 'portfolio',
                  footnote: 'Active customer records available to sales and operations.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Segments',
                  value: '$segments',
                  icon: Icons.groups_rounded,
                  changeLabel: 'classification',
                  footnote: 'Distinct customer segments used for targeting and reporting.',
                  tone: KpiCardTone.info,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'B2B accounts',
                  value: '$businessAccounts',
                  icon: Icons.apartment_rounded,
                  changeLabel: 'commercial',
                  footnote: 'Business customers most relevant for wholesale and repeat sales.',
                  tone: KpiCardTone.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Customer Base',
            subtitle: 'A cleaner CRM-style roster with segmentation and contact visibility.',
            filters: [
              ModuleSearchField(
                hintText: 'Search customers by code, name, segment',
                onChanged: controller.setSearch,
                width: 360,
              ),
              const FilterPill(label: 'All segments', icon: Icons.filter_alt_outlined),
              const FilterPill(label: 'B2B focus', icon: Icons.business_outlined),
            ],
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'No customers match the current query.',
            columns: const [
              DataColumn(label: Text('Code')),
              DataColumn(label: Text('Customer')),
              DataColumn(label: Text('Type')),
              DataColumn(label: Text('Segment')),
              DataColumn(label: Text('Phone')),
            ],
            rows: items
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item.code)),
                      DataCell(Text(item.name)),
                      DataCell(Text(item.type)),
                      DataCell(Text(item.segment)),
                      DataCell(Text(item.phone)),
                    ],
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'CRM Direction',
            subtitle: 'This workspace should evolve into a richer account view, not just a contact list.',
            child: _CustomerNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Customers',
      subtitle: 'Customer portfolio, segmentation, and contact readiness for CRM workflows.',
      currentRoute: AppRoutes.customers,
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

class _CustomerNotes extends StatelessWidget {
  const _CustomerNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _NoteBlock(
            title: 'Next UX move',
            description: 'Add account profile drawers with purchase history, notes, and salesperson ownership.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _NoteBlock(
            title: 'Role of this screen',
            description: 'Fast discovery, segmentation, and drill-down into CRM activity from sales and support teams.',
          ),
        ),
      ],
    );
  }
}

class _NoteBlock extends StatelessWidget {
  const _NoteBlock({
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
