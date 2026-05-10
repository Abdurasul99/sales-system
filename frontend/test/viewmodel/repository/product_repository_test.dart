import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/viewmodel/repository/product_repository.dart';

class MockDio extends Mock implements Dio {}

Response<T> _ok<T>(T data, String path) => Response<T>(
      data: data,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );

Map<String, dynamic> _envelope(dynamic body) => {
      'code': '0000',
      'message': 'success',
      'additionalMessage': '',
      'responseTime': '2026-05-10 00:00:00',
      'body': body,
    };

void main() {
  late MockDio dio;
  late ProductRepository repo;

  setUp(() {
    dio = MockDio();
    repo = ProductRepository(dio);
  });

  group('ProductRepository.list', () {
    test('parses items array from envelope.body and forwards search query', () async {
      when(() => dio.get('/products', queryParameters: any(named: 'queryParameters')))
          .thenAnswer((_) async => _ok(
                _envelope({
                  'items': [
                    {
                      'id': '1',
                      'name': 'A',
                      'sku': 'A',
                      'price': 10,
                      'currency': 'UZS',
                      'stock': 5,
                      'category': 'general',
                    },
                    {
                      'id': '2',
                      'name': 'B',
                      'sku': 'B',
                      'price': 20,
                      'currency': 'UZS',
                      'stock': 1,
                      'category': 'general',
                    },
                  ],
                  'total': 2,
                }),
                '/products',
              ));

      final products = await repo.list(q: 'pen');

      expect(products, hasLength(2));
      expect(products.first.id, '1');
      expect(products.last.name, 'B');
      verify(() => dio.get('/products', queryParameters: {'q': 'pen'})).called(1);
    });

    test('returns empty list when items missing from envelope', () async {
      when(() => dio.get('/products', queryParameters: any(named: 'queryParameters')))
          .thenAnswer((_) async => _ok(_envelope({'total': 0}), '/products'));

      final products = await repo.list();

      expect(products, isEmpty);
      verify(() => dio.get('/products', queryParameters: <String, dynamic>{})).called(1);
    });
  });

  group('ProductRepository.create', () {
    test('posts toCreateJson and returns parsed model from envelope.body', () async {
      const draft = ProductModel(
        id: '',
        name: 'New',
        sku: 'NEW-1',
        price: 50,
        currency: 'UZS',
        stock: 3,
        category: 'general',
      );
      when(() => dio.post('/products', data: any(named: 'data'))).thenAnswer(
        (_) async => _ok(
          _envelope({
            'id': 'created-id',
            'name': 'New',
            'sku': 'NEW-1',
            'price': 50,
            'currency': 'UZS',
            'stock': 3,
            'category': 'general',
          }),
          '/products',
        ),
      );

      final created = await repo.create(draft);

      expect(created.id, 'created-id');
      expect(created.name, 'New');
      verify(() => dio.post('/products', data: draft.toCreateJson())).called(1);
    });
  });

  group('ProductRepository.update', () {
    test('puts to /products/:id and parses envelope.body', () async {
      const draft = ProductModel(
        id: '',
        name: 'Edit',
        sku: 'X',
        price: 1,
        currency: 'UZS',
        stock: 0,
        category: 'g',
      );
      when(() => dio.put('/products/abc', data: any(named: 'data'))).thenAnswer(
        (_) async => _ok(
          _envelope({
            'id': 'abc',
            'name': 'Edit',
            'sku': 'X',
            'price': 1,
            'currency': 'UZS',
            'stock': 0,
            'category': 'g',
          }),
          '/products/abc',
        ),
      );

      final updated = await repo.update('abc', draft);

      expect(updated.id, 'abc');
      expect(updated.name, 'Edit');
      verify(() => dio.put('/products/abc', data: draft.toCreateJson())).called(1);
    });
  });

  group('ProductRepository.remove', () {
    test('calls delete on /products/:id', () async {
      when(() => dio.delete('/products/xyz'))
          .thenAnswer((_) async => _ok(_envelope({'id': 'xyz'}), '/products/xyz'));

      await repo.remove('xyz');

      verify(() => dio.delete('/products/xyz')).called(1);
    });
  });
}
