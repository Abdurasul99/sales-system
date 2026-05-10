import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/model/user_model.dart';
import 'package:sales_system/view/components/ai_copilot.dart';
import 'package:sales_system/view/components/header.dart';
import 'package:sales_system/view/components/sidebar.dart';
import 'package:sales_system/view/tabs/tab_abc.dart';
import 'package:sales_system/view/tabs/tab_analytics.dart';
import 'package:sales_system/view/tabs/tab_categories.dart';
import 'package:sales_system/view/tabs/tab_currency.dart';
import 'package:sales_system/view/tabs/tab_customers.dart';
import 'package:sales_system/view/tabs/tab_finance.dart';
import 'package:sales_system/view/tabs/tab_notifications.dart';
import 'package:sales_system/view/tabs/tab_products.dart';
import 'package:sales_system/view/tabs/tab_profile.dart';
import 'package:sales_system/view/tabs/tab_purchases.dart';
import 'package:sales_system/view/tabs/tab_sales.dart';
import 'package:sales_system/view/tabs/tab_settings.dart';
import 'package:sales_system/view/tabs/tab_shifts.dart';
import 'package:sales_system/view/tabs/tab_suppliers.dart';
import 'package:sales_system/view/tabs/tab_warehouse.dart';
import 'package:sales_system/viewmodel/controller/auth_controller.dart';
import 'package:sales_system/viewmodel/controller/copilot_controller.dart';
import 'package:sales_system/viewmodel/controller/extra_controller.dart';
import 'package:sales_system/viewmodel/controller/products_controller.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _activeId = 'analytics';
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  AuthController get _auth => Get.find<AuthController>();
  ProductsController get _products => Get.find<ProductsController>();
  CopilotController get _copilot => Get.find<CopilotController>();
  ExtraController get _extra => Get.find<ExtraController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _syncCopilotPage();
      // подтянем уведомления, чтобы красная точка на колокольчике была свежей
      _extra.fetchNotifications();
    });
  }

  void _onSelect(String id) {
    setState(() => _activeId = id);
    _syncCopilotPage();
    // Close drawer if it's open (mobile)
    final state = _scaffoldKey.currentState;
    if (state != null && state.isDrawerOpen) {
      Navigator.of(context).pop();
    }
  }

  void _syncCopilotPage() {
    final cfg = _pageFor(_activeId);
    _copilot.setActivePage(
      _activeId,
      cfg.title,
      userName: _auth.user.value?.name,
    );
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < kTabletWidth; // < 1024

    return Obx(() {
      final user = _auth.user.value ??
          const UserModel(
            id: '',
            name: '—',
            username: 'guest',
            email: '',
            role: 'user',
            roleLabel: '',
          );

      final sidebar = Sidebar(
        user: user,
        activeId: _activeId,
        onSelect: _onSelect,
        onLogout: _auth.logout,
      );

      return Scaffold(
        key: _scaffoldKey,
        backgroundColor: kBackgroundColor,
        drawer: isMobile
            ? Drawer(
                width: kSidebarWidth,
                backgroundColor: Colors.white,
                shape: const RoundedRectangleBorder(),
                child: SafeArea(child: sidebar),
              )
            : null,
        body: SafeArea(
          top: false,
          bottom: false,
          child: Stack(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (!isMobile) sidebar,
                  Expanded(child: _buildContent(isMobile: isMobile)),
                ],
              ),
              Positioned(
                right: isMobile ? 12 : 24,
                bottom: isMobile ? 12 : 24,
                child: const AICopilot(),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildContent({required bool isMobile}) {
    final config = _pageFor(_activeId);
    return Column(
      children: [
        Header(
          title: config.title,
          subtitle: config.subtitle,
          actions: config.headerActions,
          onMenuTap: isMobile
              ? () => _scaffoldKey.currentState?.openDrawer()
              : null,
          onNavigate: _onSelect,
        ),
        Expanded(child: config.body),
      ],
    );
  }

  _PageConfig _pageFor(String id) {
    switch (id) {
      case 'analytics':
        return const _PageConfig(
          title: 'Аналитика',
          subtitle: 'Дашборд и отчёты',
          body: TabAnalytics(),
        );
      case 'abc':
        return const _PageConfig(
          title: 'ABC анализ',
          subtitle: 'Распределение товаров по выручке (правило Парето)',
          body: TabAbc(),
        );
      case 'shifts':
        return const _PageConfig(
          title: 'Смены',
          subtitle: 'Открытие и закрытие смены',
          body: TabShifts(),
        );
      case 'currency':
        return const _PageConfig(
          title: 'Обмен валют',
          subtitle: 'Курсы валют к UZS',
          body: TabCurrency(),
        );
      case 'notifications':
        return const _PageConfig(
          title: 'Уведомления',
          subtitle: 'События и алерты',
          body: TabNotifications(),
        );
      case 'sales':
        return const _PageConfig(
          title: 'Продажи',
          subtitle: 'Касса и история продаж',
          body: TabSales(),
        );
      case 'products':
        return _PageConfig(
          title: 'Товары',
          subtitle: 'Управление ассортиментом',
          headerActions: [
            _PrimaryHeaderButton(
              label: 'Новый товар',
              icon: Icons.add_rounded,
              onTap: _products.openCreateForm,
            ),
            const SizedBox(width: 12),
          ],
          body: const TabProducts(),
        );
      case 'categories':
        return const _PageConfig(
          title: 'Категории',
          subtitle: 'Группировка товаров',
          body: TabCategories(),
        );
      case 'warehouse':
        return const _PageConfig(
          title: 'Склад',
          subtitle: 'Остатки и стоимость',
          body: TabWarehouse(),
        );
      case 'purchases':
        return const _PageConfig(
          title: 'Закупки',
          subtitle: 'Приёмка товара от поставщиков',
          body: TabPurchases(),
        );
      case 'customers':
        return const _PageConfig(
          title: 'Клиенты',
          subtitle: 'CRM-картотека',
          body: TabCustomers(),
        );
      case 'suppliers':
        return const _PageConfig(
          title: 'Поставщики',
          subtitle: 'Контрагенты по закупкам',
          body: TabSuppliers(),
        );
      case 'expenses':
        return const _PageConfig(
          title: 'Расходы',
          subtitle: 'Учёт исходящих платежей',
          body: TabFinance(kind: 'expense'),
        );
      case 'income':
        return const _PageConfig(
          title: 'Доходы',
          subtitle: 'Учёт прочих поступлений',
          body: TabFinance(kind: 'income'),
        );
      case 'settings':
        return const _PageConfig(
          title: 'Настройки',
          subtitle: 'Профиль и пароль',
          body: TabSettings(),
        );
      case 'profile':
        return const _PageConfig(
          title: 'Профиль',
          subtitle: 'Учётная запись и роль',
          body: TabProfile(),
        );
      default:
        return _PageConfig(
          title: _labelFor(id),
          subtitle: 'Раздел в разработке',
          body: _ComingSoon(label: _labelFor(id)),
        );
    }
  }

  String _labelFor(String id) {
    for (final group in kNavGroups) {
      for (final item in group.items) {
        if (item.id == id) return item.label;
      }
    }
    return id;
  }
}

class _PageConfig {
  const _PageConfig({
    required this.title,
    required this.body,
    this.subtitle,
    this.headerActions,
  });

  final String title;
  final String? subtitle;
  final Widget body;
  final List<Widget>? headerActions;
}

class _PrimaryHeaderButton extends StatelessWidget {
  const _PrimaryHeaderButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: kPrimaryColor,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: kPrimaryColor.withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          alignment: Alignment.center,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ComingSoon extends StatelessWidget {
  const _ComingSoon({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: kPrimaryColorLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.construction_rounded,
                    size: 32, color: kPrimaryColor),
              ),
              const SizedBox(height: 20),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: kTextPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Раздел будет доступен в одной из следующих версий',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: kTextMuted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
