import 'package:flutter_test/flutter_test.dart';
import 'package:sales_system/model/product_model.dart';

void main() {
  group('ProductModel', () {
    test('fromJson parses fields and applies defaults', () {
      final p = ProductModel.fromJson({
        '_id': '7',
        'name': 'Widget',
        'sku': 'W-1',
        'price': 100,
      });

      expect(p.id, '7');
      expect(p.name, 'Widget');
      expect(p.sku, 'W-1');
      expect(p.price, 100);
      expect(p.currency, 'UZS');
      expect(p.stock, 0);
      expect(p.category, 'general');
      expect(p.description, '');
      expect(p.isActive, true);
    });

    test('fromJson respects provided currency, stock, category, isActive', () {
      final p = ProductModel.fromJson({
        '_id': '1',
        'name': 'A',
        'sku': 'A',
        'price': 1.5,
        'currency': 'USD',
        'stock': 12,
        'category': 'beverages',
        'description': 'tasty',
        'isActive': false,
      });

      expect(p.currency, 'USD');
      expect(p.stock, 12);
      expect(p.category, 'beverages');
      expect(p.description, 'tasty');
      expect(p.isActive, false);
    });

    test('toCreateJson omits id and includes all writable fields', () {
      const p = ProductModel(
        id: '1',
        name: 'A',
        sku: 'A',
        price: 5,
        currency: 'USD',
        stock: 2,
        category: 'x',
        description: 'd',
      );
      final json = p.toCreateJson();

      expect(json.containsKey('id'), isFalse);
      expect(json.containsKey('_id'), isFalse);
      expect(json['name'], 'A');
      expect(json['sku'], 'A');
      expect(json['price'], 5);
      expect(json['currency'], 'USD');
      expect(json['stock'], 2);
      expect(json['category'], 'x');
      expect(json['description'], 'd');
      expect(json['isActive'], true);
    });

    test('copyWith preserves id and replaces selected fields', () {
      const p = ProductModel(
        id: 'keep',
        name: 'A',
        sku: 'X',
        price: 0,
        currency: 'UZS',
        stock: 0,
        category: 'g',
      );
      final p2 = p.copyWith(name: 'B', price: 99);

      expect(p2.id, 'keep');
      expect(p2.name, 'B');
      expect(p2.sku, 'X');
      expect(p2.price, 99);
    });

    test('equality is value-based', () {
      const a = ProductModel(
          id: '1', name: 'A', sku: 'A', price: 1, currency: 'UZS', stock: 0, category: 'g');
      const b = ProductModel(
          id: '1', name: 'A', sku: 'A', price: 1, currency: 'UZS', stock: 0, category: 'g');
      expect(a, equals(b));
    });
  });
}
