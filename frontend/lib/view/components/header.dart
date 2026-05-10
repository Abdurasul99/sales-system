import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/view/components/header_overlays.dart';
import 'package:sales_system/viewmodel/controller/extra_controller.dart';

class Header extends StatelessWidget {
  const Header({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.onMenuTap,
    this.onNavigate,
  });

  final String title;
  final String? subtitle;
  final List<Widget>? actions;

  /// When provided, shows a hamburger button on the left (used on mobile
  /// where the sidebar is hidden behind a Drawer).
  final VoidCallback? onMenuTap;

  /// Optional callback used by the search and notification buttons when
  /// a result needs to switch the active tab. If null, those buttons
  /// only display data without deep-linking anywhere.
  final void Function(String tabId)? onNavigate;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isCompact = width < 720;
    final navigate = onNavigate ?? (_) {};

    return Container(
      height: kHeaderHeight,
      padding: EdgeInsets.symmetric(horizontal: isCompact ? 12 : 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: Row(
        children: [
          if (onMenuTap != null) ...[
            _IconButton(icon: Icons.menu_rounded, onTap: onMenuTap!),
            const SizedBox(width: 6),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: isCompact ? 15 : 16,
                    fontWeight: FontWeight.w600,
                    color: kTextPrimary,
                  ),
                ),
                if (subtitle != null && !isCompact)
                  Text(
                    subtitle!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: kTextHint),
                  ),
              ],
            ),
          ),
          if (actions != null) ...actions!,
          if (!isCompact) ...[
            _IconButton(
              icon: Icons.search_rounded,
              tooltip: 'Поиск',
              onTap: () => showGlobalSearchDialog(context, onNavigate: navigate),
            ),
            const SizedBox(width: 6),
            _NotificationsButton(onNavigate: navigate),
          ],
        ],
      ),
    );
  }
}

class _NotificationsButton extends StatelessWidget {
  const _NotificationsButton({required this.onNavigate});
  final void Function(String tabId) onNavigate;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      ExtraController? ctrl;
      try {
        ctrl = Get.find<ExtraController>();
      } catch (_) {
        ctrl = null;
      }
      // Red dot = есть critical или warning уведомления.
      var showDot = false;
      if (ctrl != null) {
        showDot = ctrl.notifications.any((n) =>
            n.kind == 'critical' || n.kind == 'warning');
      }
      return _IconButton(
        icon: Icons.notifications_outlined,
        tooltip: 'Уведомления',
        showDot: showDot,
        onTap: () => showNotificationsPopover(context, onNavigate: onNavigate),
      );
    });
  }
}

class _IconButton extends StatefulWidget {
  const _IconButton({
    required this.icon,
    required this.onTap,
    this.showDot = false,
    this.tooltip,
  });

  final IconData icon;
  final VoidCallback onTap;
  final bool showDot;
  final String? tooltip;

  @override
  State<_IconButton> createState() => _IconButtonState();
}

class _IconButtonState extends State<_IconButton> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final btn = MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() => _hover = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: _hover ? kGray100 : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(widget.icon,
                  size: 18, color: _hover ? kTextPrimary : kTextMuted),
              if (widget.showDot)
                Positioned(
                  right: -2,
                  top: -2,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: kErrorColor,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
    if (widget.tooltip != null) {
      return Tooltip(message: widget.tooltip!, child: btn);
    }
    return btn;
  }
}
