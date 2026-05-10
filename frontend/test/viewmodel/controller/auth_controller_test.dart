import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:sales_system/model/user_model.dart';
import 'package:sales_system/utils/local_storage.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';
import 'package:sales_system/viewmodel/repository/auth_repository.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

class FakeLocalStorage implements LocalStorage {
  String? _token;
  Map<String, dynamic>? _user;
  bool cleared = false;

  @override
  String? get token => _token;
  @override
  set token(String? value) => _token = value;

  @override
  Map<String, dynamic>? get user => _user;
  @override
  set user(Map<String, dynamic>? value) => _user = value;

  @override
  void clearAuth() {
    _token = null;
    _user = null;
    cleared = true;
  }
}

const _alice = UserModel(
  id: 'u1',
  name: 'Alice',
  username: 'alice',
  email: 'a@b.com',
  role: 'admin',
  roleLabel: 'Administrator',
);

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late MockAuthRepository repo;
  late FakeLocalStorage storage;
  late AuthController controller;
  late List<String> navigatedRoutes;

  setUp(() {
    repo = MockAuthRepository();
    storage = FakeLocalStorage();
    navigatedRoutes = <String>[];
    controller = AuthController(
      repository: repo,
      storage: storage,
      navigateTo: navigatedRoutes.add,
    );
  });

  tearDown(() {
    controller.onClose();
  });

  group('AuthController.login', () {
    test('on success: persists token+user, sets user.value, navigates to /home', () async {
      when(() => repo.login(login: 'alice', password: 'secret'))
          .thenAnswer((_) async => (user: _alice, token: 'jwt'));

      final ok = await controller.login(login: 'alice', password: 'secret');

      expect(ok, isTrue);
      expect(controller.isLoading.value, isFalse);
      expect(controller.errorMessage.value, isNull);
      expect(controller.user.value, equals(_alice));
      expect(storage.token, 'jwt');
      expect(storage.user, isNotNull);
      expect(navigatedRoutes, ['/home']);
    });

    test('on DioException: extracts backend message and stays on page', () async {
      when(() => repo.login(login: any(named: 'login'), password: any(named: 'password')))
          .thenThrow(DioException(
        requestOptions: RequestOptions(path: ''),
        response: Response(
          statusCode: 400,
          data: {'code': '8003', 'message': 'Invalid credentials'},
          requestOptions: RequestOptions(path: ''),
        ),
      ));

      final ok = await controller.login(login: 'alice', password: 'wrong');

      expect(ok, isFalse);
      expect(controller.errorMessage.value, 'Invalid credentials');
      expect(controller.isLoading.value, isFalse);
      expect(navigatedRoutes, isEmpty);
      expect(storage.token, isNull);
    });

    test('toggles isLoading during the call', () async {
      when(() => repo.login(login: any(named: 'login'), password: any(named: 'password')))
          .thenAnswer((_) async {
        expect(controller.isLoading.value, isTrue);
        return (user: _alice, token: 't');
      });

      await controller.login(login: 'x', password: 'y');
      expect(controller.isLoading.value, isFalse);
    });
  });

  group('AuthController.register', () {
    test('on success: persists and navigates home', () async {
      const bob = UserModel(
        id: 'u2',
        name: 'Bob',
        username: 'bob',
        email: 'b@b.com',
        role: 'user',
        roleLabel: '',
      );
      when(() => repo.register(
            name: 'Bob',
            username: 'bob',
            email: 'b@b.com',
            password: 'pass1234',
          )).thenAnswer((_) async => (user: bob, token: 'jwt2'));

      final ok = await controller.register(
        name: 'Bob',
        username: 'bob',
        email: 'b@b.com',
        password: 'pass1234',
      );

      expect(ok, isTrue);
      expect(storage.token, 'jwt2');
      expect(controller.user.value, bob);
      expect(navigatedRoutes, ['/home']);
    });
  });

  group('AuthController.logout', () {
    test('clears storage and navigates to /login', () {
      storage.token = 'old';
      storage.user = {'id': '1'};
      controller.user.value = _alice;

      controller.logout();

      expect(storage.cleared, isTrue);
      expect(storage.token, isNull);
      expect(controller.user.value, isNull);
      expect(navigatedRoutes, ['/login']);
    });
  });

  group('AuthController.onInit', () {
    test('rehydrates user from storage when present', () {
      storage.user = {
        '_id': '99',
        'name': 'Cached',
        'username': 'cached',
        'email': 'c@x.y',
        'role': 'manager',
        'roleLabel': 'Менеджер',
      };

      controller.onInit();

      expect(controller.user.value, isNotNull);
      expect(controller.user.value!.id, '99');
      expect(controller.user.value!.username, 'cached');
      expect(controller.user.value!.role, 'manager');
    });

    test('leaves user null when storage empty', () {
      controller.onInit();
      expect(controller.user.value, isNull);
    });
  });
}
