import React from 'react';

import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';
import {requireUser} from '@/lib/supabase/session';
import {getDateFnsLocale} from '@/lib/utils/date';
import {getClientBookings} from '@/services/bookingService';
import {BOOKING_STATUS} from '@/constants/bookingStatus';

import {BookingHistoryList} from '@/components/dashboard/BookingHistoryList';
import {BookingsList} from '@/components/dashboard/BookingsList';

export default async function MyBookingsPage(props: {params: Promise<{locale: Locale}>}) {
  const params = await props.params;
  const dict = await getDictionary(params.locale);

  const user = await requireUser();
  const bookings = await getClientBookings(user.id);
  const dateFnsLocale = getDateFnsLocale(params.locale);

  const now = new Date().getTime();
  const upcoming = bookings.filter(
    b => b.status === BOOKING_STATUS.CONFIRMED && new Date(b.slot.start_time).getTime() > now
  );
  const history = bookings.filter(
    b => b.status === BOOKING_STATUS.CANCELLED || new Date(b.slot.start_time).getTime() <= now
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 data-testid="my-bookings-title" className="text-3xl font-bold tracking-tight">
          {dict.dashboardArea.myBookingsPage.title}
        </h1>
        <p className="text-muted-foreground">{dict.dashboardArea.myBookingsPage.subtitle}</p>
      </div>

      <div className="space-y-6">
        <h2
          data-testid="tab-upcoming"
          className="border-border/40 text-muted-foreground/80 border-b pb-2 text-xl font-semibold">
          {dict.dashboardArea.myBookingsPage.tabs.upcoming}
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">{dict.dashboardArea.myBookingsPage.noBookings}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BookingsList bookings={upcoming} dict={dict} dateFnsLocale={dateFnsLocale} />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2
          data-testid="tab-history"
          className="border-border/40 text-muted-foreground/80 border-b pb-2 text-xl font-semibold">
          {dict.dashboardArea.myBookingsPage.tabs.history}
        </h2>
        {history.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">{dict.dashboardArea.myBookingsPage.noBookings}</p>
          </div>
        ) : (
          <BookingHistoryList loadMoreText={dict.dashboardArea.myBookingsPage.loadMore}>
            <BookingsList bookings={history} dict={dict} dateFnsLocale={dateFnsLocale} />
          </BookingHistoryList>
        )}
      </div>
    </div>
  );
}
