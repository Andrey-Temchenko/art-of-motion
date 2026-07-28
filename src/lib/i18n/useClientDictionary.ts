'use client';

import {useParams} from 'next/navigation';
import type {Dictionary} from '@/lib/i18n/types';
import {defaultLocale, locales, APP_LOCALES, type Locale} from '@/lib/i18n/config';

import uk from '@/locales/generated/uk.json';
import ru from '@/locales/generated/ru.json';
import en from '@/locales/generated/en.json';

const dicts: Record<Locale, Dictionary> = {
  [APP_LOCALES.UK]: uk as Dictionary,
  [APP_LOCALES.RU]: ru as Dictionary,
  [APP_LOCALES.EN]: en as Dictionary
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
