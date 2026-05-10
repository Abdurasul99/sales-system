import 'package:dio/dio.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/copilot_message_model.dart';
import 'envelope.dart';

class CopilotSuggestions {
  const CopilotSuggestions({
    required this.page,
    required this.pageTitle,
    required this.items,
  });
  final String page;
  final String pageTitle;
  final List<String> items;

  factory CopilotSuggestions.fromJson(Map<String, dynamic> json) {
    return CopilotSuggestions(
      page: (json['page'] ?? 'default').toString(),
      pageTitle: (json['pageTitle'] ?? 'Система').toString(),
      items: (json['suggestions'] as List? ?? const [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class CopilotReply {
  const CopilotReply({required this.content, required this.source});
  final String content;
  final String source;

  factory CopilotReply.fromJson(Map<String, dynamic> json) => CopilotReply(
        content: (json['content'] ?? '').toString(),
        source: (json['source'] ?? 'fallback').toString(),
      );
}

class CopilotRepository {
  CopilotRepository(this._dio);
  final Dio _dio;

  Future<CopilotSuggestions> suggestions({String page = 'default'}) async {
    final res = await _dio.get(
      kPathAiSuggestions,
      queryParameters: {'page': page},
    );
    return CopilotSuggestions.fromJson(unwrapEnvelope(res.data));
  }

  Future<CopilotReply> chat({
    required String message,
    required String page,
    required List<CopilotMessage> history,
  }) async {
    final res = await _dio.post(
      kPathAiChat,
      data: {
        'message': message,
        'page': page,
        'history': history.map((m) => m.toApiJson()).toList(),
      },
    );
    return CopilotReply.fromJson(unwrapEnvelope(res.data));
  }
}
