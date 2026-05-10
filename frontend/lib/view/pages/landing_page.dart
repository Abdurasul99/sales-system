import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:sales_system/constants/constants.dart';
import 'package:sales_system/utils/app_routes.dart';
import 'package:sales_system/view/components/app_logo.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  final ScrollController _scroll = ScrollController();
  final _featuresKey = GlobalKey();
  final _pricingKey = GlobalKey();
  final _faqKey = GlobalKey();

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  void _scrollTo(GlobalKey key) {
    final ctx = key.currentContext;
    if (ctx == null) return;
    Scrollable.ensureVisible(ctx,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          SingleChildScrollView(
            controller: _scroll,
            child: Column(
              children: [
                const SizedBox(height: 64), // space for sticky nav
                _hero(),
                _statsBar(),
                _features(),
                _telegramSection(),
                _pricing(),
                _faq(),
                _ctaSection(),
                _footer(),
              ],
            ),
          ),
          _stickyNav(),
        ],
      ),
    );
  }

  // ── Sticky navigation ──

  Widget _stickyNav() {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 64,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.92),
          border: const Border(bottom: BorderSide(color: kBorderColor)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1100),
            child: Row(
              children: [
                const AppLogo(size: 36, withWordmark: true, compact: true),
                const SizedBox(width: 32),
                if (MediaQuery.of(context).size.width > 800) ...[
                  _navLink('Возможности', () => _scrollTo(_featuresKey)),
                  const SizedBox(width: 24),
                  _navLink('Тарифы', () => _scrollTo(_pricingKey)),
                  const SizedBox(width: 24),
                  _navLink('FAQ', () => _scrollTo(_faqKey)),
                ],
                const Spacer(),
                _navLink('Войти', () => Get.toNamed(AppRoutes.login)),
                const SizedBox(width: 12),
                _ctaButton(
                  label: 'Попробовать бесплатно',
                  onTap: () => Get.toNamed(AppRoutes.login),
                  small: true,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navLink(String label, VoidCallback onTap) {
    return _Hoverable(
      builder: (hover) => GestureDetector(
        onTap: onTap,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: hover ? kTextPrimary : kTextSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  // ── Hero ──

  Widget _hero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kLoginGradientFrom, Colors.white, kLoginGradientTo],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          stops: [0.0, 0.5, 1.0],
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 760),
          child: Column(
            children: [
              _badge('30 дней бесплатно — без карты', Icons.bolt_rounded),
              const SizedBox(height: 24),
              const Text(
                'Система учёта',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                  height: 1.05,
                  color: kTextPrimary,
                  letterSpacing: -1.0,
                ),
              ),
              const Text(
                'для вашего магазина',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                  height: 1.1,
                  color: kPrimaryColor,
                  letterSpacing: -1.0,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'Продажи, склад, расходы, клиенты и аналитика в одном месте.\nДля магазинов Узбекистана и СНГ.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  color: kTextMuted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 36),
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 12,
                runSpacing: 12,
                children: [
                  _ctaButton(
                    label: 'Начать бесплатно',
                    icon: Icons.arrow_forward_rounded,
                    onTap: () => Get.toNamed(AppRoutes.login),
                  ),
                  _outlineButton(
                    label: 'Войти в систему',
                    onTap: () => Get.toNamed(AppRoutes.login),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Уже 200+ магазинов доверяют нам · Данные в облаке · Без установки',
                style: TextStyle(fontSize: 13, color: kTextHint),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _badge(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: kPrimaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: kPrimaryColor),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: kPrimaryColor,
            ),
          ),
        ],
      ),
    );
  }

  // ── Stats ──

  Widget _statsBar() {
    final items = [
      ('200+', 'Магазинов'),
      ('30 дней', 'Бесплатный период'),
      ('24/7', 'Доступность'),
      ('UZS', 'Основная валюта'),
    ];
    return Container(
      width: double.infinity,
      color: kPrimaryColor,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 880),
          child: Wrap(
            alignment: WrapAlignment.spaceBetween,
            spacing: 32,
            runSpacing: 24,
            children: items
                .map((s) => SizedBox(
                      width: 180,
                      child: Column(
                        children: [
                          Text(
                            s.$1,
                            style: const TextStyle(
                              fontSize: 30,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            s.$2,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.75),
                            ),
                          ),
                        ],
                      ),
                    ))
                .toList(),
          ),
        ),
      ),
    );
  }

  // ── Features ──

  Widget _features() {
    final features = <_Feature>[
      _Feature(Icons.shopping_cart_outlined, kPrimaryColor, kPrimaryColorLight, 'Кассовый терминал (POS)',
          'Быстрые продажи с поиском по штрихкоду. Наличные, карта, долг, смешанная оплата. Печать чека.'),
      _Feature(Icons.inventory_2_outlined, const Color(0xFF2563EB), const Color(0xFFE0E7FF), 'Учёт склада',
          'Остатки в реальном времени. Поступление товаров от поставщиков. Уведомления при низком остатке.'),
      _Feature(Icons.bar_chart_rounded, const Color(0xFF10B981), const Color(0xFFD1FAE5), 'Аналитика и отчёты',
          'Выручка, расходы, прибыль. Топ-товары. ABC анализ. Экспорт в Excel/CSV.'),
      _Feature(Icons.people_alt_outlined, const Color(0xFFF97316), const Color(0xFFFFEDD5), 'База клиентов',
          'Учёт долгов, бонусная система, кэшбэк. История покупок каждого клиента.'),
      _Feature(Icons.auto_awesome, const Color(0xFFEC4899), const Color(0xFFFCE7F3), 'AI Копилот',
          'Умный ассистент знает ваш бизнес. Отвечает на вопросы по складу, продажам и расходам.'),
      _Feature(Icons.public, const Color(0xFF06B6D4), const Color(0xFFCFFAFE), 'Мультивалютность',
          'UZS основная валюта. Поддержка USD, EUR, RUB, CNY с автообновлением курсов.'),
      _Feature(Icons.notifications_outlined, const Color(0xFFEAB308), const Color(0xFFFEF9C3), 'Уведомления',
          'Оповещения о низком складе, закрытии смены, долгах клиентов. В системе и Telegram.'),
      _Feature(Icons.shield_outlined, const Color(0xFFEF4444), const Color(0xFFFEE2E2), 'Роли и доступы',
          'Разные права для владельца, кассира, кладовщика. Каждый видит только своё.'),
      _Feature(Icons.smartphone_outlined, kIndigoColor, kIndigoLight, 'Мобильный доступ',
          'Работает на телефоне и планшете. Кассир продаёт с телефона. Владелец видит сводку.'),
    ];
    return Container(
      key: _featuresKey,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            children: [
              const Text(
                'Всё что нужно магазину',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: kTextPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Один сервис вместо Excel, тетради и WhatsApp',
                style: TextStyle(fontSize: 16, color: kTextMuted),
              ),
              const SizedBox(height: 48),
              LayoutBuilder(builder: (ctx, c) {
                final cols = c.maxWidth >= 1000
                    ? 3
                    : c.maxWidth >= 640
                        ? 2
                        : 1;
                return GridView.count(
                  crossAxisCount: cols,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: cols == 1 ? 2.4 : 1.45,
                  children: features.map(_featureCard).toList(),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _featureCard(_Feature f) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: kBorderColor),
        boxShadow: [
          BoxShadow(
            color: kGray200.withValues(alpha: 0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: f.bg,
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Icon(f.icon, color: f.color, size: 24),
          ),
          const SizedBox(height: 16),
          Text(
            f.title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: kTextPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Text(
              f.description,
              style: const TextStyle(fontSize: 13, color: kTextMuted, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  // ── Telegram bot ──

  Widget _telegramSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFEFF6FF), Color(0xFFEEF2FF)],
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: LayoutBuilder(builder: (ctx, c) {
            final wide = c.maxWidth > 900;
            final left = _telegramLeft();
            final right = _telegramChat();
            if (!wide) {
              return Column(children: [left, const SizedBox(height: 32), right]);
            }
            return Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(child: left),
                const SizedBox(width: 48),
                right,
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _telegramLeft() {
    final perks = [
      ('📊', 'Ежедневная сводка', 'Выручка, прибыль и топ-товары дня — каждое утро в 9:00'),
      ('📦', 'Уведомления о складе', 'Мгновенные оповещения когда товар заканчивается'),
      ('💰', 'Итоги продаж', 'Получайте отчёт по каждой смене сразу после закрытия'),
      ('🤖', 'AI ассистент в чате', 'Задавайте вопросы о бизнесе прямо в Telegram'),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFE0F2FE),
            borderRadius: BorderRadius.circular(20),
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.send_rounded, size: 14, color: Color(0xFF0369A1)),
              SizedBox(width: 6),
              Text('Telegram Bot',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0369A1))),
            ],
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Управляйте бизнесом\nпрямо в Telegram',
          style: TextStyle(
            fontSize: 36,
            fontWeight: FontWeight.w900,
            color: kTextPrimary,
            height: 1.1,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Получайте сводку продаж, остатки склада и уведомления об операциях — без входа в систему. Всё в вашем любимом мессенджере.',
          style: TextStyle(fontSize: 16, color: kTextMuted, height: 1.5),
        ),
        const SizedBox(height: 28),
        for (final p in perks)
          Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(p.$1, style: const TextStyle(fontSize: 22)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(p.$2,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: kTextPrimary)),
                      Text(p.$3,
                          style: const TextStyle(
                              fontSize: 13, color: kTextMuted)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 12),
        _ctaButton(
          label: 'Попробовать бесплатно',
          icon: Icons.send_rounded,
          color: const Color(0xFF0EA5E9),
          shadow: const Color(0xFF0EA5E9),
          onTap: () => Get.toNamed(AppRoutes.login),
        ),
      ],
    );
  }

  Widget _telegramChat() {
    return Container(
      width: 320,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFE0F2FE)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0EA5E9).withValues(alpha: 0.18),
            blurRadius: 30,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: Color(0xFF0EA5E9),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Sales System Bot',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: kTextPrimary)),
                    Text('в сети',
                        style: TextStyle(fontSize: 11, color: kSuccessColor)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: kBorderColor),
          const SizedBox(height: 12),
          _chatBubble(
            color: const Color(0xFFE0F2FE),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('📊 Итоги за сегодня',
                    style: TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                _kvLine('Выручка', '4 250 000 сум'),
                _kvLine('Прибыль', '1 820 000 сум', valueColor: kSuccessColor),
                _kvLine('Продаж', '38 чеков'),
                const Padding(
                  padding: EdgeInsets.only(top: 6),
                  child: Text('14:30',
                      style: TextStyle(fontSize: 10, color: kTextHint)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          _chatBubble(
            color: const Color(0xFFFFEDD5),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('⚠️ Низкий остаток',
                    style: TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w700)),
                Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Text('Coca-Cola 1.5л — осталось 3 шт.',
                      style: TextStyle(fontSize: 12, color: kTextSecondary)),
                ),
                Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Text('14:45',
                      style: TextStyle(fontSize: 10, color: kTextHint)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(left: 40),
            child: _chatBubble(
              color: kGray100,
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 4),
                child: Text(
                  'Покажи топ-5 товаров',
                  style: TextStyle(fontSize: 12, color: kTextSecondary),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chatBubble({required Color color, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(14),
      ),
      child: child,
    );
  }

  Widget _kvLine(String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Row(
        children: [
          Text('$label: ',
              style: const TextStyle(fontSize: 12, color: kTextMuted)),
          Text(value,
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: valueColor ?? kTextPrimary)),
        ],
      ),
    );
  }

  // ── Pricing ──

  Widget _pricing() {
    // Тарифы из плана: Basic (базовая аналитика), Plus (глубокая аналитика),
    // Premium (Plus + AI ассистент). Цены не публикуем — только функциональность.
    final plans = <_Plan>[
      const _Plan(
        name: 'Basic',
        features: [
          'Базовые продажи и POS',
          'Учёт склада и остатков',
          'Расходы и доходы',
          'Дневная / недельная / месячная аналитика',
          'Базовые KPI: выручка, средний чек',
          'До 2 сотрудников',
        ],
      ),
      const _Plan(
        name: 'Plus',
        badge: 'Популярный',
        highlight: true,
        features: [
          'Всё из Basic',
          'Глубокая аналитика по товарам',
          'Себестоимость и валовая прибыль',
          'Маржа и наценка по позициям',
          'ABC-анализ (топ / середина / хвост)',
          'Анализ возвратов и slow-mover',
        ],
      ),
      const _Plan(
        name: 'Premium',
        badge: 'AI Copilot',
        features: [
          'Всё из Plus',
          'AI ассистент с анализом продаж',
          'Прогноз спроса и точки заказа',
          'Рекомендации по ценам и закупкам',
          'Ответы на вопросы о бизнесе',
          'Telegram-уведомления и сводки',
        ],
      ),
    ];
    return Container(
      key: _pricingKey,
      width: double.infinity,
      color: kGray50,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Column(
            children: [
              const Text(
                'Простые и честные тарифы',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: kTextPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Начните бесплатно. Платите только когда убедитесь что система работает.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: kTextMuted),
              ),
              const SizedBox(height: 48),
              LayoutBuilder(builder: (ctx, c) {
                final cols = c.maxWidth >= 1000
                    ? 3
                    : c.maxWidth >= 700
                        ? 2
                        : 1;
                return GridView.count(
                  crossAxisCount: cols,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: cols == 1 ? 1.7 : 0.85,
                  children: plans.map(_planCard).toList(),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _planCard(_Plan p) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: p.highlight ? kPrimaryColor : kBorderColor,
          width: p.highlight ? 2 : 1,
        ),
        boxShadow: p.highlight
            ? [
                BoxShadow(
                  color: kPrimaryColor.withValues(alpha: 0.18),
                  blurRadius: 24,
                  offset: const Offset(0, 12),
                ),
              ]
            : null,
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (p.badge != null) const SizedBox(height: 12),
              Text(p.name,
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: kTextPrimary,
                      letterSpacing: -0.5)),
              const SizedBox(height: 16),
              for (final f in p.features)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded,
                          size: 16, color: kSuccessColor),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(f,
                            style: const TextStyle(
                                fontSize: 13, color: kTextSecondary)),
                      ),
                    ],
                  ),
                ),
              const Spacer(),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: _ctaButton(
                  label: p.name == 'Базовый'
                      ? 'Начать бесплатно'
                      : 'Попробовать 30 дней',
                  onTap: () => Get.toNamed(AppRoutes.login),
                  outlined: !p.highlight,
                  small: true,
                ),
              ),
            ],
          ),
          if (p.badge != null)
            Positioned(
              top: -28,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: p.highlight ? kPrimaryColor : kIndigoColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(p.badge!,
                      style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Colors.white)),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ── FAQ ──

  Widget _faq() {
    final items = [
      ('Нужна ли карта для пробного периода?',
          'Нет. Регистрация бесплатна, карта не требуется. 30 дней полного доступа к тарифу Про.'),
      ('Что будет с данными после окончания пробного периода?',
          'Ваши данные сохраняются. Перейдите в режим только для чтения — выберите тариф чтобы продолжить работу. Данные хранятся 90 дней после окончания.'),
      ('Работает ли система на телефоне?',
          'Да. Касса оптимизирована для работы на телефоне и планшете. Сканирование штрихкода через камеру.'),
      ('Можно ли работать с несколькими магазинами?',
          'Да. На тарифе Про поддерживается до 5 филиалов, на Корпорат — безлимитное количество.'),
      ('Есть ли интеграция с принтером чеков?',
          'Да, поддерживаются термопринтеры через Bluetooth и USB (Epson, BIXOLON и другие).'),
    ];
    return Container(
      key: _faqKey,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Column(
            children: [
              const Text(
                'Часто задаваемые вопросы',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: kTextPrimary,
                ),
              ),
              const SizedBox(height: 32),
              for (final f in items)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: kBorderColor),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(f.$1,
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: kTextPrimary)),
                      const SizedBox(height: 6),
                      Text(f.$2,
                          style: const TextStyle(
                              fontSize: 13,
                              color: kTextMuted,
                              height: 1.5)),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Final CTA ──

  Widget _ctaSection() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kPrimaryColor, kIndigoColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.symmetric(vertical: 64, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: Column(
            children: [
              const Text(
                'Начните прямо сейчас',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                '30 дней бесплатно. Настройка за 5 минут. Без договоров.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 17,
                  color: Colors.white.withValues(alpha: 0.85),
                ),
              ),
              const SizedBox(height: 28),
              _ctaButton(
                label: 'Создать аккаунт бесплатно',
                icon: Icons.arrow_forward_rounded,
                onTap: () => Get.toNamed(AppRoutes.login),
                inverted: true,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Footer ──

  Widget _footer() {
    return Container(
      width: double.infinity,
      color: const Color(0xFF0F172A),
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1100),
          child: Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 16,
            children: [
              const AppLogo(
                  size: 28, withWordmark: true, compact: true,
                  wordmarkColor: Colors.white),
              const Text(
                '© 2026 Sales System. Сделано в Узбекистане 🇺🇿',
                style: TextStyle(fontSize: 12, color: kGray400),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextButton(
                    onPressed: () => Get.toNamed(AppRoutes.login),
                    child: const Text('Войти',
                        style: TextStyle(color: Colors.white)),
                  ),
                  TextButton(
                    onPressed: () => Get.toNamed(AppRoutes.register),
                    child: const Text('Регистрация',
                        style: TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Buttons ──

  Widget _ctaButton({
    required String label,
    required VoidCallback onTap,
    IconData? icon,
    bool small = false,
    bool outlined = false,
    bool inverted = false,
    Color color = kPrimaryColor,
    Color shadow = kPrimaryColor,
  }) {
    return _Hoverable(builder: (hover) {
      Color bg;
      Color fg;
      Color border;
      if (inverted) {
        bg = Colors.white;
        fg = kPrimaryColor;
        border = Colors.white;
      } else if (outlined) {
        bg = hover ? kGray50 : Colors.white;
        fg = kTextPrimary;
        border = kBorderColorStrong;
      } else {
        bg = hover ? kPrimaryColorDark : color;
        fg = Colors.white;
        border = bg;
      }
      return MouseRegion(
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: EdgeInsets.symmetric(
              horizontal: small ? 16 : 28,
              vertical: small ? 10 : 18,
            ),
            decoration: BoxDecoration(
              color: bg,
              border: Border.all(color: border),
              borderRadius: BorderRadius.circular(small ? 10 : 14),
              boxShadow: outlined || inverted
                  ? null
                  : [
                      BoxShadow(
                        color: shadow.withValues(alpha: 0.28),
                        blurRadius: small ? 10 : 18,
                        offset: const Offset(0, 6),
                      ),
                    ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(label,
                    style: TextStyle(
                      color: fg,
                      fontSize: small ? 13 : 16,
                      fontWeight: FontWeight.w700,
                    )),
                if (icon != null) ...[
                  const SizedBox(width: 8),
                  Icon(icon, color: fg, size: small ? 14 : 18),
                ],
              ],
            ),
          ),
        ),
      );
    });
  }

  Widget _outlineButton({required String label, required VoidCallback onTap}) {
    return _ctaButton(label: label, onTap: onTap, outlined: true);
  }
}

class _Feature {
  const _Feature(this.icon, this.color, this.bg, this.title, this.description);
  final IconData icon;
  final Color color;
  final Color bg;
  final String title;
  final String description;
}

class _Plan {
  const _Plan({
    required this.name,
    required this.features,
    this.badge,
    this.highlight = false,
  });
  final String name;
  final List<String> features;
  final String? badge;
  final bool highlight;
}

class _Hoverable extends StatefulWidget {
  const _Hoverable({required this.builder});
  final Widget Function(bool hovered) builder;
  @override
  State<_Hoverable> createState() => _HoverableState();
}

class _HoverableState extends State<_Hoverable> {
  bool _hovered = false;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit: (_) => setState(() => _hovered = false),
      child: widget.builder(_hovered),
    );
  }
}
