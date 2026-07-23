import React from 'react';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';

import {BackButton} from '@/components/shared/BackButton';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Authoritative server check: only clients (or admins) can access the dashboard.
  await requireRole([USER_ROLES.CLIENT, USER_ROLES.ADMIN]);

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <BackButton href={`/${locale}`} ariaLabel="Back to home" />
      {/* Dashboard Header/Sidebar will go here later */}
      <main className="flex-1 p-8 pt-24">{children}</main>
    </div>
  );
}
