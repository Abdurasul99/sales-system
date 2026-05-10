import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/repository/extra_repository.dart';

// ──────────────────────────────────────────────────────────
// Search dialog — opens from the magnifying-glass icon.
// Queries /api/search?q=… (debounced) and groups hits by
// products / sales / customers / suppliers.
// ──────────────────────────────────────────────────────────

Future<void> showGlobalSearchDialog(
  BuildContext context, {
  required void Function(String tabId) onNavigate,
}) {
  return showGeneralDialog<void>(
    context: context,
    barrierLabel: 'Поиск',
    barrierDismissible: true,
    barrierColor: Colors.black.withValues(alpha: 0.45),
    transitionDuration: const Duration(milliseconds: 180),
    pageBuilder: (_, __, ___) => const SizedBox.shrink(),
    transitionBuilder: (ctx, anim, __, ___) {
      final curve = CurvedAnimation(parent: anim, curve: Curves.easeOut);
      return Opacity(
        opacity: curve.value,
        child: Transform.translate(
          offset: Offset(0, (1 - curve.value) * -8),
          child: _SearchDialog(onNavigate: onNavigate),
        ),
      );
    },
  );
}

class _SearchDialog extends StatefulWidget {
  const _SearchDialog({required this.onNavigate});
  final void Function(String tabId) onNavigate;

  @override
  State<_SearchDialog> createState() => _SearchDialogState();
}

class _SearchDialogState extends State<_SearchDialog> {
  final _ctrl = TextEditingController();
  final _focus = FocusNode();
  Timer? _debounce;

  ExtraController get _extra => Get.find<ExtraController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _focus.requestFocus());
    // start with whatever previous query was (if any)
    _ctrl.text = _extra.searchQuery.value;
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _ctrl.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _onChanged(String v) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 250), () {
      _extra.performSearch(v);
    });
  }

  void _close() {
    if (Navigator.of(context).canPop()) Navigator.of(context).pop();
  }

  void _navigateTo(String tabId) {
    _close();
    widget.onNavigate(tabId);
  }

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final width = media.size.width;
    final dialogWidth = width.clamp(0, 720).toDouble();
    return Material(
      type: MaterialType.transparency,
      child: Align(
        alignment: width >= 720 ? Alignment.topCenter : Alignment.center,
        child: Padding(
          padding: EdgeInsets.only(top: width >= 720 ? 80 : 0, left: 16, right: 16),
          child: ConstrainedBox(
            constraints:
                BoxConstraints(maxWidth: dialogWidth, maxHeight: media.size.height * 0.8),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.12),
                    blurRadius: 30,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _input(),
                  const Divider(height: 1, color: kBorderColor),
                  Flexible(child: _resultsArea()),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _input() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 8, 14),
      child: Row(
        children: [
          const Icon(Icons.search_rounded, size: 20, color: kTextMuted),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: _ctrl,
              focusNode: _focus,
              onChanged: _onChanged,
              textInputAction: TextInputAction.search,
              style: const TextStyle(fontSize: 15, color: kTextPrimary),
              decoration: const InputDecoration(
                hintText: 'Поиск по товарам, продажам, клиентам, поставщикам',
                hintStyle: TextStyle(color: kTextHint, fontSize: 14),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
                filled: false,
                fillColor: null,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                floatingLabelBehavior: FloatingLabelBehavior.never,
              ),
            ),
          ),
          IconButton(
            onPressed: _close,
            iconSize: 18,
            splashRadius: 16,
            icon: const Icon(Icons.close_rounded, color: kTextHint),
          ),
        ],
      ),
    );
  }

  Widget _resultsArea() {
    return Obx(() {
      final q = _extra.searchQuery.value;
      final loading = _extra.isSearching.value;
      final r = _extra.searchResult.value;

      if (q.isEmpty) {
        return _hintBlock();
      }
      if (loading && r.total == 0) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(
            child: CircularProgressIndicator(color: kPrimaryColor, strokeWidth: 2),
          ),
        );
      }
      if (r.total == 0) {
        return Padding(
          padding: const EdgeInsets.all(40),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.search_off_rounded, size: 36, color: kTextHint.withValues(alpha: 0.7)),
                const SizedBox(height: 10),
                Text(
                  'Ничего не найдено по запросу «$q»',
                  style: const TextStyle(fontSize: 13, color: kTextMuted),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      }

      return SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (r.products.isNotEmpty)
              _section(
                title: 'Товары',
                count: r.products.length,
                onMore: () => _navigateTo('products'),
                children: r.products.map(_productTile).toList(),
              ),
            if (r.sales.isNotEmpty)
              _section(
                title: 'Продажи',
                count: r.sales.length,
                onMore: () => _navigateTo('sales'),
                children: r.sales.map(_saleTile).toList(),
              ),
            if (r.customers.isNotEmpty)
              _section(
                title: 'Клиенты',
                count: r.customers.length,
                onMore: () => _navigateTo('customers'),
                children: r.customers.map(_customerTile).toList(),
              ),
            if (r.suppliers.isNotEmpty)
              _section(
                title: 'Поставщики',
                count: r.suppliers.length,
                onMore: () => _navigateTo('suppliers'),
                children: r.suppliers.map(_supplierTile).toList(),
              ),
          ],
        ),
      );
    });
  }

  Widget _hintBlock() {
    final hints = const [
      ('Товары', 'по названию или артикулу', Icons.inventory_2_outlined, 'products'),
      ('Продажи', 'по номеру чека или клиенту', Icons.receipt_long_rounded, 'sales'),
      ('Клиенты', 'по имени, телефону или компании', Icons.people_alt_outlined, 'customers'),
      ('Поставщики', 'по названию или контактному лицу', Icons.local_shipping_outlined, 'suppliers'),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Поиск ищет по всей базе:',
              style: TextStyle(fontSize: 12, color: kTextHint, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          for (final h in hints)
            InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () => _navigateTo(h.$4),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  children: [
                    Icon(h.$3, size: 16, color: kTextMuted),
                    const SizedBox(width: 10),
                    Text(h.$1,
                        style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: kTextPrimary)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        h.$2,
                        style: const TextStyle(fontSize: 12, color: kTextHint),
                      ),
                    ),
                    const Icon(Icons.arrow_forward_rounded,
                        size: 14, color: kTextHint),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _section({
    required String title,
    required int count,
    required VoidCallback onMore,
    required List<Widget> children,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 12, 4),
            child: Row(
              children: [
                Text(title.toUpperCase(),
                    style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: kTextHint,
                        letterSpacing: 0.6)),
                const SizedBox(width: 8),
                Text('· $count',
                    style:
                        const TextStyle(fontSize: 11, color: kTextHint)),
                const Spacer(),
                TextButton(
                  onPressed: onMore,
                  style: TextButton.styleFrom(
                      foregroundColor: kPrimaryColor,
                      minimumSize: const Size(0, 28),
                      padding: const EdgeInsets.symmetric(horizontal: 8)),
                  child: const Text('Открыть раздел',
                      style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _productTile(SearchProductHit p) {
    final f = NumberFormat.decimalPattern();
    return InkWell(
      onTap: () => _navigateTo('products'),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            _icon(Icons.inventory_2_outlined, kPrimaryColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: kTextPrimary)),
                  Text('${p.sku} · ${p.category} · остаток ${p.stock}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 11, color: kTextHint)),
                ],
              ),
            ),
            Text('${f.format(p.price)} ${p.currency}',
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: kPrimaryColor)),
          ],
        ),
      ),
    );
  }

  Widget _saleTile(SearchSaleHit s) {
    final f = NumberFormat.decimalPattern();
    final isVoided = s.status == 'voided';
    return InkWell(
      onTap: () => _navigateTo('sales'),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            _icon(Icons.receipt_long_rounded,
                isVoided ? kTextHint : kSuccessColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    s.number,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isVoided ? kTextMuted : kTextPrimary,
                      decoration: isVoided ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  Text(
                    '${DateFormat('dd.MM HH:mm').format(s.date)} · ${s.itemsCount} поз.${s.customerName.isEmpty ? '' : ' · ${s.customerName}'}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: kTextHint),
                  ),
                ],
              ),
            ),
            Text('${f.format(s.total)} UZS',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isVoided ? kTextHint : kPrimaryColor)),
          ],
        ),
      ),
    );
  }

  Widget _customerTile(SearchCustomerHit c) {
    return InkWell(
      onTap: () => _navigateTo('customers'),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            _icon(Icons.person_outline, kIndigoColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(c.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: kTextPrimary)),
                  Text(
                    [
                      if (c.phone.isNotEmpty) c.phone,
                      if (c.company.isNotEmpty) c.company,
                    ].join(' · '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: kTextHint),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _supplierTile(SearchSupplierHit s) {
    return InkWell(
      onTap: () => _navigateTo('suppliers'),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(
          children: [
            _icon(Icons.local_shipping_outlined, kWarningColor),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: kTextPrimary)),
                  Text(
                    [
                      if (s.contactPerson.isNotEmpty) s.contactPerson,
                      if (s.phone.isNotEmpty) s.phone,
                      if (s.category.isNotEmpty) s.category,
                    ].join(' · '),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: kTextHint),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _icon(IconData icon, Color color) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Icon(icon, size: 16, color: color),
    );
  }
}

// ──────────────────────────────────────────────────────────
// Notifications popover — anchored top-right under the bell.
// ──────────────────────────────────────────────────────────

Future<void> showNotificationsPopover(
  BuildContext context, {
  required void Function(String tabId) onNavigate,
  Offset anchor = const Offset(24, 64),
}) {
  // Trigger a fetch when opening so the panel is fresh.
  final ctrl = Get.find<ExtraController>();
  ctrl.fetchNotifications();
  return showGeneralDialog<void>(
    context: context,
    barrierLabel: 'Уведомления',
    barrierDismissible: true,
    barrierColor: Colors.black.withValues(alpha: 0.18),
    transitionDuration: const Duration(milliseconds: 160),
    pageBuilder: (_, __, ___) => const SizedBox.shrink(),
    transitionBuilder: (ctx, anim, __, ___) {
      final curve = CurvedAnimation(parent: anim, curve: Curves.easeOut);
      return Opacity(
        opacity: curve.value,
        child: Transform.translate(
          offset: Offset(0, (1 - curve.value) * -8),
          child: _NotificationsPanel(
            anchor: anchor,
            onNavigate: onNavigate,
          ),
        ),
      );
    },
  );
}

class _NotificationsPanel extends StatelessWidget {
  const _NotificationsPanel({required this.anchor, required this.onNavigate});
  final Offset anchor;
  final void Function(String tabId) onNavigate;

  ExtraController get _extra => Get.find<ExtraController>();

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final width = media.size.width;
    final isCompact = width < 600;
    final panelWidth = isCompact ? width - 24 : 380.0;
    final right = anchor.dx;
    final top = anchor.dy;

    return Material(
      type: MaterialType.transparency,
      child: Stack(
        children: [
          Positioned(
            top: top,
            right: isCompact ? 12 : right,
            child: SizedBox(
              width: panelWidth,
              child: ConstrainedBox(
                constraints: BoxConstraints(maxHeight: media.size.height * 0.7),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.16),
                        blurRadius: 24,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _header(context),
                      const Divider(height: 1, color: kBorderColor),
                      Flexible(child: _list(context)),
                      const Divider(height: 1, color: kBorderColor),
                      _footer(context),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _header(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 12),
      child: Row(
        children: [
          const Icon(Icons.notifications_outlined,
              size: 18, color: kPrimaryColor),
          const SizedBox(width: 8),
          const Text('Уведомления',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: kTextPrimary)),
          const Spacer(),
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            iconSize: 16,
            splashRadius: 14,
            icon: const Icon(Icons.close_rounded, color: kTextHint),
          ),
        ],
      ),
    );
  }

  Widget _list(BuildContext context) {
    return Obx(() {
      final loading = _extra.isNotificationsLoading.value;
      final list = _extra.notifications;
      if (loading && list.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 36),
          child: Center(
            child: CircularProgressIndicator(strokeWidth: 2, color: kPrimaryColor),
          ),
        );
      }
      if (list.isEmpty) {
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 36, horizontal: 24),
          child: Center(
            child: Text('Новых уведомлений нет',
                style: TextStyle(fontSize: 13, color: kTextMuted)),
          ),
        );
      }
      return ListView.separated(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(vertical: 4),
        itemCount: list.length > 8 ? 8 : list.length,
        separatorBuilder: (_, __) => const Divider(height: 1, color: kBorderColor),
        itemBuilder: (_, i) => _tile(context, list[i]),
      );
    });
  }

  Widget _tile(BuildContext context, NotificationItem n) {
    final color = _kindColor(n.kind);
    final icon = _kindIcon(n.kind);
    return InkWell(
      onTap: () {
        Navigator.of(context).pop();
        if (n.relatedType == 'sale') {
          onNavigate('sales');
        } else if (n.relatedType == 'product') {
          onNavigate('warehouse');
        } else {
          onNavigate('notifications');
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 16, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(n.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: kTextPrimary)),
                  if (n.description.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        n.description,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: kTextMuted),
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('dd.MM HH:mm').format(n.createdAt),
                    style: const TextStyle(fontSize: 10, color: kTextHint),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _footer(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.of(context).pop();
        onNavigate('notifications');
      },
      child: const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Center(
          child: Text(
            'Открыть все уведомления',
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: kPrimaryColor),
          ),
        ),
      ),
    );
  }

  Color _kindColor(String kind) {
    switch (kind) {
      case 'critical':
        return kErrorColor;
      case 'warning':
        return kWarningColor;
      case 'success':
        return kSuccessColor;
      default:
        return kIndigoColor;
    }
  }

  IconData _kindIcon(String kind) {
    switch (kind) {
      case 'critical':
        return Icons.error_outline_rounded;
      case 'warning':
        return Icons.warning_amber_rounded;
      case 'success':
        return Icons.check_circle_outline_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }
}
