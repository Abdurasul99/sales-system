// Server-only i18n utilities — safe to use only in Server Components and Route Handlers.

import { cookies } from "next/headers";
import { type Locale, DEFAULT_LOCALE, LOCALE_COOKIE, parseLocale } from "./index";

export async function getLocaleFromCookies(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(LOCALE_COOKIE)?.value;
    return parseLocale(value);
  } catch {
    return DEFAULT_LOCALE;
  }
}
