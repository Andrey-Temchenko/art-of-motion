import React from 'react';
import {LayoutDashboard, Users, Calendar, LayoutTemplate} from 'lucide-react';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';
import {getDictionary} from '@/lib/i18n/getDictionary';
import type {Locale} from '@/lib/i18n/config';
import {ROUTES, buildRoute} from '@/config/navigation';

import {Layout} from '@/components/shared/Layout';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const dict = await getDictionary(locale as Locale);

  // Authoritative server check: ONLY admins can access this boundary.
  const {user, profile} = await requireRole([USER_ROLES.ADMIN]);

  const navItems = [
    {
      label: dict.admin.nav.dashboard,
      href: buildRoute(locale, ROUTES.ADMIN.DASHBOARD),
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      label: dict.admin.nav.clients,
      href: buildRoute(locale, ROUTES.ADMIN.CLIENTS),
      icon: <Users className="h-4 w-4" />
    },
    {
      label: dict.admin.nav.slots,
      href: buildRoute(locale, ROUTES.ADMIN.SLOTS),
      icon: <Calendar className="h-4 w-4" />
    },
    {
      label: dict.admin.nav.templates,
      href: buildRoute(locale, ROUTES.ADMIN.TEMPLATES),
      icon: <LayoutTemplate className="h-4 w-4" />
    }
  ];

  return (
    <Layout navItems={navItems} dict={dict} locale={locale as Locale} user={user} role={profile?.role}>
      {children}
    </Layout>
  );
}
