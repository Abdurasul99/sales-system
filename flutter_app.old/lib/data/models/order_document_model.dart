class OrderDocumentModel {
  OrderDocumentModel({
    required this.id,
    required this.number,
    required this.status,
    required this.currencyCode,
    required this.total,
    required this.createdAt,
    required this.partyName,
    required this.linesCount,
    this.type,
  });

  final String id;
  final String number;
  final String status;
  final String currencyCode;
  final double total;
  final DateTime createdAt;
  final String partyName;
  final int linesCount;
  final String? type;

  factory OrderDocumentModel.fromSalesJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>?;
    final lines = json['lines'] as List<dynamic>? ?? [];

    return OrderDocumentModel(
      id: json['id'] as String,
      number: json['number'] as String,
      status: json['status'] as String,
      currencyCode: json['currencyCode'] as String,
      total: double.tryParse('${json['total']}') ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      partyName: customer?['name'] ?? 'Walk-in customer',
      linesCount: lines.length,
    );
  }

  factory OrderDocumentModel.fromPurchaseJson(Map<String, dynamic> json) {
    final supplier = json['supplier'] as Map<String, dynamic>?;
    final lines = json['lines'] as List<dynamic>? ?? [];

    return OrderDocumentModel(
      id: json['id'] as String,
      number: json['number'] as String,
      status: json['status'] as String,
      currencyCode: json['currencyCode'] as String,
      total: double.tryParse('${json['total']}') ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      partyName: supplier?['name'] ?? 'Supplier',
      linesCount: lines.length,
    );
  }

  factory OrderDocumentModel.fromReturnJson(Map<String, dynamic> json) {
    final salesOrder = json['salesOrder'] as Map<String, dynamic>?;
    final lines = json['lines'] as List<dynamic>? ?? [];

    return OrderDocumentModel(
      id: json['id'] as String,
      number: json['number'] as String,
      status: json['status'] as String,
      currencyCode: json['currencyCode'] as String,
      total: double.tryParse('${json['total']}') ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      partyName: salesOrder?['number'] ?? 'Ad hoc return',
      linesCount: lines.length,
      type: json['type'] as String?,
    );
  }
}
