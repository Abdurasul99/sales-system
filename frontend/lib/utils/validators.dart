class Validators {
  Validators._();

  static String? required(String? value, {String fieldName = 'Поле'}) {
    if (value == null || value.trim().isEmpty) return '$fieldName обязательно';
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) return 'Введите email';
    final ok = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value.trim());
    return ok ? null : 'Введите корректный email';
  }

  static String? minLength(String? value, int min, {String fieldName = 'Поле'}) {
    if (value == null || value.length < min) {
      return '$fieldName должно быть не меньше $min символов';
    }
    return null;
  }

  static String? number(String? value) {
    if (value == null || value.trim().isEmpty) return 'Обязательное поле';
    return num.tryParse(value) == null ? 'Введите число' : null;
  }
}
