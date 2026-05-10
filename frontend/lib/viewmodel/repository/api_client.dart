import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/utils/local_storage.dart';

class ApiClient {
  ApiClient({Dio? dio, LocalStorage? storage})
      : dio = dio ??
            Dio(BaseOptions(
              baseUrl: kApiBaseUrl,
              connectTimeout: kConnectTimeout,
              receiveTimeout: kReceiveTimeout,
              headers: {'Content-Type': 'application/json'},
            )) {
    final localStorage = storage ?? LocalStorage();
    this.dio.interceptors.add(InterceptorsWrapper(
          onRequest: (options, handler) {
            final token = localStorage.token;
            if (token != null) {
              options.headers['x-access-token'] = token;
            }
            handler.next(options);
          },
          onError: (e, handler) {
            if (e.response?.statusCode == 401) {
              localStorage.clearAuth();
            }
            handler.next(e);
          },
        ));
  }

  final Dio dio;
}
