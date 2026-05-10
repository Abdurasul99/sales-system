import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';
import 'package:sales_system/model/product_model.dart';
import 'package:sales_system/viewmodel/repository/product_repository.dart';

class MockProductRepository extends Mock implements ProductRepository {}

class _FakeProduct extends Fake implements ProductModel {}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() {
    registerFallbackValue(_FakeProduct());
  });

  late MockProductRepository repo;
  late ProductsController controller;
  late List<String> navigatedRoutes;
  late int popCount;

  setUp(() {
    repo = MockProductRepository();
    navigatedRoutes = <String>[];
    popCount = 0;
    controller = ProductsController(
      repository: repo,
      navigateTo: navigatedRoutes.add,
      pop: () => popCount++,
    );
  });

  tearDown(() {
    controller.onClose();
  });

  ProductModel sample(String id, {String name = 'A'}) => ProductModel(
        id: id,
        name: name,
        sku: 'SKU-$id',
        price: 10,
        currency: 'UZS',
        stock: 1,
        category: 'general',
      );

  group('ProductsController.fetch', () {
    test('populates products on success', () async {
      when(() => repo.list(q: any(named: 'q'), category: any(named: 'category')))
          .thenAnswer((_) async => [sample('1'), sample('2')]);

      final ok = await controller.fetch();

      expect(ok, isTrue);
      expect(controller.products, hasLength(2));
      expect(controller.products.first.id, '1');
      expect(controller.errorMessage.value, isNull);
      expect(controller.isLoading.value, isFalse);
    });

    test('records error from DioException', () async {
      when(() => repo.list(q: any(named: 'q'), category: any(named: 'category')))
          .thenThrow(DioException(
        requestOptions: RequestOptions(path: ''),
        response: Response(
          statusCode: 500,
          data: {'message': 'Server is down'},
          requestOptions: RequestOptions(path: ''),
        ),
      ));

      final ok = await controller.fetch();

      expect(ok, isFalse);
      expect(controller.errorMessage.value, 'Server is down');
      expect(controller.products, isEmpty);
    });

    test('passes search term to repository', () async {
      when(() => repo.list(q: 'pen', category: any(named: 'category')))
          .thenAnswer((_) async => []);

      controller.onSearchChanged('pen');
      await controller.fetch();

      verify(() => repo.list(q: 'pen', category: any(named: 'category'))).called(1);
    });
  });

  group('ProductsController.openCreateForm / openEditForm', () {
    test('openCreateForm clears form and navigates', () {
      controller.nameCtrl.text = 'leftover';
      controller.openCreateForm();

      expect(controller.editingId.value, isNull);
      expect(controller.nameCtrl.text, isEmpty);
      expect(navigatedRoutes, ['/products/form']);
    });

    test('openEditForm fills form with product values', () {
      final p = sample('42', name: 'Pen');
      controller.openEditForm(p);

      expect(controller.editingId.value, '42');
      expect(controller.nameCtrl.text, 'Pen');
      expect(controller.skuCtrl.text, 'SKU-42');
      expect(controller.priceCtrl.text, '10');
      expect(navigatedRoutes, ['/products/form']);
    });
  });

  group('ProductsController.save', () {
    test('creates new product when editingId is null', () async {
      controller.nameCtrl.text = 'New';
      controller.skuCtrl.text = 'NEW-1';
      controller.priceCtrl.text = '100';
      controller.stockCtrl.text = '5';
      controller.categoryCtrl.text = 'food';

      when(() => repo.create(any())).thenAnswer((_) async => sample('new'));
      when(() => repo.list(q: any(named: 'q'), category: any(named: 'category')))
          .thenAnswer((_) async => [sample('new')]);

      final ok = await controller.save();

      expect(ok, isTrue);
      verify(() => repo.create(any())).called(1);
      verifyNever(() => repo.update(any(), any()));
      expect(popCount, 1);
    });

    test('updates existing product when editingId set', () async {
      controller.editingId.value = 'abc';
      controller.nameCtrl.text = 'Edited';
      controller.skuCtrl.text = 'X';
      controller.priceCtrl.text = '5';
      controller.stockCtrl.text = '0';

      when(() => repo.update('abc', any())).thenAnswer((_) async => sample('abc'));
      when(() => repo.list(q: any(named: 'q'), category: any(named: 'category')))
          .thenAnswer((_) async => []);

      final ok = await controller.save();

      expect(ok, isTrue);
      verify(() => repo.update('abc', any())).called(1);
      verifyNever(() => repo.create(any()));
    });

    test('records DioException message and does not pop', () async {
      controller.nameCtrl.text = 'X';
      controller.skuCtrl.text = 'X';
      controller.priceCtrl.text = '1';
      controller.stockCtrl.text = '0';

      when(() => repo.create(any())).thenThrow(DioException(
        requestOptions: RequestOptions(path: ''),
        response: Response(
          statusCode: 409,
          data: {'message': 'SKU already exists'},
          requestOptions: RequestOptions(path: ''),
        ),
      ));

      final ok = await controller.save();

      expect(ok, isFalse);
      expect(controller.errorMessage.value, 'SKU already exists');
      expect(popCount, 0);
    });
  });

  group('ProductsController.remove', () {
    test('removes product from list on success', () async {
      controller.products.value = [sample('1'), sample('2')];
      when(() => repo.remove('1')).thenAnswer((_) async {});

      final ok = await controller.remove(sample('1'));

      expect(ok, isTrue);
      expect(controller.products, hasLength(1));
      expect(controller.products.first.id, '2');
    });

    test('records error and keeps product on Dio failure', () async {
      controller.products.value = [sample('1')];
      when(() => repo.remove('1')).thenThrow(DioException(
        requestOptions: RequestOptions(path: ''),
        response: Response(
          statusCode: 403,
          data: {'message': 'Forbidden'},
          requestOptions: RequestOptions(path: ''),
        ),
      ));

      final ok = await controller.remove(sample('1'));

      expect(ok, isFalse);
      expect(controller.errorMessage.value, 'Forbidden');
      expect(controller.products, hasLength(1));
    });
  });
}
