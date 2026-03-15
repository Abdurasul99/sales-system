"use client";

import { useState, useEffect } from "react";

interface TrialBannerProps {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-3 transition-opacity duration-300">
      <span>
        ⏱ Пробный период: осталось {daysLeft}{" "}
        {daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}
      </span>
      <span className="text-amber-200">•</span>
      <span>Выберите тариф чтобы продолжить работу</span>
    </div>
  );
}
