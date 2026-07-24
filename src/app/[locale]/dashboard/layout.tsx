import React from 'react';
import {Calendar, ClipboardList} from 'lucide-react';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';
import {getDictionary} from '@/lib/i18n/getDictionary';
import type {Locale} from '@/lib/i18n/config';
import {ROUTES, buildRoute} from '@/config/navigation';

import {Layout} from '@/components/shared/Layout';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  // Authoritative server check: only clients (or admins) can access the dashboard.
  const {user, profile} = await requireRole([USER_ROLES.CLIENT, USER_ROLES.ADMIN]);

  const navItems = [
    {
      label: dict.dashboardArea.nav.schedule,
      href: buildRoute(locale, ROUTES.DASHBOARD.SCHEDULE),
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: dict.dashboardArea.nav.myBookings,
      href: buildRoute(locale, ROUTES.DASHBOARD.MY_BOOKINGS),
      icon: <ClipboardList className="h-4 w-4" />
    }
  ];

  return (
    <Layout navItems={navItems} dict={dict} locale={locale as Locale} user={user} role={profile?.role}>
      {children}
    </Layout>
  );
}
