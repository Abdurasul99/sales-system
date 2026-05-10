class CategoryModel {
  const CategoryModel({
    required this.id,
    required this.name,
    this.slug = '',
    this.description = '',
    this.color = '#9333EA',
    this.icon = 'folder',
    this.isActive = true,
  });

  final String id;
  final String name;
  final String slug;
  final String description;
  final String color;
  final String icon;
  final bool isActive;

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      slug: (json['slug'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      color: (json['color'] ?? '#9333EA').toString(),
      icon: (json['icon'] ?? 'folder').toString(),
      isActive: json['isActive'] is bool ? json['isActive'] as bool : true,
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'name': name,
        if (slug.isNotEmpty) 'slug': slug,
        'description': description,
        'color': color,
        'icon': icon,
        'isActive': isActive,
      };

  CategoryModel copyWith({
    String? name,
    String? slug,
    String? description,
    String? color,
    String? icon,
    bool? isActive,
  }) =>
      CategoryModel(
        id: id,
        name: name ?? this.name,
        slug: slug ?? this.slug,
        description: description ?? this.description,
        color: color ?? this.color,
        icon: icon ?? this.icon,
        isActive: isActive ?? this.isActive,
      );

  @override
  bool operator ==(Object other) =>
      other is CategoryModel &&
      id == other.id &&
      name == other.name &&
      slug == other.slug;

  @override
  int get hashCode => Object.hash(id, name, slug);
}
