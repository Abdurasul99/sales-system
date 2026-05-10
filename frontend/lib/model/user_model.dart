class UserModel {
  const UserModel({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.role,
    required this.roleLabel,
  });

  final String id;
  final String name;
  final String username;
  final String email;
  final String role;
  final String roleLabel;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? 'user').toString(),
      roleLabel: (json['roleLabel'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'username': username,
        'email': email,
        'role': role,
        'roleLabel': roleLabel,
      };

  @override
  bool operator ==(Object other) =>
      other is UserModel &&
      id == other.id &&
      name == other.name &&
      username == other.username &&
      email == other.email &&
      role == other.role &&
      roleLabel == other.roleLabel;

  @override
  int get hashCode =>
      Object.hash(id, name, username, email, role, roleLabel);
}
