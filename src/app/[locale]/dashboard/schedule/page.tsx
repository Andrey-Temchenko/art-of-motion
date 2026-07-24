import React from 'react';

import {requireUser} from '@/lib/supabase/session';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';
import {formatKyivTime} from '@/lib/utils/timezone';
import {getScheduleSlots, GroupedScheduleSlots} from '@/actions/clientBookings';
import {uk, ru, enUS} from 'date-fns/locale';

import {BookingButton} from '@/components/dashboard/BookingButton';

// Map enum values to dictionary keys
const locationToDictKey: Record<string, string> = {
  alpha: 'alfa',
  top_gun: 'topgun'
};

export default async function SchedulePage(props: {params: Promise<{locale: Locale}>}) {
  const params = await props.params;
  const locale = params.locale;
  const dict = await getDictionary(locale);

  const dateFnsLocale = locale === 'uk' ? uk : locale === 'ru' ? ru : enUS;

  // 1. Authenticate user
  const user = await requireUser();

  // 2. Fetch slots via server action (already grouped and processed)
  let groupedSlots: GroupedScheduleSlots = {};
  try {
    groupedSlots = await getScheduleSlots(user.id);
  } catch (err) {
    console.error(err);
    return <div>Error loading schedule.</div>;
  }

  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{dict.dashboardArea.schedulePage.title}</h1>
        <p className="text-muted-foreground">{dict.dashboardArea.schedulePage.subtitle}</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">{dict.dashboardArea.schedulePage.noSlots}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(dateKey => (
            <div key={dateKey} className="space-y-4">
              <h2 className="border-border/40 text-muted-foreground/80 border-b pb-2 text-xl font-semibold">
                {formatKyivTime(new Date(dateKey).toISOString(), 'EEEE, d MMMM', {locale: dateFnsLocale})}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedSlots[dateKey].map(slot => {
                  // Translations
                  const localizedTitle =
                    (dict.workouts as Record<string, string>)[slot.workout_title_key] || slot.workout_title_key;

                  const dictKey = locationToDictKey[slot.location];
                  // @ts-expect-error - indexing dynamic dictionary structure
                  const locationLabel = dict.contact?.clubs?.[dictKey]?.name || slot.location;

                  return (
                    <div
                      key={slot.id}
                      className="bg-card flex flex-col justify-between rounded-lg border p-4 shadow-sm">
                      <div className="mb-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-medium">{localizedTitle}</h3>
                          <span className="bg-primary/10 text-primary rounded px-2 py-1 text-sm font-semibold">
                            {formatKyivTime(slot.start_time, 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{locationLabel}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {slot.price} {dict.dashboardArea.schedulePage.currency}
                          </span>
                          <span className={slot.is_full ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            {slot.bookings_count} / {slot.max_capacity} {dict.dashboardArea.schedulePage.spots}
                          </span>
                        </div>
                      </div>
                      <BookingButton
                        slotId={slot.id}
                        isBooked={slot.is_booked_by_user}
                        isFull={slot.is_full}
                        isDisabled={slot.status !== 'scheduled'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
