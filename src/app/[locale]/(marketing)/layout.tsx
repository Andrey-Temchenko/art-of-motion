import type {ReactNode} from 'react';

import {getDictionary} from '@/lib/i18n/get-dictionary';
import type {Locale} from '@/lib/i18n/config';

import {Navbar} from '@/components/marketing/Navbar';

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
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
