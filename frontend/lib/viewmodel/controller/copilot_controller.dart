import 'package:dio/dio.dart';
import 'package:get/get.dart';

import 'package:sales_system/model/copilot_message_model.dart';
import 'package:sales_system/viewmodel/repository/copilot_repository.dart';

class CopilotController extends GetxController {
  CopilotController({required CopilotRepository repository})
      : _repo = repository;

  final CopilotRepository _repo;

  final isOpen = false.obs;
  final isMinimized = false.obs;
  final isLoading = false.obs;
  final hasUnread = false.obs;
  final messages = <CopilotMessage>[].obs;
  final suggestions = <String>[].obs;
  final activePage = 'default'.obs;
  final pageTitle = 'Система'.obs;

  String _userFirstName = 'друг';

  void setActivePage(String page, String title, {String? userName}) {
    if (userName != null && userName.trim().isNotEmpty) {
      _userFirstName = userName.split(' ').first;
    }
    if (activePage.value == page) return;
    activePage.value = page;
    pageTitle.value = title;
    _loadSuggestions();
  }

  Future<void> _loadSuggestions() async {
    try {
      final s = await _repo.suggestions(page: activePage.value);
      suggestions.value = s.items;
      pageTitle.value = s.pageTitle;
    } on DioException {
      // Silent — suggestions are non-critical
    }
  }

  void open() {
    isOpen.value = true;
    isMinimized.value = false;
    hasUnread.value = false;
    if (messages.isEmpty) _greet();
    if (suggestions.isEmpty) _loadSuggestions();
  }

  void close() {
    isOpen.value = false;
  }

  void toggleMinimize() {
    isMinimized.value = !isMinimized.value;
  }

  void resetConversation() {
    messages.clear();
    _greet();
  }

  void _greet() {
    final greeting = 'Привет, $_userFirstName! 👋 Я ваш AI-копилот.\n\n'
        'Сейчас вы на странице «${pageTitle.value}». Чем могу помочь?\n\n'
        'Можете написать вопрос или выбрать подсказку ниже.';
    messages.add(
      CopilotMessage(role: CopilotRole.assistant, content: greeting),
    );
  }

  Future<void> send(String text) async {
    final clean = text.trim();
    if (clean.isEmpty || isLoading.value) return;

    messages.add(CopilotMessage(role: CopilotRole.user, content: clean));
    isLoading.value = true;
    try {
      final reply = await _repo.chat(
        message: clean,
        page: activePage.value,
        history: messages
            .where((m) => m.role == CopilotRole.user || !m.isStreaming)
            .toList(),
      );
      messages.add(CopilotMessage(
        role: CopilotRole.assistant,
        content: reply.content,
      ));
      if (!isOpen.value) hasUnread.value = true;
    } on DioException catch (e) {
      messages.add(CopilotMessage(
        role: CopilotRole.assistant,
        content: 'Не удалось получить ответ: ${_readError(e)}',
      ));
    } catch (e) {
      messages.add(const CopilotMessage(
        role: CopilotRole.assistant,
        content: 'Что-то пошло не так. Попробуйте ещё раз.',
      ));
    } finally {
      isLoading.value = false;
    }
  }

  String _readError(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['message'] != null) {
      return data['message'].toString();
    }
    return e.message ?? 'Network error';
  }
}
