import React from 'react';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';

import {BackButton} from '@/components/shared/BackButton';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Authoritative server check: ONLY admins can access this boundary.
  await requireRole([USER_ROLES.ADMIN]);

  return (
    <div className="bg-background relative flex min-h-screen">
      <BackButton href={`/${locale}/dashboard`} ariaLabel="Back to dashboard" />
      {/* Admin Sidebar will go here */}
      <aside className="border-border bg-card hidden w-64 border-r p-6 pt-24 md:block">
        <h2 className="text-h3 text-foreground mb-8 font-bold">Admin Panel</h2>
        <nav className="space-y-4">
          <a href="#" className="text-primary block font-medium">
            Dashboard
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground block transition-colors">
            Users
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground block transition-colors">
            Schedule
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8 pt-24">{children}</main>
    </div>
  );
}
