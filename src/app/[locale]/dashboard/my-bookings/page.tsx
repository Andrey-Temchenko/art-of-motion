import React from 'react';

import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';

export default async function MyBookingsPage(props: {params: Promise<{locale: Locale}>}) {
  const params = await props.params;
  const dict = await getDictionary(params.locale);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{dict.dashboardArea.myBookingsPage.title}</h1>
        <p className="text-muted-foreground">{dict.dashboardArea.myBookingsPage.subtitle}</p>
      </div>
      <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center">
        {dict.dashboardArea.myBookingsPage.inDevelopment}
      </div>
    </div>
  );
}
