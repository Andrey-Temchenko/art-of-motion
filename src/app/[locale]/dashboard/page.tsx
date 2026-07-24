import React from 'react';

import {getUserProfile} from '@/lib/supabase/session';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';

export default async function DashboardPage(props: {params: Promise<{locale: Locale}>}) {
  const params = await props.params;
  const dict = await getDictionary(params.locale);
  const {profile} = await getUserProfile();

  return (
    <div className="space-y-6">
      <h1 className="text-h1 text-foreground">{dict.dashboardArea.homePage.title}</h1>
      <p className="text-muted-foreground text-lg">
        {dict.dashboardArea.homePage.welcome}{' '}
        <span className="text-foreground font-bold">
          {profile?.full_name || dict.dashboardArea.homePage.defaultClient}
        </span>
        {dict.dashboardArea.homePage.subtitle}
      </p>

      {/* Temporary placeholder for tickets to come */}
      <div className="border-border bg-card rounded-2xl border p-8 shadow-sm">
        <h2 className="text-h2 text-foreground mb-4">{dict.dashboardArea.homePage.scheduleTitle}</h2>
        <p className="text-muted-foreground">{dict.dashboardArea.homePage.noBookings}</p>
      </div>
    </div>
  );
}
