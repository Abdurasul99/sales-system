import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../data/models/dashboard_kpis.dart';
import '../../routes/app_routes.dart';
import '../../shared/theme/tokens/app_colors.dart';
import '../../shared/theme/tokens/app_radii.dart';
import '../../shared/theme/tokens/app_spacing.dart';
import '../../shared/widgets/app_shell.dart';
import '../../shared/widgets/data/enterprise_data_table_wrapper.dart';
import '../../shared/widgets/kpi/kpi_card.dart';
import '../../shared/widgets/surfaces/section_card.dart';
import 'analytics_overview_controller.dart';

class AnalyticsOverviewView extends GetView<AnalyticsOverviewController> {
  const AnalyticsOverviewView({
    super.key,
    this.embedded = false,
  });

  final bool embedded;

  @override
  Widget build(BuildContext context) {
    final money = NumberFormat.compactCurrency(decimalDigits: 1, symbol: '');

    final content = Obx(() {
      if (controller.isLoading.value && controller.kpis.value == null) {
        return const Center(child: CircularProgressIndicator());
      }

      final kpis = controller.kpis.value;
      if (kpis == null) {
        return const Center(child: Text('Analytics are not available yet.'));
      }

      return ListView(
        key: const PageStorageKey('analytics-overview-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Revenue quality',
                  value: '${_grossMarginPercent(kpis).toStringAsFixed(1)}%',
                  icon: Icons.query_stats_rounded,
                  changeLabel: 'spread health',
                  footnote: 'Gross spread as a share of total booked sales.',
                  tone: KpiCardTone.success,
                ),
              ),
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Demand pressure',
                  value: '${controller.replenishment.length}',
                  icon: Icons.inventory_2_rounded,
                  changeLabel: 'replenishment',
                  footnote: 'Active low-stock suggestions requiring purchasing review.',
                  tone: controller.replenishment.isEmpty
                      ? KpiCardTone.neutral
                      : KpiCardTone.warning,
                ),
              ),
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Conversion focus',
                  value: '${kpis.winRate.toStringAsFixed(1)}%',
                  icon: Icons.track_changes_rounded,
                  changeLabel: '${kpis.openLeads} open',
                  footnote: 'Lead-to-win effectiveness across the current funnel.',
                  tone: KpiCardTone.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 6,
                child: SectionCard(
                  title: 'Performance Matrix',
                  subtitle: 'Compact executive view of sales, spend, spread, and customer engagement.',
                  child: Column(
                    children: [
                      _AnalyticsBarRow(
                        label: 'Sales',
                        value: money.format(kpis.salesTotal).trim(),
                        progress: 1,
                        color: AppColors.primary,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _AnalyticsBarRow(
                        label: 'Purchases',
                        value: money.format(kpis.purchaseTotal).trim(),
                        progress: kpis.salesTotal == 0 ? 0 : (kpis.purchaseTotal / kpis.salesTotal).clamp(0, 1),
                        color: AppColors.info,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _AnalyticsBarRow(
                        label: 'Gross spread',
                        value: money.format(kpis.grossSpread).trim(),
                        progress: kpis.salesTotal == 0 ? 0 : (kpis.grossSpread / kpis.salesTotal).clamp(0, 1),
                        color: AppColors.success,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Wrap(
                        spacing: AppSpacing.md,
                        runSpacing: AppSpacing.md,
                        children: [
                          _AnalyticsHighlight(
                            title: 'Active customers',
                            value: '${kpis.activeCustomers}',
                          ),
                          _AnalyticsHighlight(
                            title: 'Open leads',
                            value: '${kpis.openLeads}',
                          ),
                          _AnalyticsHighlight(
                            title: 'Low stock items',
                            value: '${kpis.lowStockCount}',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.lg),
              Expanded(
                flex: 4,
                child: SectionCard(
                  title: 'Recommendations',
                  subtitle: 'Action prompts generated from current operational metrics.',
                  child: Column(
                    children: [
                      _RecommendationTile(
                        title: 'Reduce stockout risk',
                        description: controller.replenishment.isEmpty
                            ? 'No urgent replenishment cases are currently detected.'
                            : 'Move replenishment review to purchasing for the top ${controller.replenishment.length} risky items.',
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _RecommendationTile(
                        title: 'Protect margin',
                        description:
                            'Gross margin is ${_grossMarginPercent(kpis).toStringAsFixed(1)}%. Track discount discipline on slower opportunities.',
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _RecommendationTile(
                        title: 'Improve funnel throughput',
                        description:
                            '${kpis.openLeads} open leads remain in process. Prioritize follow-up by manager KPI and aging.',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          EnterpriseDataTableWrapper(
            title: 'Low-Stock Suggestions',
            subtitle: 'Operational detail behind replenishment alerts and purchasing follow-up.',
            actions: [
              OutlinedButton.icon(
                onPressed: controller.load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Refresh'),
              ),
            ],
            emptyMessage: 'There are no active low-stock suggestions.',
            columns: const [
              DataColumn(label: Text('SKU')),
              DataColumn(label: Text('Warehouse')),
              DataColumn(label: Text('Available')),
              DataColumn(label: Text('ROP')),
              DataColumn(label: Text('Suggested')),
            ],
            rows: controller.replenishment
                .map(
                  (item) => DataRow(
                    cells: [
                      DataCell(Text(item['article'].toString())),
                      DataCell(Text(item['warehouseName'].toString())),
                      DataCell(Text('${item['available']}')),
                      DataCell(Text('${item['reorderPoint']}')),
                      DataCell(Text('${item['suggestedOrderQty']}')),
                    ],
                  ),
                )
                .toList(),
          ),
        ],
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Analytics Overview',
      subtitle: 'Operational analytics for revenue, conversion, replenishment pressure, and risk.',
      currentRoute: AppRoutes.analytics,
      actions: [
        IconButton(
          onPressed: controller.load,
          icon: const Icon(Icons.refresh_rounded),
        ),
      ],
      body: content,
    );
  }

  double _grossMarginPercent(DashboardKpis kpis) {
    if (kpis.salesTotal == 0) {
      return 0;
    }

    return (kpis.grossSpread / kpis.salesTotal) * 100;
  }
}

class _AnalyticsBarRow extends StatelessWidget {
  const _AnalyticsBarRow({
    required this.label,
    required this.value,
    required this.progress,
    required this.color,
  });

  final String label;
  final String value;
  final double progress;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Text(label, style: Theme.of(context).textTheme.labelLarge)),
            Text(value, style: Theme.of(context).textTheme.labelLarge),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadii.pill),
          child: LinearProgressIndicator(
            minHeight: 10,
            value: progress.clamp(0, 1),
            backgroundColor: color.withValues(alpha: 0.12),
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }
}

class _AnalyticsHighlight extends StatelessWidget {
  const _AnalyticsHighlight({
    required this.title,
    required this.value,
  });

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 180,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.bodySmall),
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

class _RecommendationTile extends StatelessWidget {
  const _RecommendationTile({
    required this.title,
    required this.description,
  });

  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(description, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
