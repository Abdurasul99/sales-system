class TransactionModel {
  const TransactionModel({
    required this.id,
    required this.kind,
    required this.date,
    required this.amount,
    this.currency = 'UZS',
    this.category = 'general',
    this.description = '',
    this.paymentMethod = 'cash',
    this.status = 'confirmed',
  });

  final String id;
  final String kind; // 'expense' | 'income'
  final DateTime date;
  final num amount;
  final String currency;
  final String category;
  final String description;
  final String paymentMethod;
  final String status;

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      kind: (json['kind'] ?? 'expense').toString(),
      date: DateTime.tryParse(json['date']?.toString() ?? '') ?? DateTime.now(),
      amount: (json['amount'] is num) ? json['amount'] as num : 0,
      currency: (json['currency'] ?? 'UZS').toString(),
      category: (json['category'] ?? 'general').toString(),
      description: (json['description'] ?? '').toString(),
      paymentMethod: (json['paymentMethod'] ?? 'cash').toString(),
      status: (json['status'] ?? 'confirmed').toString(),
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'amount': amount,
        'currency': currency,
        'category': category,
        'description': description,
        'paymentMethod': paymentMethod,
        if (status != 'confirmed') 'status': status,
      };
}

class FinanceCategorySlice {
  const FinanceCategorySlice({
    required this.category,
    required this.total,
    required this.count,
  });

  final String category;
  final num total;
  final num count;

  factory FinanceCategorySlice.fromJson(Map<String, dynamic> json) =>
      FinanceCategorySlice(
        category: (json['category'] ?? '').toString(),
        total: (json['total'] is num) ? json['total'] as num : 0,
        count: (json['count'] is num) ? json['count'] as num : 0,
      );
}

class FinanceSummary {
  const FinanceSummary({required this.total, required this.byCategory});

  final num total;
  final List<FinanceCategorySlice> byCategory;

  factory FinanceSummary.fromJson(Map<String, dynamic> json) => FinanceSummary(
        total: (json['total'] is num) ? json['total'] as num : 0,
        byCategory: ((json['byCategory'] as List?) ?? const [])
            .map((e) => FinanceCategorySlice.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList(),
      );

  static const empty = FinanceSummary(total: 0, byCategory: []);
}
