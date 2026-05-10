"use client";
import { useEffect, useState } from "react";
import { Save, Building2, Bell, Shield, Send, Copy, Check, Loader2, CheckCircle, XCircle, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n";

interface OrgSettings {
  name: string;
  phone: string;
  address: string;
  timezone: string;
  primaryCurrency: string;
}

interface TelegramStatus {
  connected: boolean;
  token: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrgSettings>({ name: "", phone: "", address: "", timezone: "Asia/Tashkent", primaryCurrency: "UZS" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"general" | "notifications" | "security" | "telegram" | "language">("general");

  // Telegram state
  const [tg, setTg] = useState<TelegramStatus>({ connected: false, token: null });
  const [tgLoading, setTgLoading] = useState(false);
  const [tgGenerating, setTgGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { if (data) setSettings(s => ({ ...s, ...data })); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "telegram") return;
    setTgLoading(true);
    fetch("/api/telegram/connect")
      .then(r => r.json())
      .then(d => setTg(d))
      .finally(() => setTgLoading(false));
  }, [tab]);

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

  async function generateToken() {
    setTgGenerating(true);
    const res = await fetch("/api/telegram/connect", { method: "POST" });
    const data = await res.json();
    setTgGenerating(false);
    if (res.ok) setTg({ connected: false, token: data.token });
    else toast.error("Ошибка генерации кода");
  }

  async function disconnectTelegram() {
    await fetch("/api/telegram/connect", { method: "DELETE" });
    setTg({ connected: false, token: null });
    toast.success("Telegram отключён");
  }

  function copyCommand() {
    if (!tg.token) return;
    navigator.clipboard.writeText(`/connect ${tg.token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "salessystemuz_bot";

  const { locale, setLocale } = useLocale();

  const tabs = [
    { id: "general", label: "Общие", icon: Building2 },
    { id: "notifications", label: "Уведомления", icon: Bell },
    { id: "telegram", label: "Telegram", icon: Send },
    { id: "security", label: "Безопасность", icon: Shield },
    { id: "language", label: "Язык", icon: Globe },
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

          {tab === "telegram" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Send className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Telegram уведомления</h2>
                  <p className="text-xs text-gray-500">Получайте отчёты и уведомления в Telegram</p>
                </div>
              </div>

              <div className="p-6">
                {tgLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : tg.connected ? (
                  /* Connected state */
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Telegram подключён</p>
                        <p className="text-xs text-green-600">Вы будете получать уведомления в вашем Telegram</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Доступные команды в боте:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { cmd: "/today", desc: "Итоги за сегодня" },
                          { cmd: "/stock", desc: "Низкий остаток" },
                          { cmd: "/top", desc: "Топ-5 товаров" },
                          { cmd: "/help", desc: "Все команды" },
                        ].map(c => (
                          <div key={c.cmd} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <code className="text-xs font-bold text-purple-600">{c.cmd}</code>
                            <span className="text-xs text-gray-500">{c.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium">
                        <Send className="w-4 h-4" /> Открыть бота
                      </a>
                      <button onClick={disconnectTelegram}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700">
                        <XCircle className="w-4 h-4" /> Отключить
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Not connected state */
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                      Подключите Telegram чтобы получать уведомления о продажах, складе и ежедневные отчёты прямо в мессенджере.
                    </p>

                    {/* Steps */}
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Откройте бота в Telegram</p>
                          <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            <Send className="w-3 h-3" /> @{botUsername}
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Получите код подключения</p>
                          <p className="text-xs text-gray-500 mb-2">Нажмите кнопку ниже чтобы сгенерировать одноразовый код</p>
                          {tg.token ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
                                <code className="text-sm font-bold text-gray-900 tracking-widest">/connect {tg.token}</code>
                              </div>
                              <button onClick={copyCommand}
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <button onClick={generateToken} disabled={tgGenerating}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg disabled:opacity-50">
                              {tgGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                              Сгенерировать код
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Отправьте код боту</p>
                          <p className="text-xs text-gray-500">Скопируйте команду выше и отправьте её боту. Готово!</p>
                        </div>
                      </div>
                    </div>

                    {tg.token && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        ⚠️ Код одноразовый и действует 24 часа. После отправки боту подключение активируется автоматически.
                      </div>
                    )}
                  </div>
                )}
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
                    {["Минимум 8 символов", "Хранятся в виде bcrypt хэша (12 раундов)", "Токены сессий подписаны JWT с HS256"].map(t => (
                      <div key={t} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> {t}
                      </div>
                    ))}
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

          {tab === "language" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Язык интерфейса</h2>
                <p className="text-sm text-gray-500 mt-1">Выберите язык для отображения интерфейса</p>
              </div>
              <div className="p-6">
                <div className="grid gap-3 max-w-sm">
                  {([ ["ru", "Русский", "Основной язык интерфейса"], ["en", "English", "Interface language"], ["uz", "O'zbek", "Interfeys tili"] ] as [Locale, string, string][]).map(([code, label, hint]) => (
                    <button
                      key={code}
                      onClick={() => { setLocale(code); toast.success(`Язык изменён на ${label}`); }}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                        locale === code
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-semibold ${locale === code ? "text-purple-700" : "text-gray-900"}`}>{label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{hint}</div>
                      </div>
                      {locale === code && (
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs text-gray-400">Изменение языка применяется немедленно. Перезагрузка страницы не требуется.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
