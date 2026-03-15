import Link from "next/link";
import { BarChart3, Package, ShoppingCart, Users, Zap, Shield, Globe, ArrowRight, CheckCircle, Sparkles, TrendingUp, Bell, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Sales System</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900">Возможности</a>
            <a href="#pricing" className="hover:text-gray-900">Тарифы</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Войти</Link>
            <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              Попробовать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            30 дней бесплатно — без карты
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Система учёта<br />
            <span className="text-purple-600">для вашего магазина</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Продажи, склад, расходы, клиенты и аналитика в одном месте.<br />
            Для магазинов Узбекистана и СНГ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-xl shadow-purple-200 transition-all hover:scale-105">
              Начать бесплатно <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              Войти в систему
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">Уже 200+ магазинов доверяют нам · Данные в облаке · Без установки</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-purple-600 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: "200+", label: "Магазинов" },
            { value: "30 дней", label: "Бесплатный период" },
            { value: "24/7", label: "Доступность" },
            { value: "UZS", label: "Основная валюта" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-purple-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Всё что нужно магазину</h2>
            <p className="text-gray-500 text-lg">Один сервис вместо Excel, тетради и WhatsApp</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShoppingCart, color: "bg-purple-50 text-purple-600", title: "Кассовый терминал (POS)", desc: "Быстрые продажи с поиском по штрихкоду. Наличные, карта, долг, смешанная оплата. Печать чека." },
              { icon: Package, color: "bg-blue-50 text-blue-600", title: "Учёт склада", desc: "Остатки в реальном времени. Поступление товаров от поставщиков. Уведомления при низком остатке." },
              { icon: BarChart3, color: "bg-green-50 text-green-600", title: "Аналитика и отчёты", desc: "Выручка, расходы, прибыль. Топ-товары. ABC анализ. Экспорт в Excel/CSV." },
              { icon: Users, color: "bg-orange-50 text-orange-600", title: "База клиентов", desc: "Учёт долгов, бонусная система, кэшбэк. История покупок каждого клиента." },
              { icon: Sparkles, color: "bg-pink-50 text-pink-600", title: "AI Копилот", desc: "Умный ассистент знает ваш бизнес. Отвечает на вопросы по складу, продажам и расходам." },
              { icon: Globe, color: "bg-teal-50 text-teal-600", title: "Мультивалютность", desc: "UZS основная валюта. Поддержка USD, EUR, RUB, CNY с автообновлением курсов." },
              { icon: Bell, color: "bg-yellow-50 text-yellow-600", title: "Уведомления", desc: "Оповещения о низком складе, закрытии смены, долгах клиентов. В системе и Telegram." },
              { icon: Shield, color: "bg-red-50 text-red-600", title: "Роли и доступы", desc: "Разные права для владельца, кассира, кладовщика. Каждый видит только своё." },
              { icon: Smartphone, color: "bg-indigo-50 text-indigo-600", title: "Мобильный доступ", desc: "Работает на телефоне и планшете. Кассир продаёт с телефона. Владелец видит сводку." },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Простые и честные тарифы</h2>
            <p className="text-gray-500 text-lg">Начните бесплатно. Платите только когда убедитесь что система работает.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Стартер", price: "Бесплатно", period: "навсегда",
                color: "border-gray-200", badge: null as string | null,
                features: ["100 товаров", "2 сотрудника", "1 филиал", "Базовые продажи", "Учёт склада", "Расходы и доходы"],
              },
              {
                name: "Бизнес", price: "990,000", period: "сум/мес",
                color: "border-gray-200", badge: "Популярный" as string | null,
                features: ["2,000 товаров", "10 сотрудников", "Долговые продажи", "Поставщики", "База клиентов", "Экспорт CSV"],
              },
              {
                name: "Про", price: "7,500,000", period: "сум/мес",
                color: "border-purple-500 shadow-xl shadow-purple-100", badge: "Лучший выбор" as string | null,
                features: ["Безлимит товаров", "5 филиалов", "AI Копилот", "CRM + бонусы", "ABC анализ", "SMS уведомления"],
              },
              {
                name: "Корпорат", price: "15,000,000", period: "сум/мес",
                color: "border-gray-200", badge: null as string | null,
                features: ["Безлимит всего", "Интеграция 1С", "Маркетплейсы", "TSD терминалы", "API доступ", "Персональный менеджер"],
              },
            ].map((plan) => (
              <div key={plan.name} className={`bg-white border-2 ${plan.color} rounded-2xl p-6 relative`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</div>
                )}
                <h3 className="font-black text-gray-900 text-lg mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.name === "Про" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  {plan.name === "Стартер" ? "Начать бесплатно" : "Попробовать 30 дней"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Часто задаваемые вопросы</h2>
          <div className="space-y-4">
            {[
              { q: "Нужна ли карта для пробного периода?", a: "Нет. Регистрация бесплатна, карта не требуется. 30 дней полного доступа к тарифу Про." },
              { q: "Что будет с данными после окончания пробного периода?", a: "Ваши данные сохраняются. Перейдите в режим только для чтения — выберите тариф чтобы продолжить работу. Данные хранятся 90 дней после окончания." },
              { q: "Работает ли система на телефоне?", a: "Да. Касса оптимизирована для работы на телефоне и планшете. Сканирование штрихкода через камеру." },
              { q: "Можно ли работать с несколькими магазинами?", a: "Да. На тарифе Про поддерживается до 5 филиалов, на Корпорат — безлимитное количество." },
              { q: "Есть ли интеграция с принтером чеков?", a: "Да, поддерживаются термопринтеры через Bluetooth и USB (Epson, BIXOLON и другие)." },
            ].map((item) => (
              <div key={item.q} className="border border-gray-100 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Начните прямо сейчас</h2>
          <p className="text-purple-200 text-lg mb-8">30 дней бесплатно. Настройка за 5 минут. Без договоров.</p>
          <Link href="/register" className="bg-white text-purple-600 font-black px-10 py-4 rounded-2xl text-lg inline-flex items-center gap-2 hover:bg-purple-50 transition-all shadow-xl">
            Создать аккаунт бесплатно <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-bold">Sales System</span>
          </div>
          <p className="text-sm">© 2025 Sales System. Сделано в Узбекистане 🇺🇿</p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:text-white">Войти</Link>
            <Link href="/register" className="hover:text-white">Регистрация</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
