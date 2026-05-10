import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../routes/app_routes.dart';
import '../../shared/theme/tokens/app_spacing.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/kpi/kpi_card.dart';
import '../../shared/widgets/surfaces/section_card.dart';
import 'master_data_controller.dart';

class MasterDataView extends GetView<MasterDataController> {
  const MasterDataView({
    super.key,
    this.embedded = false,
  });

  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final content = Obx(() {
      final snapshot = controller.snapshot.value;
      if (controller.isLoading.value && snapshot == null) {
        return const Center(child: CircularProgressIndicator());
      }

      if (snapshot == null) {
        return const Center(child: Text('No master data loaded.'));
      }

      return ListView(
        key: const PageStorageKey('master-data-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Companies',
                  value: '${snapshot.companiesCount}',
                  icon: Icons.apartment_rounded,
                  changeLabel: 'multi-company',
                  footnote: 'Legal entities currently modeled in the ERP foundation.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Warehouses',
                  value: '${snapshot.warehousesCount}',
                  icon: Icons.warehouse_rounded,
                  changeLabel: 'network',
                  footnote: 'Storage points connected to inventory and order flows.',
                  tone: KpiCardTone.info,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Currencies',
                  value: '${snapshot.currenciesCount}',
                  icon: Icons.currency_exchange_rounded,
                  changeLabel: 'finance core',
                  footnote: 'Supported currency references for pricing and accounting.',
                  tone: KpiCardTone.success,
                ),
              ),
              SizedBox(
                width: 260,
                child: KpiCard(
                  label: 'Attributes',
                  value: '${snapshot.attributeCount}',
                  icon: Icons.tune_rounded,
                  changeLabel: 'catalog',
                  footnote: 'Attribute definitions available for product standardization.',
                  tone: KpiCardTone.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          SectionCard(
            title: 'Reference Coverage',
            subtitle: 'A cleaner control view of organizational and classification completeness.',
            child: Wrap(
              spacing: AppSpacing.md,
              runSpacing: AppSpacing.md,
              children: [
                _CoverageTile(label: 'Locations', value: '${snapshot.locationsCount}'),
                _CoverageTile(label: 'Categories', value: '${snapshot.categoriesCount}'),
                _CoverageTile(label: 'Units', value: '${snapshot.unitsCount}'),
                _CoverageTile(label: 'Segments', value: '${snapshot.segmentsCount}'),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          const SectionCard(
            title: 'Why this matters',
            subtitle: 'Good master data should feel like governance, not clutter.',
            child: _MasterDataNotes(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Master Data',
      subtitle: 'Organizational references, catalog governance, and data foundations.',
      currentRoute: AppRoutes.masterData,
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

class _CoverageTile extends StatelessWidget {
  const _CoverageTile({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FBFC),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE6ECF1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }
}

class _MasterDataNotes extends StatelessWidget {
  const _MasterDataNotes();

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: _MasterDataNoteTile(
            title: 'Current role',
            description: 'Measure whether the ERP foundation is ready for clean products, partners, warehouses, and currencies.',
          ),
        ),
        SizedBox(
          width: 320,
          child: _MasterDataNoteTile(
            title: 'Next step',
            description: 'Turn these cards into managed directories with ownership, status, and change history.',
          ),
        ),
      ],
    );
  }
}

class _MasterDataNoteTile extends StatelessWidget {
  const _MasterDataNoteTile({
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
