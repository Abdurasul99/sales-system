"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { ru } from "@/lib/i18n/locales/ru";
import { en } from "@/lib/i18n/locales/en";
import { uz } from "@/lib/i18n/locales/uz";
import type { Translations, Locale } from "@/lib/i18n";

const localeMap: Record<Locale, Translations> = { ru, en, uz };

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "ru",
  t: ru,
  setLocale: () => {},
});

export function LocaleProvider({
  children,
  initialLocale = "ru",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    // Persist to cookie so server components pick it up on next request
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  const t = localeMap[locale] ?? ru;

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
