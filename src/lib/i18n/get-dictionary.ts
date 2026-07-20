import 'server-only';

import {defaultLocale, locales, type Locale} from './config';
import type {Dictionary} from './types';

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  uk: () => import('@/locales/generated/uk.json').then(m => m.default as Dictionary),
  ru: () => import('@/locales/generated/ru.json').then(m => m.default as Dictionary),
  en: () => import('@/locales/generated/en.json').then(m => m.default as Dictionary)
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const resolved = locales.includes(locale) ? locale : defaultLocale;
  return loaders[resolved]();
}
