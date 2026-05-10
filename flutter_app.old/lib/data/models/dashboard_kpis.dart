class DashboardKpis {
  DashboardKpis({
    required this.salesTotal,
    required this.purchaseTotal,
    required this.grossSpread,
    required this.activeCustomers,
    required this.openLeads,
    required this.winRate,
    required this.lowStockCount,
  });

  final double salesTotal;
  final double purchaseTotal;
  final double grossSpread;
  final int activeCustomers;
  final int openLeads;
  final double winRate;
  final int lowStockCount;

  factory DashboardKpis.fromJson(Map<String, dynamic> json) {
    return DashboardKpis(
      salesTotal: (json['salesTotal'] ?? 0).toDouble(),
      purchaseTotal: (json['purchaseTotal'] ?? 0).toDouble(),
      grossSpread: (json['grossSpread'] ?? 0).toDouble(),
      activeCustomers: json['activeCustomers'] ?? 0,
      openLeads: json['openLeads'] ?? 0,
      winRate: (json['winRate'] ?? 0).toDouble(),
      lowStockCount: json['lowStockCount'] ?? 0,
    );
  }
}
