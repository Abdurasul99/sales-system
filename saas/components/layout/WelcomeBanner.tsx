"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isNew = sessionStorage.getItem("newAccount");
    if (isNew === "1") setShow(true);
  }, []);

  function dismiss() {
    sessionStorage.removeItem("newAccount");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center gap-3 shrink-0">
      <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          🎉 Аккаунт создан! У вас 30 дней бесплатного доступа к тарифу Про.
        </p>
        <p className="text-xs text-purple-200 mt-0.5">
          Начните с добавления товаров и первой продажи. Данные сохраняются навсегда после выбора тарифа.
        </p>
      </div>
      <Link
        href="/analytics"
        onClick={dismiss}
        className="hidden sm:flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg shrink-0 transition-colors"
      >
        Начать работу <ArrowRight className="w-3 h-3" />
      </Link>
      <button
        onClick={dismiss}
        className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors"
        aria-label="Закрыть"
      >
        <X className="w-4 h-4 text-white/80" />
      </button>
    </div>
  );
}
