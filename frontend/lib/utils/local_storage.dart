import 'package:get_storage/get_storage.dart';

class LocalStorage {
  LocalStorage([GetStorage? box]) : _box = box ?? GetStorage();

  final GetStorage _box;

  static const _kToken = 'auth_token';
  static const _kUser = 'auth_user';

  String? get token => _box.read<String>(_kToken);
  set token(String? value) {
    if (value == null) {
      _box.remove(_kToken);
    } else {
      _box.write(_kToken, value);
    }
  }

  Map<String, dynamic>? get user {
    final raw = _box.read(_kUser);
    return raw is Map ? Map<String, dynamic>.from(raw) : null;
  }

  set user(Map<String, dynamic>? value) {
    if (value == null) {
      _box.remove(_kUser);
    } else {
      _box.write(_kUser, value);
    }
  }

  void clearAuth() {
    _box.remove(_kToken);
    _box.remove(_kUser);
  }
}
