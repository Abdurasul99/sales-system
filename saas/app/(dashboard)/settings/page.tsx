"use client";
import { useEffect, useState } from "react";
import { Save, Building2, Bell, Shield, Palette } from "lucide-react";
import toast from "react-hot-toast";

interface OrgSettings {
  name: string;
  phone: string;
  address: string;
  timezone: string;
  primaryCurrency: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrgSettings>({ name: "", phone: "", address: "", timezone: "Asia/Tashkent", primaryCurrency: "UZS" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"general" | "notifications" | "security">("general");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data) setSettings(s => ({ ...s, ...data }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) toast.success("Настройки сохранены");
    else toast.error("Ошибка сохранения");
  };

  const tabs = [
    { id: "general", label: "Общие", icon: Building2 },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "security", label: "Безопасность", icon: Shield },
  ] as const;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-500 mt-1">Управление параметрами вашей организации</p>
      </div>

      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${tab === t.id ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1">
          {tab === "general" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Информация об организации</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (
                <form onSubmit={handleSave} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Название организации</label>
                    <input value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                    <input value={settings.address} onChange={e => setSettings(s => ({ ...s, address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс</label>
                      <select value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                        <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
                        <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                      <select value={settings.primaryCurrency} onChange={e => setSettings(s => ({ ...s, primaryCurrency: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                        <option value="UZS">UZS — Узбекский сум</option>
                        <option value="USD">USD — Доллар США</option>
                        <option value="RUB">RUB — Российский рубль</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
                      <Save className="w-4 h-4" /> {saving ? "Сохранение..." : "Сохранить"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {tab === "notifications" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Настройки уведомлений</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Уведомления о низком остатке", desc: "Когда товар на складе ниже минимального уровня" },
                  { label: "Уведомления о долгах", desc: "Напоминания о просроченных долгах клиентов" },
                  { label: "Ежедневный отчёт", desc: "Отчёт о выручке и продажах за день" },
                  { label: "Уведомления о новых продажах", desc: "Оповещение при каждой продаже" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                      <div className="w-10 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Безопасность</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800 mb-1">Сессии автоматически истекают через 24 часа</div>
                  <div className="text-xs text-blue-600">Все сессии хранятся в базе данных и могут быть отозваны</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Политика паролей</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Минимум 8 символов
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Хранятся в виде bcrypt хэша (12 раундов)
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Токены сессий подписаны JWT с HS256
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Роли и доступ</h3>
                  <div className="space-y-2">
                    {[
                      { role: "SUPERADMIN", desc: "Полный доступ ко всем организациям" },
                      { role: "ADMIN", desc: "Управление своей организацией" },
                      { role: "CASHIER", desc: "Продажи и клиенты" },
                      { role: "WAREHOUSE_CLERK", desc: "Склад и поставки" },
                      { role: "SUPPLIER_CONTACT", desc: "Только просмотр заказов" },
                    ].map(r => (
                      <div key={r.role} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                        <span className="font-mono text-purple-600 text-xs font-medium">{r.role}</span>
                        <span className="text-gray-500">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
