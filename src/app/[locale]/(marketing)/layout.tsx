import type {ReactNode} from 'react';

import {getDictionary} from '@/lib/i18n/get-dictionary';
import type {Locale} from '@/lib/i18n/config';

import {LanguageSwitcher} from '@/components/marketing/language-switcher';

export default async function MarketingLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-6 md:gap-10">
            <span className="text-primary text-xl font-bold tracking-tight">
              {dict.meta.siteName.split('—')[0].trim()}
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href={`/${locale}#schedule`} className="hover:text-primary text-muted-foreground transition-colors">
              {dict.nav.schedule}
            </a>
            <a href={`/${locale}/login`} className="hover:text-primary text-muted-foreground transition-colors">
              {dict.nav.login}
            </a>
            <div className="border-border ml-4 border-l pl-4">
              <LanguageSwitcher current={locale as Locale} />
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
