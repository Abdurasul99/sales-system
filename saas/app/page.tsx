import Link from "next/link";
import {
  BarChart3,
  Package,
  ShoppingCart,
  Truck,
  Users,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  Building2,
  Warehouse,
  DollarSign,
  ClipboardList,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Продажи и касса",
    desc: "Кассовые смены, возвраты, смешанная оплата, долги клиентов. Полный контроль над каждой транзакцией.",
  },
  {
    icon: Warehouse,
    title: "Склад и запасы",
    desc: "Остатки в реальном времени, движения товаров, ABC-анализ, контроль минимального уровня запасов.",
  },
  {
    icon: Truck,
    title: "Закупки",
    desc: "Заказы поставщикам, приёмка товара, контроль задолженностей и история поставок.",
  },
  {
    icon: Users,
    title: "Клиенты и CRM",
    desc: "База клиентов, сегментация, бонусная система, история покупок и задолженности.",
  },
  {
    icon: DollarSign,
    title: "Финансы",
    desc: "Доходы, расходы, курсы валют, cashflow. Понимайте прибыльность своего бизнеса.",
  },
  {
    icon: BarChart3,
    title: "Аналитика",
    desc: "Выручка, прибыль, топ товаров, сравнение периодов. Решения на основе данных.",
  },
  {
    icon: Building2,
    title: "Мультифилиальность",
    desc: "Управляйте несколькими точками продаж из одного интерфейса с разграничением прав.",
  },
  {
    icon: Shield,
    title: "Роли и безопасность",
    desc: "Администратор, кассир, кладовщик — каждый видит только то, что ему нужно.",
  },
  {
    icon: Globe,
    title: "Три языка",
    desc: "Интерфейс на русском, английском и узбекском. Переключение в один клик.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-gray-900">Sales System</span>
            </div>
            <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
              <a href="#features" className="hover:text-gray-900 transition-colors">Возможности</a>
              <a href="#contact" className="hover:text-gray-900 transition-colors">Контакты</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Войти
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                Попробовать бесплатно
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28 bg-gradient-to-b from-purple-50/50 to-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-700 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
            ERP / CRM / Складской учёт для бизнеса
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            Система управления
            <span className="text-purple-600"> продажами и бизнесом</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Всё необходимое для управления торговлей — в одном веб-приложении.
            Продажи, склад, закупки, CRM, финансы и аналитика для розничного и оптового бизнеса.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors"
            >
              Начать бесплатно — 1 месяц
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Войти в систему
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            {["Без установки", "Облачное хранение данных", "Поддержка 3 языков", "Мультифилиальность"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Всё для управления бизнесом
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Комплексное решение для розничной и оптовой торговли в Узбекистане
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 mb-4">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm leading-6 text-gray-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modules overview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                Полный контроль над торговлей
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                От кассы до управленческой отчётности — все данные в одном месте, без Excel и разрозненных таблиц.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: ClipboardList, text: "Учёт продаж с поддержкой наличных, карты, долгов и смешанной оплаты" },
                  { icon: Package, text: "Складской учёт с историей движений и ABC-классификацией товаров" },
                  { icon: TrendingUp, text: "Финансовая аналитика: выручка, прибыль, расходы в режиме реального времени" },
                  { icon: Users, text: "CRM с историей клиентов, бонусами и анализом задолженностей" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm leading-6 text-gray-700">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-400 font-mono">analytics dashboard</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Выручка сегодня", value: "4 850 000 UZS", warn: false },
                  { label: "Продаж", value: "47", warn: false },
                  { label: "Средний чек", value: "103 191 UZS", warn: false },
                  { label: "Товаров мало", value: "3 позиции", warn: true },
                  { label: "Прибыль за месяц", value: "12 340 000 UZS", warn: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5">
                    <span className="text-sm text-slate-300">{row.label}</span>
                    <span className={`text-sm font-bold ${row.warn ? "text-amber-400" : "text-white"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-purple-600/20 border border-purple-500/30 px-4 py-3">
                <p className="text-xs text-purple-200">Обновлено только что · Нажмите для детального отчёта →</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-purple-600">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Готовы начать?
          </h2>
          <p className="mt-4 text-lg text-purple-100">
            Попробуйте Sales System бесплатно — 1 месяц без ограничений. Без кредитной карты.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-purple-600 hover:bg-purple-50 transition-colors shadow-lg"
            >
              Зарегистрироваться бесплатно
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-400 px-6 py-3.5 text-base font-semibold text-white hover:bg-purple-700 transition-colors"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-gray-100 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-gray-900">Sales System</span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              ERP/CRM система управления торговлей для бизнеса в Узбекистане
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link href="/login" className="hover:text-gray-900 transition-colors">Войти</Link>
              <Link href="/register" className="hover:text-gray-900 transition-colors">Регистрация</Link>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Sales System. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
