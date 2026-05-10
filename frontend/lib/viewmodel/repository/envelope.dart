import 'package:dio/dio.dart';

/// Backend response envelope:
///   { code, message, additionalMessage, responseTime, body }
/// `code == "0000"` indicates success.
///
/// Validates the envelope, throws a `DioException` carrying the original
/// envelope for non-success codes, and returns the `body` map on success.
Map<String, dynamic> unwrapEnvelope(dynamic raw) {
  final envelope = Map<String, dynamic>.from(raw as Map);
  final code = envelope['code']?.toString() ?? '';
  if (code != '0000') {
    throw DioException(
      requestOptions: RequestOptions(path: ''),
      response: Response(
        requestOptions: RequestOptions(path: ''),
        statusCode: 400,
        data: envelope,
      ),
      message: envelope['message']?.toString() ?? 'Request failed',
    );
  }
  final body = envelope['body'];
  if (body == null) {
    throw StateError('Response envelope has no body');
  }
  return Map<String, dynamic>.from(body as Map);
}
