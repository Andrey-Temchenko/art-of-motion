export const APP_LOCALES = {
  UK: 'uk',
  RU: 'ru',
  EN: 'en'
} as const;

export const locales = [APP_LOCALES.UK, APP_LOCALES.RU, APP_LOCALES.EN] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = APP_LOCALES.UK;

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeNames: Record<Locale, string> = {
  [APP_LOCALES.UK]: 'Українська',
  [APP_LOCALES.RU]: 'Русский',
  [APP_LOCALES.EN]: 'English'
};

export const localeShortNames: Record<Locale, string> = {
  [APP_LOCALES.UK]: 'UA',
  [APP_LOCALES.RU]: 'RU',
  [APP_LOCALES.EN]: 'EN'
};
