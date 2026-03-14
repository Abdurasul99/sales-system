"use client";

import { useState } from "react";
import { DollarSign, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface CurrencyPanelProps {
  currencies: string[];
  currentRates: Record<string, number>;
  organizationId: string;
  history: { id: string; fromCurrency: string; toCurrency: string; rate: number; source: string; effectiveDate: string }[];
}

const CURRENCY_SYMBOLS: Record<string, string> = { UZS: "сум", USD: "$", EUR: "€", RUB: "₽", CNY: "¥" };
const CURRENCY_FLAGS: Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", RUB: "🇷🇺", CNY: "🇨🇳" };

export function CurrencyPanel({ currencies, currentRates, organizationId, history }: CurrencyPanelProps) {
  const [rates, setRates] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const c of currencies) { init[c] = currentRates[`${c}_UZS`] ?? 0; }
    return init;
  });
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converterFrom, setConverterFrom] = useState("USD");
  const [converterTo, setConverterTo] = useState("UZS");
  const [converterAmount, setConverterAmount] = useState("1");

  function convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;
    const fromRate = from === "UZS" ? 1 : (rates[from] ?? 1);
    const toRate = to === "UZS" ? 1 : (rates[to] ?? 1);
    return (amount * fromRate) / toRate;
  }

  async function syncFromCBU() {
    setSyncing(true);
    try {
      const res = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/");
      const data = await res.json();
      const newRates: Record<string, number> = { ...rates };
      for (const r of data) {
        if (currencies.includes(r.Ccy)) {
          newRates[r.Ccy] = parseFloat(r.Rate) / parseInt(r.Nominal);
        }
      }
      setRates(newRates);
      toast.success("Курсы обновлены из ЦБ Узбекистана");
    } catch { toast.error("Ошибка загрузки курсов ЦБ"); }
    finally { setSyncing(false); }
  }

  async function saveRates() {
    setSaving(true);
    try {
      const res = await fetch("/api/currency/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          rates: currencies.map((c) => ({ fromCurrency: c, toCurrency: "UZS", rate: rates[c] ?? 0, source: "MANUAL" })),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Курсы сохранены");
    } catch { toast.error("Ошибка сохранения"); }
    finally { setSaving(false); }
  }

  const convertedAmount = convert(parseFloat(converterAmount) || 0, converterFrom, converterTo);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Rate cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Курсы валют к UZS</h2>
        <button onClick={syncFromCBU} disabled={syncing} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Загрузка..." : "Синхронизировать с ЦБ"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {currencies.map((currency) => (
          <div key={currency} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{CURRENCY_FLAGS[currency] ?? "🌐"}</span>
              <span className="font-semibold text-gray-700">{currency}</span>
            </div>
            <p className="text-xs text-gray-400 mb-1.5">1 {currency} =</p>
            <input
              type="number"
              value={rates[currency] ?? ""}
              onChange={(e) => setRates((prev) => ({ ...prev, [currency]: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-400 mt-1">{CURRENCY_SYMBOLS.UZS}</p>
          </div>
        ))}
      </div>

      <button onClick={saveRates} disabled={saving} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-purple-100 disabled:opacity-60">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Сохраняем...</> : <>Сохранить курсы</>}
      </button>

      {/* Converter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />Конвертер валют
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <input
              type="number"
              value={converterAmount}
              onChange={(e) => setConverterAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select value={converterFrom} onChange={(e) => setConverterFrom(e.target.value)} className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              {["UZS", ...currencies].map((c) => <option key={c} value={c}>{c} — {CURRENCY_SYMBOLS[c]}</option>)}
            </select>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
          <div className="flex-1 w-full">
            <div className="w-full px-4 py-3 border border-purple-200 bg-purple-50 rounded-xl text-lg font-bold text-purple-700">
              {formatNumber(convertedAmount)}
            </div>
            <select value={converterTo} onChange={(e) => setConverterTo(e.target.value)} className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              {["UZS", ...currencies].map((c) => <option key={c} value={c}>{c} — {CURRENCY_SYMBOLS[c]}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Rate history */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">История изменений</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Пара</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Курс</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Источник</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Дата</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-6 py-3 font-medium text-gray-800">{r.fromCurrency} → {r.toCurrency}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(r.rate)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${r.source === "CBU_API" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{r.source === "CBU_API" ? "ЦБ Узбекистана" : "Вручную"}</span></td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{new Date(r.effectiveDate).toLocaleString("ru-RU")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
