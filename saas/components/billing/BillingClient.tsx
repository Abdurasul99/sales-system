"use client";

import { useState } from "react";
import { Check, Zap, Building2, Crown, Sparkles, AlertCircle, Clock, CreditCard, ArrowRight } from "lucide-react";
import { cn, formatUzs } from "@/lib/utils";
import toast from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceUzs: number;
  maxProducts: number | null;
  maxEmployees: number | null;
  maxBranches: number | null;
  features: { feature: string; enabled: boolean }[];
}

interface BillingClientProps {
  currentPlan: { id: string; name: string; slug: string; priceUzs: number } | null;
  isTrial: boolean;
  trialDaysLeft: number;
  trialEndsAt: string | null;
  plans: Plan[];
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  starter: Zap,
  biznes: Building2,
  pro: Sparkles,
  korporat: Crown,
};

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  starter:  { bg: "bg-gray-50",    text: "text-gray-700",   border: "border-gray-200",  badge: "bg-gray-100 text-gray-600" },
  biznes:   { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",  badge: "bg-blue-100 text-blue-700" },
  pro:      { bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-300", badge: "bg-purple-600 text-white" },
  korporat: { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
};

const PLAN_FEATURE_MAP: Record<string, string[]> = {
  starter:  ["До 100 товаров", "2 сотрудника", "1 филиал", "POS-кассир", "Базовая аналитика", "Склад и списания"],
  biznes:   ["До 2,000 товаров", "10 сотрудников", "2 филиала", "Поставщики", "Клиенты + долги", "Экспорт CSV", "Все роли"],
  pro:      ["Безлимит товаров", "25 сотрудников", "5 филиалов", "AI Копилот", "ABC анализ", "Бонусная программа", "Расширенная аналитика", "Закупки"],
  korporat: ["Всё из Pro", "Безлимит сотрудников", "Безлимит филиалов", "API доступ", "White-label", "1С интеграция", "Выделенная поддержка"],
};

const POPULAR_PLAN = "pro";

export function BillingClient({ currentPlan, isTrial, trialDaysLeft, trialEndsAt, plans }: BillingClientProps) {
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  function handleSelectPlan(plan: Plan) {
    if (plan.slug === currentPlan?.slug && !isTrial) {
      toast("Этот тариф уже активен");
      return;
    }
    setSelectedPlan(plan);
    setShowContactModal(true);
  }

  async function handleConfirmUpgrade() {
    if (!selectedPlan) return;
    setUpgrading(selectedPlan.id);
    try {
      // In production: integrate with Payme/Click/Uzum Pay
      // For now: send a request to contact sales / generate invoice
      await new Promise(r => setTimeout(r, 1200));
      toast.success(`Запрос на подключение тарифа «${selectedPlan.name}» отправлен. Менеджер свяжется с вами в течение 1 часа.`);
      setShowContactModal(false);
    } finally {
      setUpgrading(null);
    }
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Тарифный план и биллинг</h1>
        <p className="text-gray-500 mt-1">Управляйте подпиской и доступными функциями</p>
      </div>

      {/* Current Status Card */}
      <div className={cn(
        "rounded-2xl border p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4",
        isTrial ? "bg-amber-50 border-amber-200" : "bg-purple-50 border-purple-200"
      )}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", isTrial ? "bg-amber-100" : "bg-purple-100")}>
          {isTrial ? <Clock className="w-6 h-6 text-amber-600" /> : <CreditCard className="w-6 h-6 text-purple-600" />}
        </div>
        <div className="flex-1">
          <p className={cn("font-semibold", isTrial ? "text-amber-800" : "text-purple-800")}>
            {isTrial
              ? `Пробный период: осталось ${trialDaysLeft} ${trialDaysLeft === 1 ? "день" : trialDaysLeft < 5 ? "дня" : "дней"}`
              : `Текущий тариф: ${currentPlan?.name ?? "Не выбран"}`
            }
          </p>
          <p className={cn("text-sm mt-0.5", isTrial ? "text-amber-600" : "text-purple-600")}>
            {isTrial
              ? `Пробный доступ к тарифу Про истекает ${trialEndsAt ? new Date(trialEndsAt).toLocaleDateString("ru-RU") : "скоро"}. Выберите тариф чтобы продолжить работу.`
              : `Все данные сохранены · Автопродление активно`
            }
          </p>
        </div>
        {isTrial && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Выберите тариф
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = PLAN_ICONS[plan.slug] ?? Zap;
          const colors = PLAN_COLORS[plan.slug] ?? PLAN_COLORS.starter;
          const features = PLAN_FEATURE_MAP[plan.slug] ?? [];
          const isCurrent = plan.slug === currentPlan?.slug && !isTrial;
          const isPopular = plan.slug === POPULAR_PLAN;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border-2 p-5 flex flex-col transition-all",
                isPopular ? "border-purple-400 shadow-lg shadow-purple-100" : "border-gray-200 hover:border-gray-300",
                isCurrent && "ring-2 ring-green-400"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Популярный
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Текущий
                </div>
              )}

              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", colors.bg)}>
                <Icon className={cn("w-5 h-5", colors.text)} />
              </div>

              <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>

              <div className="my-3">
                {plan.priceUzs === 0 ? (
                  <p className="text-2xl font-bold text-gray-900">Бесплатно</p>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatUzs(plan.priceUzs)}
                    </p>
                    <p className="text-xs text-gray-400">в месяц</p>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1 mb-1">
                {plan.maxProducts && <p>📦 До {plan.maxProducts.toLocaleString("ru-RU")} товаров</p>}
                {!plan.maxProducts && <p>📦 Безлимит товаров</p>}
                {plan.maxEmployees && <p>👤 До {plan.maxEmployees} сотрудников</p>}
                {!plan.maxEmployees && <p>👤 Безлимит сотрудников</p>}
                {plan.maxBranches && <p>🏪 До {plan.maxBranches} филиалов</p>}
                {!plan.maxBranches && <p>🏪 Безлимит филиалов</p>}
              </div>

              <div className="border-t border-gray-100 my-3" />

              <ul className="space-y-1.5 flex-1">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isCurrent}
                className={cn(
                  "mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                  isCurrent
                    ? "bg-green-50 text-green-700 cursor-default border border-green-200"
                    : isPopular
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                )}
              >
                {isCurrent ? (
                  <><Check className="w-4 h-4" /> Активен</>
                ) : (
                  <>Выбрать <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment info */}
      <div className="mt-8 p-5 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Способы оплаты</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-600">P</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Payme</p>
              <p className="text-xs text-gray-500">Онлайн оплата картой Uzcard / Humo</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-orange-600">C</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Click</p>
              <p className="text-xs text-gray-500">Оплата через Click Up</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-green-600">T</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Перевод / Счёт</p>
              <p className="text-xs text-gray-500">Банковский перевод для юридических лиц</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          После выбора тарифа наш менеджер свяжется с вами в течение 1 рабочего часа для оформления оплаты.
          Все платежи защищены. Данные карты не хранятся на наших серверах.
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { q: "Что будет после окончания пробного периода?", a: "Аккаунт переходит в режим чтения. Все данные сохраняются. Для продолжения работы нужно выбрать тариф." },
          { q: "Можно ли сменить тариф?", a: "Да, в любое время. При апгрейде разница оплачивается пропорционально. При даунгрейде — переход со следующего периода." },
          { q: "Есть ли скидки для нескольких магазинов?", a: "Да, при подключении 3+ филиалов действует скидка 15%. Свяжитесь с менеджером." },
          { q: "Как работает автопродление?", a: "Подписка продлевается автоматически каждые 30 дней. Уведомление за 3 дня до списания." },
        ].map((item, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-900 mb-1">{item.q}</p>
            <p className="text-xs text-gray-500">{item.a}</p>
          </div>
        ))}
      </div>

      {/* Upgrade Modal */}
      {showContactModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Подключить тариф «{selectedPlan.name}»
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Стоимость: <span className="font-semibold text-gray-900">{formatUzs(selectedPlan.priceUzs)}/месяц</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                После подтверждения наш менеджер свяжется с вами для оформления оплаты через Payme, Click или банковский перевод.
                Тариф активируется сразу после подтверждения оплаты.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={!!upgrading}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                {upgrading ? "Отправка..." : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
