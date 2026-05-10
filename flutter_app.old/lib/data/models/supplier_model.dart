class SupplierModel {
  SupplierModel({
    required this.id,
    required this.code,
    required this.name,
    required this.contactName,
    required this.phone,
    required this.averageLeadDays,
  });

  final String id;
  final String code;
  final String name;
  final String contactName;
  final String phone;
  final int averageLeadDays;

  factory SupplierModel.fromJson(Map<String, dynamic> json) {
    return SupplierModel(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      contactName: json['contactName'] ?? '-',
      phone: json['phone'] ?? '-',
      averageLeadDays: json['averageLeadDays'] ?? 0,
    );
  }
}
