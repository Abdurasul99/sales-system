import 'package:flutter_test/flutter_test.dart';
import 'package:sales_system/model/user_model.dart';

void main() {
  group('UserModel', () {
    test('fromJson maps Mongo _id, name, username, email, role, roleLabel', () {
      final user = UserModel.fromJson({
        '_id': 'abc123',
        'name': 'Alice',
        'username': 'alice',
        'email': 'alice@example.com',
        'role': 'admin',
        'roleLabel': 'Administrator',
      });

      expect(user.id, 'abc123');
      expect(user.name, 'Alice');
      expect(user.username, 'alice');
      expect(user.email, 'alice@example.com');
      expect(user.role, 'admin');
      expect(user.roleLabel, 'Administrator');
    });

    test('fromJson falls back to id when _id missing', () {
      final user = UserModel.fromJson({'id': '7', 'name': 'X', 'username': 'x'});
      expect(user.id, '7');
    });

    test('fromJson defaults role to "user" and empties optional fields', () {
      final user = UserModel.fromJson({
        '_id': '1',
        'name': 'Bob',
        'username': 'bob',
      });
      expect(user.role, 'user');
      expect(user.email, '');
      expect(user.roleLabel, '');
    });

    test('toJson produces a flat map', () {
      const user = UserModel(
        id: '1',
        name: 'A',
        username: 'a',
        email: 'a@b.com',
        role: 'manager',
        roleLabel: 'Manager',
      );
      expect(user.toJson(), {
        'id': '1',
        'name': 'A',
        'username': 'a',
        'email': 'a@b.com',
        'role': 'manager',
        'roleLabel': 'Manager',
      });
    });

    test('equality and hashCode', () {
      const a = UserModel(
          id: '1', name: 'A', username: 'a', email: 'a@b.com', role: 'user', roleLabel: '');
      const b = UserModel(
          id: '1', name: 'A', username: 'a', email: 'a@b.com', role: 'user', roleLabel: '');
      const c = UserModel(
          id: '2', name: 'A', username: 'a', email: 'a@b.com', role: 'user', roleLabel: '');
      expect(a, equals(b));
      expect(a.hashCode, b.hashCode);
      expect(a, isNot(equals(c)));
    });
  });
}
