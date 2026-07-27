import React from 'react';
import {uk, ru, enUS} from 'date-fns/locale';

import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';
import {requireUser} from '@/lib/supabase/session';
import {getClientBookings} from '@/actions/clientBookings';
import {formatKyivTime} from '@/lib/utils/timezone';
import {getLocationDictKey} from '@/lib/utils/locations';
import {BOOKING_STATUS} from '@/constants/bookingStatus';

import {BookingCard} from '@/components/dashboard/BookingCard';
import {MyBookingAction} from '@/components/dashboard/MyBookingAction';

// The utility function getLocationDictKey is used instead of a local mapping

export default async function MyBookingsPage(props: {params: Promise<{locale: Locale}>}) {
  const params = await props.params;
  const dict = await getDictionary(params.locale);

  const user = await requireUser();
  const bookings = await getClientBookings(user.id);
  const dateFnsLocale = params.locale === 'uk' ? uk : params.locale === 'ru' ? ru : enUS;

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
            {upcoming.map(booking => {
              const localizedTitle =
                (dict.workouts as Record<string, string>)[booking.slot.workout_title_key] ||
                booking.slot.workout_title_key;
              const dictKey = getLocationDictKey(booking.slot.location);
              // @ts-expect-error - indexing dynamic dictionary structure
              const locationLabel = dict.contact?.clubs?.[dictKey]?.name || booking.slot.location;

              return (
                <BookingCard
                  key={booking.id}
                  localizedTitle={localizedTitle}
                  startTime={booking.slot.start_time}
                  locationLabel={locationLabel}
                  price={booking.slot.price}
                  currencyLabel={dict.dashboardArea.schedulePage.currency}
                  dateLabel={formatKyivTime(booking.slot.start_time, 'd MMMM', {locale: dateFnsLocale})}>
                  <div className="mt-4">
                    <MyBookingAction
                      bookingId={booking.id}
                      status={booking.status}
                      cancellationDeadlineHours={booking.slot.cancellation_deadline_hours}
                      startTime={booking.slot.start_time}
                      dict={dict}
                    />
                  </div>
                </BookingCard>
              );
            })}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.map(booking => {
              const localizedTitle =
                (dict.workouts as Record<string, string>)[booking.slot.workout_title_key] ||
                booking.slot.workout_title_key;
              const dictKey = getLocationDictKey(booking.slot.location);
              // @ts-expect-error - indexing dynamic dictionary structure
              const locationLabel = dict.contact?.clubs?.[dictKey]?.name || booking.slot.location;

              return (
                <BookingCard
                  key={booking.id}
                  localizedTitle={localizedTitle}
                  startTime={booking.slot.start_time}
                  locationLabel={locationLabel}
                  price={booking.slot.price}
                  currencyLabel={dict.dashboardArea.schedulePage.currency}
                  dateLabel={formatKyivTime(booking.slot.start_time, 'd MMMM', {locale: dateFnsLocale})}>
                  <div className="mt-4">
                    <MyBookingAction
                      bookingId={booking.id}
                      status={booking.status}
                      cancellationDeadlineHours={booking.slot.cancellation_deadline_hours}
                      startTime={booking.slot.start_time}
                      dict={dict}
                    />
                  </div>
                </BookingCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
