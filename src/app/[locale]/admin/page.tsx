import React from 'react';
import dynamic from 'next/dynamic';

import {getUserProfile} from '@/lib/supabase/session';
import {getAdminOverviewStats} from '@/actions/admin';
import {getDictionary} from '@/lib/i18n/getDictionary';

const OverviewCharts = dynamic(() => import('@/components/admin/OverviewCharts').then(mod => mod.OverviewCharts));
import {Locale} from '@/lib/i18n/config';

export default async function AdminPage(props: {params: Promise<{locale: Locale}>}) {
  const {locale} = await props.params;
  const {profile} = await getUserProfile();
  const statsRes = await getAdminOverviewStats();

  if (!statsRes.success) {
    throw new Error(statsRes.error);
  }

  const stats = statsRes.data;

  const dict = await getDictionary(locale);

  // Replace {name} placeholder
  const welcomeText = dict.admin.overviewPage.welcome.replace(
    '{name}',
    `<span class="text-foreground font-bold">${profile?.full_name || ''}</span>`
  );

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-foreground">{dict.admin.overviewPage.title}</h1>
      <p className="text-muted-foreground text-lg" dangerouslySetInnerHTML={{__html: welcomeText}} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-8 shadow-sm">
          <h3 className="text-h3 text-foreground mb-2">{dict.admin.overviewPage.totalClients}</h3>
          <p className="text-display">{stats.totalUsers}</p>
        </div>
        <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-8 shadow-sm">
          <h3 className="text-h3 text-foreground mb-2">{dict.admin.overviewPage.activeBookings}</h3>
          <p className="text-display">{stats.activeBookings}</p>
        </div>
        <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-8 shadow-sm">
          <h3 className="text-h3 text-foreground mb-2">{dict.admin.overviewPage.upcomingSlots}</h3>
          <p className="text-display">{stats.upcomingSlots}</p>
        </div>
        <div className="border-border bg-card relative flex flex-col justify-between rounded-2xl border p-8 shadow-sm">
          <h3 className="text-h3 text-foreground mb-2">{dict.admin.overviewPage.revenueEstimate}</h3>
          <p className="text-display">{stats.revenueEstimate} ₴</p>
        </div>
      </div>

      <div className="mt-8">
        <OverviewCharts bookingsByDay={stats.bookingsByDay} workoutTypePopularity={stats.workoutTypePopularity} />
      </div>
    </div>
  );
}
