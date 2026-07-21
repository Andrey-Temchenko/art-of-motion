'use client';

import {useParams} from 'next/navigation';
import type {Dictionary} from '@/lib/i18n/types';
import {defaultLocale, locales, type Locale} from '@/lib/i18n/config';

import uk from '@/locales/generated/uk.json';
import ru from '@/locales/generated/ru.json';
import en from '@/locales/generated/en.json';

const dicts: Record<Locale, Dictionary> = {
  uk: uk as Dictionary,
  ru: ru as Dictionary,
  en: en as Dictionary
};

export function useClientDictionary() {
  const params = useParams<{locale: string}>();

  const locale =
    params?.locale && locales.includes(params.locale as Locale) ? (params.locale as Locale) : defaultLocale;

  return {
    dict: dicts[locale],
    locale
  };
}
