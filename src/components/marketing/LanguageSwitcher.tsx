'use client';

import type {JSX} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {ChevronDown, Globe} from 'lucide-react';

import {locales, localeNames, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale} from '@/lib/i18n/config';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

/** Short uppercase labels for the trigger button */
const localeShortLabels: Record<Locale, string> = {
  uk: 'UA',
  ru: 'RU',
  en: 'EN'
};

function setLocaleCookie(locale: string) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`;
}

export function LanguageSwitcher({current}: {current: Locale}): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    const nextLocale = next as Locale;
    if (nextLocale === current) return;

    setLocaleCookie(nextLocale);

    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/'));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="cursor-pointer gap-1.5 rounded-full px-3" />}
      >
        <Globe className="size-3.5" />
        <span className="text-xs font-semibold">{localeShortLabels[current]}</span>
        <ChevronDown className="size-3 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-32">
        <DropdownMenuRadioGroup value={current} onValueChange={switchLocale}>
          {locales.map(locale => (
            <DropdownMenuRadioItem key={locale} value={locale} className="cursor-pointer py-2 pr-8 pl-3">
              {localeNames[locale]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
