'use client';

import type {JSX} from 'react';
import {usePathname, useRouter} from 'next/navigation';

import {locales, localeNames, type Locale} from '@/lib/i18n/config';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setLocaleCookie(locale: string) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`;
}

export function LanguageSwitcher({current}: {current: Locale}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: Locale) {
    if (next === current) return;

    setLocaleCookie(next);

    const segments = pathname.split('/');
    segments[1] = next; // segments[0] is an empty string before the leading slash
    router.push(segments.join('/'));
  }

  return (
    <div role="group" aria-label="Language" className="flex items-center gap-2">
      {locales.map(locale => (
        <button
          key={locale}
          type="button"
          onClick={() => switchLocale(locale)}
          aria-current={locale === current ? 'true' : undefined}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-all ${
            locale === current
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
          }`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
