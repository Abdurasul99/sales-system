import 'dart:math' as math;

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
import '../workspace/workspace_controller.dart';
import 'dashboard_controller.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({
    super.key,
    this.embedded = false,
    this.onOpenAnalytics,
  });

  final bool embedded;
  final VoidCallback? onOpenAnalytics;

  void _handleOpenAnalytics() {
    if (onOpenAnalytics != null) {
      onOpenAnalytics!();
      return;
    }

    if (Get.isRegistered<WorkspaceController>()) {
      Get.find<WorkspaceController>().openAnalytics();
      return;
    }

    Get.offNamed(AppRoutes.analytics);
  }

  @override
  Widget build(BuildContext context) {
    final money = NumberFormat.compactCurrency(
      decimalDigits: 1,
      symbol: '',
    );

    final content = Obx(() {
      if (controller.isLoading.value && controller.kpis.value == null) {
        return const Center(child: CircularProgressIndicator());
      }

      final kpis = controller.kpis.value;
      if (kpis == null) {
        return const Center(child: Text('No dashboard data yet'));
      }

      final replenishment = controller.replenishment.take(6).toList();
      final maxOperationalAmount = math.max(
        1,
        math.max(kpis.salesTotal, math.max(kpis.purchaseTotal, kpis.grossSpread)),
      );
      final wide = MediaQuery.of(context).size.width >= 1320;

      final mainContent = ListView(
        key: const PageStorageKey('dashboard-view'),
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Net Sales',
                  value: money.format(kpis.salesTotal).trim(),
                  icon: Icons.sell_rounded,
                  changeLabel: '+${kpis.winRate.toStringAsFixed(0)}% win',
                  footnote: 'Posted sales from active branches and channels.',
                  tone: KpiCardTone.primary,
                ),
              ),
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Purchase Commitments',
                  value: money.format(kpis.purchaseTotal).trim(),
                  icon: Icons.shopping_cart_checkout_rounded,
                  changeLabel: '${kpis.openLeads} open leads',
                  footnote: 'Current inbound spend and supplier-side exposure.',
                  tone: KpiCardTone.info,
                ),
              ),
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Gross Spread',
                  value: money.format(kpis.grossSpread).trim(),
                  icon: Icons.show_chart_rounded,
                  changeLabel: '${(kpis.salesTotal == 0 ? 0 : (kpis.grossSpread / kpis.salesTotal) * 100).toStringAsFixed(1)}% margin',
                  footnote: 'Contribution before logistics, warehousing, and overhead.',
                  tone: KpiCardTone.success,
                ),
              ),
              SizedBox(
                width: 280,
                child: KpiCard(
                  label: 'Stock Risk',
                  value: '${kpis.lowStockCount}',
                  icon: Icons.warning_amber_rounded,
                  changeLabel: replenishment.isEmpty ? 'stable' : '${replenishment.length} urgent',
                  footnote: 'SKUs currently below or near their reorder threshold.',
                  tone: replenishment.isEmpty ? KpiCardTone.neutral : KpiCardTone.warning,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          if (wide)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 7,
                  child: Column(
                    children: [
                      _RevenuePulseCard(
                        kpis: kpis,
                        formatter: money,
                        maxOperationalAmount: maxOperationalAmount.toDouble(),
                        onOpenAnalytics: _handleOpenAnalytics,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      EnterpriseDataTableWrapper(
                        title: 'Replenishment Queue',
                        subtitle:
                            'Suggested replenishment actions derived from reorder point pressure.',
                        filters: const [
                          _FilterChip(label: 'Low stock'),
                          _FilterChip(label: 'Multi-warehouse'),
                          _FilterChip(label: 'Suggested orders'),
                        ],
                        actions: [
                          OutlinedButton.icon(
                            onPressed: controller.load,
                            icon: const Icon(Icons.refresh_rounded),
                            label: const Text('Refresh'),
                          ),
                        ],
                        emptyMessage: 'All tracked items are above reorder point.',
                        columns: const [
                          DataColumn(label: Text('SKU')),
                          DataColumn(label: Text('Warehouse')),
                          DataColumn(label: Text('Available')),
                          DataColumn(label: Text('ROP')),
                          DataColumn(label: Text('Suggested')),
                          DataColumn(label: Text('Priority')),
                        ],
                        rows: replenishment
                            .map(
                              (item) => DataRow(
                                cells: [
                                  DataCell(
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          item['article'].toString(),
                                          style: Theme.of(context).textTheme.labelLarge,
                                        ),
                                        Text(
                                          item['productName'].toString(),
                                          style: Theme.of(context).textTheme.bodySmall,
                                        ),
                                      ],
                                    ),
                                  ),
                                  DataCell(Text(item['warehouseName'].toString())),
                                  DataCell(Text('${item['available']}')),
                                  DataCell(Text('${item['reorderPoint']}')),
                                  DataCell(Text('${item['suggestedOrderQty']}')),
                                  DataCell(
                                    _PriorityBadge(
                                      label: (item['available'] as num) <=
                                              (item['reorderPoint'] as num) / 2
                                          ? 'Critical'
                                          : 'Watch',
                                    ),
                                  ),
                                ],
                              ),
                            )
                            .toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  flex: 4,
                  child: Column(
                    children: [
                      _ActionCenterCard(
                        lowStockCount: kpis.lowStockCount,
                        openLeads: kpis.openLeads,
                        replenishment: replenishment,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      _CommercialSnapshotCard(kpis: kpis),
                      const SizedBox(height: AppSpacing.lg),
                      _RecommendationCard(
                        kpis: kpis,
                        replenishment: replenishment,
                      ),
                    ],
                  ),
                ),
              ],
            )
          else
            Column(
              children: [
                _RevenuePulseCard(
                  kpis: kpis,
                  formatter: money,
                  maxOperationalAmount: maxOperationalAmount.toDouble(),
                  onOpenAnalytics: _handleOpenAnalytics,
                ),
                const SizedBox(height: AppSpacing.lg),
                _ActionCenterCard(
                  lowStockCount: kpis.lowStockCount,
                  openLeads: kpis.openLeads,
                  replenishment: replenishment,
                ),
                const SizedBox(height: AppSpacing.lg),
                EnterpriseDataTableWrapper(
                  title: 'Replenishment Queue',
                  subtitle:
                      'Suggested replenishment actions derived from reorder point pressure.',
                  filters: const [
                    _FilterChip(label: 'Low stock'),
                    _FilterChip(label: 'Suggested orders'),
                  ],
                  emptyMessage: 'All tracked items are above reorder point.',
                  columns: const [
                    DataColumn(label: Text('SKU')),
                    DataColumn(label: Text('Warehouse')),
                    DataColumn(label: Text('Available')),
                    DataColumn(label: Text('Suggested')),
                  ],
                  rows: replenishment
                      .map(
                        (item) => DataRow(
                          cells: [
                            DataCell(Text(item['article'].toString())),
                            DataCell(Text(item['warehouseName'].toString())),
                            DataCell(Text('${item['available']}')),
                            DataCell(Text('${item['suggestedOrderQty']}')),
                          ],
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: AppSpacing.lg),
                _CommercialSnapshotCard(kpis: kpis),
                const SizedBox(height: AppSpacing.lg),
                _RecommendationCard(
                  kpis: kpis,
                  replenishment: replenishment,
                ),
              ],
            ),
        ],
      );

      return AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: mainContent,
      );
    });

    if (embedded) {
      return content;
    }

    return AppShell(
      title: 'Executive Dashboard',
      subtitle: 'Control tower for sales, stock risk, procurement exposure, and action priorities.',
      currentRoute: AppRoutes.dashboard,
      searchHint: 'Search dashboard insights, customers, documents, and risky SKUs',
      actions: [
        OutlinedButton.icon(
          onPressed: controller.load,
          icon: const Icon(Icons.refresh_rounded),
          label: const Text('Refresh'),
        ),
      ],
      body: content,
    );
  }
}

class _RevenuePulseCard extends StatelessWidget {
  const _RevenuePulseCard({
    required this.kpis,
    required this.formatter,
    required this.maxOperationalAmount,
    required this.onOpenAnalytics,
  });

  final DashboardKpis kpis;
  final NumberFormat formatter;
  final double maxOperationalAmount;
  final VoidCallback onOpenAnalytics;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Revenue Pulse',
      subtitle:
          'A premium operating snapshot across sales, purchasing, spread, and funnel quality.',
      trailing: FilledButton.tonalIcon(
        onPressed: onOpenAnalytics,
        icon: const Icon(Icons.open_in_full_rounded),
        label: const Text('Open analytics'),
      ),
      child: Column(
        children: [
          Wrap(
            spacing: AppSpacing.md,
            runSpacing: AppSpacing.md,
            children: [
              SizedBox(
                width: 220,
                child: _MiniProgressMetric(
                  label: 'Sales booked',
                  value: formatter.format(kpis.salesTotal).trim(),
                  progress: kpis.salesTotal / maxOperationalAmount,
                  tone: AppColors.primary,
                ),
              ),
              SizedBox(
                width: 220,
                child: _MiniProgressMetric(
                  label: 'Purchases committed',
                  value: formatter.format(kpis.purchaseTotal).trim(),
                  progress: kpis.purchaseTotal / maxOperationalAmount,
                  tone: AppColors.info,
                ),
              ),
              SizedBox(
                width: 220,
                child: _MiniProgressMetric(
                  label: 'Gross spread',
                  value: formatter.format(kpis.grossSpread).trim(),
                  progress: kpis.grossSpread / maxOperationalAmount,
                  tone: AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Expanded(
                child: _ExecutiveStatTile(
                  label: 'Win rate',
                  value: '${kpis.winRate.toStringAsFixed(1)}%',
                  icon: Icons.flag_circle_rounded,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: _ExecutiveStatTile(
                  label: 'Open leads',
                  value: '${kpis.openLeads}',
                  icon: Icons.filter_alt_rounded,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: _ExecutiveStatTile(
                  label: 'Active customers',
                  value: '${kpis.activeCustomers}',
                  icon: Icons.people_alt_rounded,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionCenterCard extends StatelessWidget {
  const _ActionCenterCard({
    required this.lowStockCount,
    required this.openLeads,
    required this.replenishment,
  });

  final int lowStockCount;
  final int openLeads;
  final List<Map<String, dynamic>> replenishment;

  @override
  Widget build(BuildContext context) {
    final topRisk = replenishment.isNotEmpty ? replenishment.first : null;

    return SectionCard(
      title: 'Action Center',
      subtitle: 'What demands attention right now across stock and commercial execution.',
      child: Column(
        children: [
          _PriorityRow(
            icon: Icons.warning_amber_rounded,
            title: 'Stock risk',
            description: '$lowStockCount SKUs need review against reorder policy.',
            tone: lowStockCount > 0 ? AppColors.warning : AppColors.success,
          ),
          const SizedBox(height: AppSpacing.md),
          _PriorityRow(
            icon: Icons.track_changes_rounded,
            title: 'Lead conversion',
            description: '$openLeads open opportunities need follow-up this cycle.',
            tone: openLeads > 0 ? AppColors.info : AppColors.success,
          ),
          if (topRisk != null) ...[
            const SizedBox(height: AppSpacing.md),
            _PriorityRow(
              icon: Icons.inventory_rounded,
              title: 'Top replenishment candidate',
              description:
                  '${topRisk['article']} in ${topRisk['warehouseName']} suggests order ${topRisk['suggestedOrderQty']}.',
              tone: AppColors.danger,
            ),
          ],
        ],
      ),
    );
  }
}

class _CommercialSnapshotCard extends StatelessWidget {
  const _CommercialSnapshotCard({required this.kpis});

  final DashboardKpis kpis;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Commercial Snapshot',
      subtitle: 'Executive-ready overview for multi-warehouse and multi-currency usage.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: AppSpacing.xs,
            runSpacing: AppSpacing.xs,
            children: const [
              _ContextBadge(label: '3 branches'),
              _ContextBadge(label: '5 warehouses'),
              _ContextBadge(label: 'UZS / USD / CNY'),
              _ContextBadge(label: 'Owner scope'),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          _SnapshotMetricRow(
            label: 'Customer base',
            value: '${kpis.activeCustomers}',
          ),
          const SizedBox(height: AppSpacing.sm),
          _SnapshotMetricRow(
            label: 'Open funnel',
            value: '${kpis.openLeads}',
          ),
          const SizedBox(height: AppSpacing.sm),
          _SnapshotMetricRow(
            label: 'Win performance',
            value: '${kpis.winRate.toStringAsFixed(1)}%',
          ),
        ],
      ),
    );
  }
}

class _RecommendationCard extends StatelessWidget {
  const _RecommendationCard({
    required this.kpis,
    required this.replenishment,
  });

  final DashboardKpis kpis;
  final List<Map<String, dynamic>> replenishment;

  @override
  Widget build(BuildContext context) {
    final recommendationText = replenishment.isEmpty
        ? 'Inventory is stable. Shift focus to conversion and margin quality.'
        : 'Prioritize replenishment for ${replenishment.first['article']} to reduce near-term stockout risk.';

    return SectionCard(
      title: 'Decision Support',
      subtitle: 'Recommended next moves generated from live operational signals.',
      child: Column(
        children: [
          _DecisionItem(
            icon: Icons.lightbulb_outline_rounded,
            title: 'Buy next',
            description: recommendationText,
          ),
          const SizedBox(height: AppSpacing.md),
          _DecisionItem(
            icon: Icons.paid_outlined,
            title: 'Protect margin',
            description:
                'Gross spread is ${kpis.salesTotal == 0 ? '0.0' : ((kpis.grossSpread / kpis.salesTotal) * 100).toStringAsFixed(1)}% of sales. Review discounts on slow conversion deals.',
          ),
          const SizedBox(height: AppSpacing.md),
          _DecisionItem(
            icon: Icons.track_changes_rounded,
            title: 'Follow up',
            description:
                'Open leads remain at ${kpis.openLeads}. Push outbound manager tasks to improve throughput this week.',
          ),
        ],
      ),
    );
  }
}

class _MiniProgressMetric extends StatelessWidget {
  const _MiniProgressMetric({
    required this.label,
    required this.value,
    required this.progress,
    required this.tone,
  });

  final String label;
  final String value;
  final double progress;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              value,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: AppSpacing.md),
            ClipRRect(
              borderRadius: BorderRadius.circular(AppRadii.pill),
              child: LinearProgressIndicator(
                minHeight: 8,
                value: progress.clamp(0.0, 1.0),
                backgroundColor: tone.withValues(alpha: 0.12),
                valueColor: AlwaysStoppedAnimation<Color>(tone),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ExecutiveStatTile extends StatelessWidget {
  const _ExecutiveStatTile({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppColors.textSecondary),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PriorityRow extends StatelessWidget {
  const _PriorityRow({
    required this.icon,
    required this.title,
    required this.description,
    required this.tone,
  });

  final IconData icon;
  final String title;
  final String description;
  final Color tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppRadii.lg),
        border: Border.all(color: tone.withValues(alpha: 0.16)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(AppRadii.md),
            ),
            child: Icon(icon, color: tone, size: 18),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DecisionItem extends StatelessWidget {
  const _DecisionItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.primarySoft,
            borderRadius: BorderRadius.circular(AppRadii.md),
          ),
          child: Icon(icon, size: 18, color: AppColors.primary),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                description,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ContextBadge extends StatelessWidget {
  const _ContextBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _SnapshotMetricRow extends StatelessWidget {
  const _SnapshotMetricRow({
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

class _PriorityBadge extends StatelessWidget {
  const _PriorityBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final critical = label.toLowerCase() == 'critical';
    final tone = critical ? AppColors.danger : AppColors.warning;

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(AppRadii.pill),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: tone,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.pill),
        border: Border.all(color: AppColors.borderStrong),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}
