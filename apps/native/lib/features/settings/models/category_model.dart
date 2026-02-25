class CategoryModel {
  final String id;
  final String name;
  final String type; // 'income' | 'expense'
  final int sortOrder;

  CategoryModel({
    required this.id,
    required this.name,
    required this.type,
    required this.sortOrder,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      sortOrder: json['sortOrder'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type,
    'sortOrder': sortOrder,
  };

  CategoryModel copyWith({String? name, String? type, int? sortOrder}) {
    return CategoryModel(
      id: id,
      name: name ?? this.name,
      type: type ?? this.type,
      sortOrder: sortOrder ?? this.sortOrder,
    );
  }
}
