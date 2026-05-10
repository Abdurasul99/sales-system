class CustomerModel {
  CustomerModel({
    required this.id,
    required this.code,
    required this.name,
    required this.segment,
    required this.type,
    required this.phone,
  });

  final String id;
  final String code;
  final String name;
  final String segment;
  final String type;
  final String phone;

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    final segmentRef = json['segmentRef'] as Map<String, dynamic>?;

    return CustomerModel(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      segment: segmentRef?['name'] ?? json['segment'] ?? 'Unassigned',
      type: json['type'] ?? 'B2C',
      phone: json['phone'] ?? '-',
    );
  }
}
