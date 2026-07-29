import React from 'react';
import {notFound} from 'next/navigation';

import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';
import {getDateFnsLocale} from '@/lib/utils/date';
import {getSlotDetails} from '@/services/slotService';
import {formatKyivTime} from '@/lib/utils/timezone';
import {getLocationDictKey} from '@/lib/utils/locations';
import {BOOKING_STATUS} from '@/constants/bookingStatus';
import {SLOT_STATUS} from '@/constants/slotStatus';

import {CancelBookingButton} from '@/components/admin/CancelBookingButton';

interface SlotDetailsPageProps {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
}

export default async function SlotDetailsPage({params}: SlotDetailsPageProps) {
  const resolvedParams = await params;
  const {locale, id} = resolvedParams;
  const dict = await getDictionary(locale);
  const t = dict.admin.slotDetailsPage;
  const tWorkouts = dict.workouts as Record<string, string>;

  const slotDetails = await getSlotDetails(id);
  if (!slotDetails) {
    notFound();
  }

  const dateLocale = getDateFnsLocale(locale);
  const formattedDate = formatKyivTime(new Date(slotDetails.start_time), 'dd MMM yyyy, HH:mm', {locale: dateLocale});

  const workoutName = slotDetails.workout_title_key
    ? tWorkouts[slotDetails.workout_title_key] || slotDetails.workout_title_key
    : '';

  const dictKey = getLocationDictKey(slotDetails.location);
  // @ts-expect-error - dynamic dictionary indexing
  const locationLabel = dict.contact?.clubs?.[dictKey]?.name || slotDetails.location;

  const isFull =
    slotDetails.bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length >= slotDetails.max_capacity;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card text-card-foreground space-y-4 rounded-xl border p-6 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{workoutName}</h2>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                slotDetails.status === SLOT_STATUS.CANCELLED
                  ? 'bg-red-100 text-red-700'
                  : isFull
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
              }`}>
              {slotDetails.status === SLOT_STATUS.CANCELLED
                ? t.status + ': Cancelled'
                : isFull
                  ? t.capacity + ': Full'
                  : t.status + ': Active'}
            </span>
          </div>
          <div className="text-muted-foreground grid gap-1 text-sm">
            <p>
              <strong>{formattedDate}</strong>
            </p>
            <p>{locationLabel}</p>
            <p>{slotDetails.price} ₴</p>
            <p>
              {t.capacity}: {slotDetails.bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length} /{' '}
              {slotDetails.max_capacity}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">{t.clientName}</th>
              <th className="p-4 font-medium">{t.clientEmail}</th>
              <th className="p-4 font-medium">{t.status}</th>
              <th className="p-4 text-right font-medium">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {slotDetails.bookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-muted-foreground p-4 text-center">
                  {t.noBookings}
                </td>
              </tr>
            ) : (
              slotDetails.bookings.map(booking => (
                <tr key={booking.id} className="border-t">
                  <td className="p-4">{booking.clientName || '-'}</td>
                  <td className="p-4">{booking.clientEmail || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        booking.status === BOOKING_STATUS.CONFIRMED
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {booking.status === BOOKING_STATUS.CONFIRMED && <CancelBookingButton bookingId={booking.id} />}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
