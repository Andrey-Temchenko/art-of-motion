import 'server-only';

import {defaultLocale, locales, APP_LOCALES, type Locale} from './config';
import type {Dictionary} from './types';

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  [APP_LOCALES.UK]: () => import('@/locales/generated/uk.json').then(m => m.default as Dictionary),
  [APP_LOCALES.RU]: () => import('@/locales/generated/ru.json').then(m => m.default as Dictionary),
  [APP_LOCALES.EN]: () => import('@/locales/generated/en.json').then(m => m.default as Dictionary)
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const resolved = locales.includes(locale) ? locale : defaultLocale;
  return loaders[resolved]();
}
