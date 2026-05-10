class SupplierModel {
  const SupplierModel({
    required this.id,
    required this.name,
    this.contactPerson = '',
    this.phone = '',
    this.email = '',
    this.address = '',
    this.category = '',
    this.notes = '',
    this.totalOrders = 0,
    this.totalSpent = 0,
    this.lastOrderAt,
    this.isActive = true,
  });

  final String id;
  final String name;
  final String contactPerson;
  final String phone;
  final String email;
  final String address;
  final String category;
  final String notes;
  final num totalOrders;
  final num totalSpent;
  final DateTime? lastOrderAt;
  final bool isActive;

  factory SupplierModel.fromJson(Map<String, dynamic> json) {
    return SupplierModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      contactPerson: (json['contactPerson'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      address: (json['address'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      notes: (json['notes'] ?? '').toString(),
      totalOrders: (json['totalOrders'] is num) ? json['totalOrders'] as num : 0,
      totalSpent: (json['totalSpent'] is num) ? json['totalSpent'] as num : 0,
      lastOrderAt: DateTime.tryParse(json['lastOrderAt']?.toString() ?? ''),
      isActive: json['isActive'] is bool ? json['isActive'] as bool : true,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        if (contactPerson.isNotEmpty) 'contactPerson': contactPerson,
        if (phone.isNotEmpty) 'phone': phone,
        if (email.isNotEmpty) 'email': email,
        if (address.isNotEmpty) 'address': address,
        if (category.isNotEmpty) 'category': category,
        if (notes.isNotEmpty) 'notes': notes,
      };
}
