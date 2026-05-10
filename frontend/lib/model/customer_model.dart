class CustomerModel {
  const CustomerModel({
    required this.id,
    required this.name,
    this.phone = '',
    this.email = '',
    this.company = '',
    this.address = '',
    this.notes = '',
    this.totalPurchases = 0,
    this.totalSpent = 0,
    this.lastPurchaseAt,
    this.isActive = true,
  });

  final String id;
  final String name;
  final String phone;
  final String email;
  final String company;
  final String address;
  final String notes;
  final num totalPurchases;
  final num totalSpent;
  final DateTime? lastPurchaseAt;
  final bool isActive;

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      company: (json['company'] ?? '').toString(),
      address: (json['address'] ?? '').toString(),
      notes: (json['notes'] ?? '').toString(),
      totalPurchases: (json['totalPurchases'] is num) ? json['totalPurchases'] as num : 0,
      totalSpent: (json['totalSpent'] is num) ? json['totalSpent'] as num : 0,
      lastPurchaseAt: DateTime.tryParse(json['lastPurchaseAt']?.toString() ?? ''),
      isActive: json['isActive'] is bool ? json['isActive'] as bool : true,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        if (phone.isNotEmpty) 'phone': phone,
        if (email.isNotEmpty) 'email': email,
        if (company.isNotEmpty) 'company': company,
        if (address.isNotEmpty) 'address': address,
        if (notes.isNotEmpty) 'notes': notes,
      };
}
