import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:sales_system/viewmodel/repository/auth_repository.dart';

class MockDio extends Mock implements Dio {}

Response<T> _ok<T>(T data, String path) => Response<T>(
      data: data,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );

Map<String, dynamic> _envelope(Map<String, dynamic> body) => {
      'code': '0000',
      'message': 'success',
      'additionalMessage': '',
      'responseTime': '2026-05-10 00:00:00',
      'body': body,
    };

Map<String, dynamic> _envelopeError({
  required String code,
  required String message,
}) =>
    {
      'code': code,
      'message': message,
      'additionalMessage': '',
      'responseTime': '2026-05-10 00:00:00',
      'body': null,
    };

Map<String, dynamic> _userJson({
  String id = 'u1',
  String name = 'Alice',
  String username = 'alice',
  String email = 'a@b.com',
  String role = 'admin',
  String roleLabel = 'Administrator',
}) =>
    {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'role': role,
      'roleLabel': roleLabel,
    };

void main() {
  late MockDio dio;
  late AuthRepository repo;

  setUp(() {
    dio = MockDio();
    repo = AuthRepository(dio);
  });

  group('AuthRepository.login', () {
    test('parses user and token from envelope.body', () async {
      when(() => dio.post('/auth/login', data: any(named: 'data'))).thenAnswer(
        (_) async => _ok(
          _envelope({
            'user': _userJson(),
            'token': 'jwt-token',
          }),
          '/auth/login',
        ),
      );

      final result = await repo.login(login: 'alice', password: 'secret');

      expect(result.token, 'jwt-token');
      expect(result.user.username, 'alice');
      expect(result.user.role, 'admin');

      verify(() => dio.post('/auth/login',
              data: {'login': 'alice', 'password': 'secret'}))
          .called(1);
    });

    test('throws DioException when envelope code != "0000"', () async {
      when(() => dio.post('/auth/login', data: any(named: 'data'))).thenAnswer(
        (_) async => _ok(
          _envelopeError(code: '8003', message: 'Invalid credentials'),
          '/auth/login',
        ),
      );

      expect(
        () => repo.login(login: 'alice', password: 'wrong'),
        throwsA(isA<DioException>()),
      );
    });

    test('rethrows DioException raised by Dio itself', () async {
      when(() => dio.post('/auth/login', data: any(named: 'data'))).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: '/auth/login'),
          response: Response(
            statusCode: 401,
            data: _envelopeError(code: '401', message: 'token expired'),
            requestOptions: RequestOptions(path: '/auth/login'),
          ),
        ),
      );

      expect(
        () => repo.login(login: 'alice', password: 'wrong'),
        throwsA(isA<DioException>()),
      );
    });
  });

  group('AuthRepository.register', () {
    test('sends payload (with optional email) and parses envelope.body', () async {
      when(() => dio.post('/auth/register', data: any(named: 'data'))).thenAnswer(
        (_) async => _ok(
          _envelope({
            'user': _userJson(
              id: 'u2',
              name: 'Bob',
              username: 'bob',
              email: 'b@b.com',
              role: 'user',
              roleLabel: '',
            ),
            'token': 'tok',
          }),
          '/auth/register',
        ),
      );

      final result = await repo.register(
        name: 'Bob',
        username: 'bob',
        email: 'b@b.com',
        password: 'pass1234',
      );

      expect(result.user.name, 'Bob');
      expect(result.user.username, 'bob');
      expect(result.token, 'tok');
      verify(() => dio.post('/auth/register', data: {
            'name': 'Bob',
            'username': 'bob',
            'email': 'b@b.com',
            'password': 'pass1234',
          })).called(1);
    });

    test('omits email from payload when not provided', () async {
      when(() => dio.post('/auth/register', data: any(named: 'data'))).thenAnswer(
        (_) async => _ok(
          _envelope({
            'user': _userJson(
                id: 'u3', name: 'C', username: 'c', email: '', role: 'user', roleLabel: ''),
            'token': 't',
          }),
          '/auth/register',
        ),
      );

      await repo.register(name: 'C', username: 'c', password: 'pass1234');

      verify(() => dio.post('/auth/register', data: {
            'name': 'C',
            'username': 'c',
            'password': 'pass1234',
          })).called(1);
    });
  });

  group('AuthRepository.me', () {
    test('returns parsed UserModel from envelope.body.user', () async {
      when(() => dio.get('/auth/me')).thenAnswer(
        (_) async => _ok(
          _envelope({
            'user': _userJson(id: 'me', name: 'Me', username: 'me', email: 'me@x'),
          }),
          '/auth/me',
        ),
      );

      final user = await repo.me();
      expect(user.id, 'me');
      expect(user.username, 'me');
    });
  });
}
