import type {ReactNode} from 'react';

import type {Locale} from '@/lib/i18n/config';
import {getUserProfile} from '@/lib/supabase/session';

import {Navbar} from '@/components/marketing/Navbar';
import {SiteFooter} from '@/components/marketing/SiteFooter';
import {ScrollToTop} from '@/components/marketing/ScrollToTop';

export default async function MarketingLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const {user, profile} = await getUserProfile();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Navbar locale={locale} user={user} role={profile?.role} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
      <ScrollToTop />
    </div>
  );
}
