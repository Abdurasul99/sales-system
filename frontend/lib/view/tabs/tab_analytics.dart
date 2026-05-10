import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/analytics_model.dart';
import 'package:sales_system/viewmodel/controller/analytics_controller.dart';

class TabAnalytics extends StatefulWidget {
  const TabAnalytics({super.key});

  @override
  State<TabAnalytics> createState() => _TabAnalyticsState();
}

class _TabAnalyticsState extends State<TabAnalytics> {
  AnalyticsController get _ctrl => Get.find<AnalyticsController>();

  @override
  void initState() {
    super.initState();
    _ctrl.fetch();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: kPrimaryColor,
      onRefresh: _ctrl.fetch,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Obx(() {
          if (_ctrl.isLoading.value && _ctrl.overview.value == AnalyticsOverview.empty) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 64),
              child: Center(child: CircularProgressIndicator(color: kPrimaryColor)),
            );
          }
          if (_ctrl.errorMessage.value != null) {
            return _errorBox(_ctrl.errorMessage.value!);
          }
          final ov = _ctrl.overview.value;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _periodPicker(),
              const SizedBox(height: 16),
              _kpiRow(ov.kpis),
              const SizedBox(height: 16),
              _revenueChart(ov.salesByDay),
              const SizedBox(height: 16),
              LayoutBuilder(builder: (ctx, c) {
                if (c.maxWidth < 900) {
                  return Column(
                    children: [
                      _topProducts(ov.topProducts),
                      const SizedBox(height: 16),
                      _categoryDonut(ov.byCategory),
                      const SizedBox(height: 16),
                      _lowStockCard(ov.lowStock),
                    ],
                  );
                }
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 5, child: _topProducts(ov.topProducts)),
                    const SizedBox(width: 16),
                    Expanded(flex: 4, child: _categoryDonut(ov.byCategory)),
                    const SizedBox(width: 16),
                    Expanded(flex: 4, child: _lowStockCard(ov.lowStock)),
                  ],
                );
              }),
            ],
          );
        }),
      ),
    );
  }

  // ── Period picker ──

  Widget _periodPicker() {
    const presets = [7, 14, 30, 90];
    return Obx(() => Wrap(
          spacing: 8,
          children: presets
              .map((d) => _ChipButton(
                    label: 'За $d дней',
                    isActive: _ctrl.days.value == d,
                    onTap: () => _ctrl.fetch(days: d),
                  ))
              .toList(),
        ));
  }

  // ── KPI cards ──

  Widget _kpiRow(AnalyticsKpi k) {
    final f = NumberFormat.decimalPattern();
    final cards = [
      _KpiCard(
        label: 'Выручка',
        value: '${f.format(k.revenue)} UZS',
        icon: Icons.payments_rounded,
        color: kPrimaryColor,
      ),
      _KpiCard(
        label: 'Себестоимость',
        value: '${f.format(k.cogs)} UZS',
        icon: Icons.savings_outlined,
        color: kTextSecondary,
      ),
      _KpiCard(
        label: 'Валовая прибыль',
        value: '${f.format(k.grossProfit)} UZS',
        icon: Icons.trending_up_rounded,
        color: k.grossProfit >= 0 ? kSuccessColor : kErrorColor,
        subtitle: 'Маржа: ${k.grossMarginPct.toStringAsFixed(1)}%',
      ),
      _KpiCard(
        label: 'Расходы',
        value: '${f.format(k.totalExpense)} UZS',
        icon: Icons.trending_down_rounded,
        color: kErrorColor,
      ),
      _KpiCard(
        label: 'Чистая прибыль',
        value: '${f.format(k.netProfit)} UZS',
        icon: Icons.account_balance_wallet_rounded,
        color: k.netProfit >= 0 ? kIndigoColor : kErrorColor,
        subtitle:
            'Маржа: ${k.netMarginPct.toStringAsFixed(1)}%',
      ),
      _KpiCard(
        label: 'Продаж',
        value: '${k.salesCount}',
        icon: Icons.receipt_long_rounded,
        color: kIndigoColor,
        subtitle: 'Средний чек: ${f.format(k.averageCheck.toInt())}',
      ),
    ];
    return LayoutBuilder(
      builder: (ctx, c) {
        final cols = c.maxWidth < 700
            ? 2
            : c.maxWidth < 1100
                ? 3
                : 6;
        return GridView.count(
          crossAxisCount: cols,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: cols >= 6 ? 1.7 : 2.4,
          children: cards,
        );
      },
    );
  }

  // ── Revenue line chart ──

  Widget _revenueChart(List<SalesPoint> points) {
    return _Card(
      title: 'Выручка по дням',
      subtitle: '${points.length} дней',
      child: SizedBox(
        height: 240,
        child: points.isEmpty
            ? const Center(
                child: Text(
                  'Нет данных за период',
                  style: TextStyle(color: kTextMuted),
                ),
              )
            : Padding(
                padding: const EdgeInsets.fromLTRB(0, 16, 16, 0),
                child: _buildLineChart(points),
              ),
      ),
    );
  }

  Widget _buildLineChart(List<SalesPoint> points) {
    final maxY =
        points.fold<num>(0, (m, p) => p.revenue > m ? p.revenue : m).toDouble();
    final yMax = maxY <= 0 ? 100.0 : (maxY * 1.15);
    final step = (yMax / 4).ceilToDouble();

    final spots = <FlSpot>[];
    for (var i = 0; i < points.length; i++) {
      spots.add(FlSpot(i.toDouble(), points[i].revenue.toDouble()));
    }

    return LineChart(
      LineChartData(
        minX: 0,
        maxX: (points.length - 1).toDouble().clamp(1, double.infinity),
        minY: 0,
        maxY: yMax,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: step,
          getDrawingHorizontalLine: (_) =>
              const FlLine(color: kGray100, strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 56,
              interval: step,
              getTitlesWidget: (v, _) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(
                  _shortNum(v),
                  style: const TextStyle(fontSize: 10, color: kTextHint),
                ),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 28,
              interval: (points.length / 6).ceilToDouble().clamp(1, 999),
              getTitlesWidget: (v, _) {
                final i = v.toInt();
                if (i < 0 || i >= points.length) return const SizedBox.shrink();
                final d = points[i].date;
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    DateFormat('dd.MM').format(d),
                    style: const TextStyle(fontSize: 10, color: kTextHint),
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => kPrimaryColor,
            tooltipRoundedRadius: 8,
            getTooltipItems: (items) => items.map((it) {
              final i = it.x.toInt();
              if (i < 0 || i >= points.length) return null;
              final p = points[i];
              return LineTooltipItem(
                '${DateFormat('dd.MM').format(p.date)}\n'
                '${NumberFormat.decimalPattern().format(p.revenue)} UZS\n'
                '${p.count} прод.',
                const TextStyle(color: Colors.white, fontSize: 12),
              );
            }).toList(),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            curveSmoothness: 0.3,
            color: kPrimaryColor,
            barWidth: 2.5,
            isStrokeCapRound: true,
            dotData: FlDotData(
              show: true,
              getDotPainter: (s, _, __, ___) => FlDotCirclePainter(
                radius: 3,
                color: Colors.white,
                strokeColor: kPrimaryColor,
                strokeWidth: 2,
              ),
            ),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  kPrimaryColor.withValues(alpha: 0.25),
                  kPrimaryColor.withValues(alpha: 0.0),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _shortNum(double v) {
    if (v >= 1e6) return '${(v / 1e6).toStringAsFixed(1)}M';
    if (v >= 1e3) return '${(v / 1e3).toStringAsFixed(0)}K';
    return v.toStringAsFixed(0);
  }

  // ── Top products list ──

  Widget _topProducts(List<TopProduct> top) {
    final f = NumberFormat.decimalPattern();
    return _Card(
      title: 'Топ-5 товаров',
      subtitle: 'По выручке',
      child: top.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text('Нет продаж в периоде',
                    style: TextStyle(color: kTextMuted)),
              ),
            )
          : Column(
              children: [
                for (var i = 0; i < top.length; i++)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: kPrimaryColorLight,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '${i + 1}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: kPrimaryColor,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                top[i].name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: kTextPrimary,
                                ),
                              ),
                              Text(
                                '${f.format(top[i].quantity)} шт. · маржа ${top[i].marginPct.toStringAsFixed(0)}%',
                                style: const TextStyle(
                                    fontSize: 11, color: kTextHint),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '${f.format(top[i].revenue)} UZS',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: kPrimaryColor,
                              ),
                            ),
                            Text(
                              '+${f.format(top[i].profit)}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: kSuccessColor,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }

  // ── Category donut ──

  Widget _categoryDonut(List<CategorySlice> slices) {
    final total = slices.fold<num>(0, (s, x) => s + x.revenue);
    final palette = const [
      kPrimaryColor,
      kIndigoColor,
      Color(0xFF10B981),
      Color(0xFFF59E0B),
      Color(0xFFEC4899),
      Color(0xFF06B6D4),
      Color(0xFFEF4444),
    ];
    return _Card(
      title: 'По категориям',
      subtitle: 'Доля выручки',
      child: SizedBox(
        height: 240,
        child: slices.isEmpty || total == 0
            ? const Center(
                child: Text('Нет данных',
                    style: TextStyle(color: kTextMuted)),
              )
            : Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 40,
                        sections: [
                          for (var i = 0; i < slices.length; i++)
                            PieChartSectionData(
                              value: slices[i].revenue.toDouble(),
                              color: palette[i % palette.length],
                              title: '',
                              radius: 55,
                            ),
                        ],
                      ),
                    ),
                  ),
                  Expanded(
                    flex: 4,
                    child: ListView.builder(
                      itemCount: slices.length,
                      itemBuilder: (_, i) {
                        final s = slices[i];
                        final pct =
                            total == 0 ? 0 : (s.revenue / total * 100);
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: palette[i % palette.length],
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  s.category,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: kTextPrimary,
                                  ),
                                ),
                              ),
                              Text(
                                '${pct.toStringAsFixed(0)}%',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: kTextMuted,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  // ── Low stock list ──

  Widget _lowStockCard(List<LowStockProduct> list) {
    return _Card(
      title: 'Заканчивается на складе',
      subtitle: '≤ 5 шт.',
      child: list.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text('Все товары в достатке',
                    style: TextStyle(color: kTextMuted)),
              ),
            )
          : Column(
              children: [
                for (final p in list.take(5))
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: kTextPrimary,
                                ),
                              ),
                              Text(
                                p.sku,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                  color: kTextHint,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: p.stock <= 0
                                ? kErrorColor.withValues(alpha: 0.12)
                                : kWarningColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${p.stock} шт.',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: p.stock <= 0
                                  ? kErrorColor
                                  : kWarningColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }

  Widget _errorBox(String err) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: kErrorColor.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kErrorColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_off_rounded, color: kErrorColor),
          const SizedBox(width: 12),
          Expanded(
            child: Text(err,
                style: const TextStyle(color: kErrorColor, fontSize: 13)),
          ),
          TextButton(
            onPressed: _ctrl.fetch,
            child: const Text('Повторить'),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────────────────

class _Card extends StatelessWidget {
  const _Card({required this.title, this.subtitle, required this.child});
  final String title;
  final String? subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kBorderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: kTextPrimary,
                  ),
                ),
              ),
              if (subtitle != null)
                Text(
                  subtitle!,
                  style: const TextStyle(fontSize: 11, color: kTextHint),
                ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    this.subtitle,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: kBorderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(fontSize: 11, color: kTextHint),
                ),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: kTextPrimary,
                  ),
                ),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: const TextStyle(fontSize: 10, color: kTextHint),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChipButton extends StatelessWidget {
  const _ChipButton({
    required this.label,
    required this.isActive,
    required this.onTap,
  });
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? kPrimaryColor : Colors.white,
            border: Border.all(
              color: isActive ? kPrimaryColor : kBorderColorStrong,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isActive ? Colors.white : kTextSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
