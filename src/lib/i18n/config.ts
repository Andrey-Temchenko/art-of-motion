export const locales = ['uk', 'ru', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'uk';

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeNames: Record<Locale, string> = {
  uk: 'Українська',
  ru: 'Русский',
  en: 'English'
};
