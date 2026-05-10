enum CopilotRole { user, assistant }

class CopilotMessage {
  const CopilotMessage({
    required this.role,
    required this.content,
    this.isStreaming = false,
  });

  final CopilotRole role;
  final String content;
  final bool isStreaming;

  Map<String, dynamic> toApiJson() => {
        'role': role == CopilotRole.user ? 'user' : 'assistant',
        'content': content,
      };

  factory CopilotMessage.fromJson(Map<String, dynamic> json) {
    final r = (json['role'] ?? 'assistant').toString();
    return CopilotMessage(
      role: r == 'user' ? CopilotRole.user : CopilotRole.assistant,
      content: (json['content'] ?? '').toString(),
    );
  }
}
