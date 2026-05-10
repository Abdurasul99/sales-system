import 'package:flutter/material.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/user_model.dart';
import 'package:sales_system/view/components/app_logo.dart';

class NavItem {
  const NavItem({
    required this.label,
    required this.icon,
    required this.id,
    this.roles,
    this.badge = 0,
  });

  final String label;
  final IconData icon;
  final String id;
  final List<String>? roles;
  final int badge;
}

class NavGroup {
  const NavGroup({required this.label, required this.items});
  final String label;
  final List<NavItem> items;
}

const List<NavGroup> kNavGroups = [
  NavGroup(label: 'ПРОДАЖИ', items: [
    // saas: BarChart3
    NavItem(label: 'Аналитика', icon: Icons.bar_chart_rounded, id: 'analytics', roles: ['founder', 'admin', 'manager']),
    // saas: TrendingUp
    NavItem(label: 'ABC анализ', icon: Icons.trending_up_rounded, id: 'abc', roles: ['founder', 'admin', 'manager']),
    // saas: ShoppingCart
    NavItem(label: 'Продажи', icon: Icons.shopping_cart_outlined, id: 'sales', roles: ['founder', 'admin', 'manager', 'cashier', 'seller']),
    // saas: Clock
    NavItem(label: 'Смены', icon: Icons.schedule_rounded, id: 'shifts', roles: ['founder', 'admin', 'manager', 'cashier']),
  ]),
  NavGroup(label: 'СКЛАД', items: [
    // saas: Package
    NavItem(label: 'Товары', icon: Icons.inventory_2_outlined, id: 'products', roles: ['founder', 'admin', 'manager', 'cashier']),
    // saas: Tag
    NavItem(label: 'Категории', icon: Icons.sell_outlined, id: 'categories', roles: ['founder', 'admin', 'manager']),
    // saas: Warehouse
    NavItem(label: 'Склад', icon: Icons.warehouse_outlined, id: 'warehouse', roles: ['founder', 'admin', 'manager', 'cashier']),
    // saas: Truck
    NavItem(label: 'Закупки', icon: Icons.local_shipping_outlined, id: 'purchases', roles: ['founder', 'admin', 'manager']),
  ]),
  NavGroup(label: 'ФИНАНСЫ', items: [
    // saas: TrendingDown
    NavItem(label: 'Расходы', icon: Icons.trending_down_rounded, id: 'expenses', roles: ['founder', 'admin', 'manager']),
    // saas: TrendingUp
    NavItem(label: 'Доходы', icon: Icons.trending_up_rounded, id: 'income', roles: ['founder', 'admin', 'manager']),
    // saas: DollarSign
    NavItem(label: 'Обмен валют', icon: Icons.currency_exchange_rounded, id: 'currency', roles: ['founder', 'admin', 'manager']),
  ]),
  NavGroup(label: 'РАБОТА', items: [
    // saas: Truck (suppliers)
    NavItem(label: 'Поставщики', icon: Icons.local_shipping_rounded, id: 'suppliers', roles: ['founder', 'admin', 'manager']),
    // saas: Users
    NavItem(label: 'Клиенты', icon: Icons.people_alt_outlined, id: 'customers', roles: ['founder', 'admin', 'manager', 'cashier', 'seller']),
    // saas: Bell
    NavItem(label: 'Уведомления', icon: Icons.notifications_outlined, id: 'notifications'),
  ]),
  NavGroup(label: 'СИСТЕМА', items: [
    // saas: Settings
    NavItem(label: 'Настройки', icon: Icons.settings_outlined, id: 'settings', roles: ['founder', 'admin']),
  ]),
];

class Sidebar extends StatelessWidget {
  const Sidebar({
    super.key,
    required this.user,
    required this.activeId,
    required this.onSelect,
    required this.onLogout,
  });

  final UserModel user;
  final String activeId;
  final ValueChanged<String> onSelect;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: kSidebarWidth,
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: kBorderColor)),
      ),
      child: Column(
        children: [
          _buildLogo(),
          Expanded(child: _buildNav()),
          _buildUserBlock(),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: kBorderColor)),
      ),
      child: const AppLogo(
        size: 36,
        withWordmark: true,
        compact: true,
        subtitle: 'Управление',
      ),
    );
  }

  Widget _buildNav() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
      children: [
        for (final group in kNavGroups)
          if (group.items.any((it) => _allowed(it))) _buildGroup(group),
      ],
    );
  }

  Widget _buildGroup(NavGroup group) {
    final allowed = group.items.where(_allowed).toList();
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
            child: Text(
              group.label,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: kTextHint,
                letterSpacing: 1.2,
              ),
            ),
          ),
          for (final item in allowed) _buildNavItem(item),
        ],
      ),
    );
  }

  Widget _buildNavItem(NavItem item) {
    final isActive = item.id == activeId;
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: _HoverableNavItem(
        item: item,
        isActive: isActive,
        onTap: () => onSelect(item.id),
      ),
    );
  }

  Widget _buildUserBlock() {
    final initial = user.name.isNotEmpty ? user.name[0].toUpperCase() : '?';
    final roleLabel = user.roleLabel.isNotEmpty
        ? user.roleLabel
        : (kRoleLabels[user.role] ?? user.role);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: kBorderColor)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              color: kPrimaryColorLight,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              initial,
              style: const TextStyle(
                fontSize: 14,
                color: kPrimaryColor,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  user.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: kTextPrimary,
                  ),
                ),
                Text(
                  roleLabel,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, color: kTextHint),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Выйти',
            iconSize: 18,
            splashRadius: 18,
            color: kTextHint,
            hoverColor: kErrorColor.withValues(alpha: 0.1),
            onPressed: onLogout,
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
    );
  }

  bool _allowed(NavItem item) {
    if (item.roles == null) return true;
    return item.roles!.contains(user.role);
  }
}

class _HoverableNavItem extends StatefulWidget {
  const _HoverableNavItem({
    required this.item,
    required this.isActive,
    required this.onTap,
  });
  final NavItem item;
  final bool isActive;
  final VoidCallback onTap;

  @override
  State<_HoverableNavItem> createState() => _HoverableNavItemState();
}

class _HoverableNavItemState extends State<_HoverableNavItem> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    final isActive = widget.isActive;
    Color bgColor;
    Color iconColor;
    Color textColor;
    if (isActive) {
      bgColor = kPrimaryColor;
      iconColor = Colors.white;
      textColor = Colors.white;
    } else if (_hovered) {
      bgColor = kGray50;
      iconColor = kTextPrimary;
      textColor = kTextPrimary;
    } else {
      bgColor = Colors.transparent;
      iconColor = kGray500; // solid grey, identical to saas style
      textColor = kTextSecondary;
    }
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: kPrimaryColor.withValues(alpha: 0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Row(
            children: [
              Icon(widget.item.icon, size: 20, color: iconColor),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.item.label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                    color: textColor,
                  ),
                ),
              ),
              if (widget.item.badge > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: kErrorColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text('${widget.item.badge}',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      )),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
