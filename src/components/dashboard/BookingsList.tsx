import React from 'react';

import type {ProcessedClientBooking} from '@/services/types';
import type {getDictionary} from '@/lib/i18n/getDictionary';
import type {getDateFnsLocale} from '@/lib/utils/date';
import {getLocationDictKey} from '@/lib/utils/locations';
import {formatKyivTime} from '@/lib/utils/timezone';

import {BookingCard} from '@/components/dashboard/BookingCard';
import {MyBookingAction} from '@/components/dashboard/MyBookingAction';

export interface BookingsListProps {
  bookings: ProcessedClientBooking[];
  dict: Awaited<ReturnType<typeof getDictionary>>;
  dateFnsLocale: ReturnType<typeof getDateFnsLocale>;
}

export function BookingsList({bookings, dict, dateFnsLocale}: BookingsListProps) {
  return (
    <>
      {bookings.map(booking => {
        const localizedTitle =
          (dict.workouts as Record<string, string>)[booking.slot.workout_title_key] || booking.slot.workout_title_key;
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
              />
            </div>
          </BookingCard>
        );
      })}
    </>
  );
}
