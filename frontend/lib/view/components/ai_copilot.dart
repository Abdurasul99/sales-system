import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/copilot_message_model.dart';
import 'package:sales_system/viewmodel/controller/copilot_controller.dart';

class AICopilot extends StatelessWidget {
  const AICopilot({super.key});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final ctrl = Get.find<CopilotController>();
      if (!ctrl.isOpen.value) return const _LauncherButton();
      return const _ChatPanel();
    });
  }
}

// ─────────────────────────────────────────────────────────
// Floating launcher button
// ─────────────────────────────────────────────────────────

class _LauncherButton extends StatelessWidget {
  const _LauncherButton();

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.find<CopilotController>();
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: ctrl.open,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF9333EA), Color(0xFF6366F1)],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: kPrimaryColor.withValues(alpha: 0.4),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.auto_awesome, size: 20, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'AI Копилот',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ), // const Row

              Obx(() {
                if (!ctrl.hasUnread.value) return const SizedBox.shrink();
                return Positioned(
                  right: -4,
                  top: -4,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: const BoxDecoration(
                      color: kErrorColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Chat panel
// ─────────────────────────────────────────────────────────

class _ChatPanel extends StatefulWidget {
  const _ChatPanel();

  @override
  State<_ChatPanel> createState() => _ChatPanelState();
}

class _ChatPanelState extends State<_ChatPanel> {
  final TextEditingController _input = TextEditingController();
  final FocusNode _focus = FocusNode();
  final ScrollController _scroll = ScrollController();

  CopilotController get _ctrl => Get.find<CopilotController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focus.requestFocus();
      ever<int>(
        _ctrl.messages.length.obs..bindStream(_ctrl.messages.stream.map((l) => l.length)),
        (_) => _scrollToBottom(),
      );
    });
  }

  @override
  void dispose() {
    _input.dispose();
    _focus.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (!_scroll.hasClients) return;
    _scroll.animateTo(
      _scroll.position.maxScrollExtent,
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOut,
    );
  }

  Future<void> _send([String? text]) async {
    final value = (text ?? _input.text).trim();
    if (value.isEmpty) return;
    _input.clear();
    await _ctrl.send(value);
    _focus.requestFocus();
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final minimized = _ctrl.isMinimized.value;
      final screen = MediaQuery.of(context).size;
      final isMobile = screen.width < 720;
      // On phones the panel takes nearly the full screen.
      final panelWidth = isMobile
          ? (screen.width - 24).clamp(280, 420).toDouble()
          : 384.0;
      final panelHeight = isMobile
          ? (screen.height - 80).clamp(420, 620).toDouble()
          : 580.0;
      return AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: minimized ? (isMobile ? 200 : 280) : panelWidth,
        height: minimized ? 56 : panelHeight,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: kPrimaryColor.withValues(alpha: 0.15)),
          boxShadow: [
            BoxShadow(
              color: kPrimaryColor.withValues(alpha: 0.18),
              blurRadius: 30,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Column(
            children: [
              _buildHeader(),
              if (!minimized) Expanded(child: _buildMessages()),
              if (!minimized) _buildSuggestions(),
              if (!minimized) _buildInput(),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildHeader() {
    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF9333EA), Color(0xFF6366F1)],
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.auto_awesome, size: 16, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  'AI Копилот',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    height: 1.1,
                  ),
                ),
                Obx(() => Text(
                      _ctrl.pageTitle.value,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withValues(alpha: 0.85),
                        height: 1.2,
                      ),
                    )),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Очистить',
            onPressed: _ctrl.resetConversation,
            iconSize: 16,
            splashRadius: 14,
            color: Colors.white.withValues(alpha: 0.85),
            icon: const Icon(Icons.refresh_rounded),
          ),
          Obx(() => IconButton(
                tooltip: _ctrl.isMinimized.value ? 'Развернуть' : 'Свернуть',
                onPressed: _ctrl.toggleMinimize,
                iconSize: 16,
                splashRadius: 14,
                color: Colors.white.withValues(alpha: 0.85),
                icon: Icon(
                  _ctrl.isMinimized.value
                      ? Icons.open_in_full_rounded
                      : Icons.close_fullscreen_rounded,
                ),
              )),
          IconButton(
            tooltip: 'Закрыть',
            onPressed: _ctrl.close,
            iconSize: 18,
            splashRadius: 14,
            color: Colors.white.withValues(alpha: 0.95),
            icon: const Icon(Icons.close_rounded),
          ),
        ],
      ),
    );
  }

  Widget _buildMessages() {
    return Container(
      color: kGray50,
      child: Obx(() {
        final list = _ctrl.messages;
        return ListView.builder(
          controller: _scroll,
          padding: const EdgeInsets.all(16),
          itemCount: list.length + (_ctrl.isLoading.value ? 1 : 0),
          itemBuilder: (_, i) {
            if (i == list.length) return const _Typing();
            return _MessageBubble(message: list[i]);
          },
        );
      }),
    );
  }

  Widget _buildSuggestions() {
    return Obx(() {
      if (_ctrl.suggestions.isEmpty || _ctrl.messages.length > 1) {
        return const SizedBox.shrink();
      }
      return Container(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
        color: kGray50,
        child: Wrap(
          spacing: 6,
          runSpacing: 6,
          children: _ctrl.suggestions
              .take(4)
              .map((s) => _SuggestionChip(label: s, onTap: () => _send(s)))
              .toList(),
        ),
      );
    });
  }

  Widget _buildInput() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: kBorderColor)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 120),
              child: TextField(
                controller: _input,
                focusNode: _focus,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
                decoration: InputDecoration(
                  hintText: 'Спросите что-нибудь...',
                  hintStyle: const TextStyle(fontSize: 13, color: kTextHint),
                  filled: true,
                  fillColor: kGray50,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: kPrimaryColor, width: 1.5),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                style: const TextStyle(fontSize: 13),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Obx(() {
            final loading = _ctrl.isLoading.value;
            return GestureDetector(
              onTap: loading ? null : _send,
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF9333EA), Color(0xFF6366F1)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: loading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : const Icon(Icons.send_rounded,
                        size: 18, color: Colors.white),
              ),
            );
          }),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});
  final CopilotMessage message;

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == CopilotRole.user;
    final align = isUser ? Alignment.centerRight : Alignment.centerLeft;
    final bgColor = isUser ? kPrimaryColor : Colors.white;
    final textColor = isUser ? Colors.white : kTextPrimary;
    final borderRadius = isUser
        ? const BorderRadius.only(
            topLeft: Radius.circular(14),
            topRight: Radius.circular(14),
            bottomLeft: Radius.circular(14),
            bottomRight: Radius.circular(4),
          )
        : const BorderRadius.only(
            topLeft: Radius.circular(14),
            topRight: Radius.circular(14),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(14),
          );

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Align(
        alignment: align,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 300),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: borderRadius,
            border: isUser ? null : Border.all(color: kBorderColor),
          ),
          child: Text(
            message.content,
            style: TextStyle(
              fontSize: 13,
              color: textColor,
              height: 1.4,
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Typing indicator
// ─────────────────────────────────────────────────────────

class _Typing extends StatelessWidget {
  const _Typing();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: kBorderColor),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 14,
                height: 14,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: kPrimaryColor,
                ),
              ),
              SizedBox(width: 8),
              Text(
                'Думаю...',
                style: TextStyle(fontSize: 12, color: kTextMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// Suggestion chip
// ─────────────────────────────────────────────────────────

class _SuggestionChip extends StatelessWidget {
  const _SuggestionChip({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: kPrimaryColor.withValues(alpha: 0.3)),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.bolt_rounded, size: 12, color: kPrimaryColor),
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  color: kPrimaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
