import 'package:flutter_test/flutter_test.dart';
import 'package:sales_system/utils/validators.dart';

void main() {
  group('Validators.required', () {
    test('returns null for non-empty value', () {
      expect(Validators.required('hello'), isNull);
    });

    test('returns error for null/empty/whitespace', () {
      expect(Validators.required(null), isNotNull);
      expect(Validators.required(''), isNotNull);
      expect(Validators.required('   '), isNotNull);
    });
  });

  group('Validators.email', () {
    test('accepts valid email', () {
      expect(Validators.email('user@example.com'), isNull);
    });

    test('rejects invalid emails', () {
      expect(Validators.email(''), isNotNull);
      expect(Validators.email('not-email'), isNotNull);
      expect(Validators.email('user@'), isNotNull);
      expect(Validators.email('@host.com'), isNotNull);
    });
  });

  group('Validators.minLength', () {
    test('accepts when length >= min', () {
      expect(Validators.minLength('abcdef', 6), isNull);
      expect(Validators.minLength('abcdefg', 6), isNull);
    });

    test('rejects when shorter than min or null', () {
      expect(Validators.minLength('abc', 6), isNotNull);
      expect(Validators.minLength(null, 1), isNotNull);
    });
  });

  group('Validators.number', () {
    test('accepts integers and decimals', () {
      expect(Validators.number('42'), isNull);
      expect(Validators.number('3.14'), isNull);
    });

    test('rejects non-numeric and empty', () {
      expect(Validators.number('abc'), isNotNull);
      expect(Validators.number(''), isNotNull);
      expect(Validators.number(null), isNotNull);
    });
  });
}
