// Client-safe i18n utilities — no server-only imports here.

import { ru } from "./locales/ru";
import { en } from "./locales/en";
import { uz } from "./locales/uz";
import type { Translations } from "./locales/ru";

export type Locale = "ru" | "en" | "uz";

export const LOCALES: Locale[] = ["ru", "en", "uz"];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "locale";

const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  uz: "O'zbek",
};

const translations: Record<Locale, Translations> = { ru, en, uz };

export function getTranslations(locale: Locale = DEFAULT_LOCALE): Translations {
  return translations[locale] ?? translations[DEFAULT_LOCALE];
}

export function getLocaleLabel(locale: Locale): string {
  return LOCALE_LABELS[locale];
}

export function parseLocale(value: string | undefined | null): Locale {
  if (value && LOCALES.includes(value as Locale)) return value as Locale;
  return DEFAULT_LOCALE;
}

export type { Translations };
export { ru, en, uz };
