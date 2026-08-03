import {SLOT_STATUS} from '@/constants/slotStatus';

import type {Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {requireUser} from '@/lib/supabase/session';
import {getDateFnsLocale} from '@/lib/utils/date';
import {getLocationDictKey} from '@/lib/utils/locations';
import {formatKyivTime} from '@/lib/utils/timezone';

import {getScheduleSlots} from '@/services/bookingService';

import {BookingButton} from '@/components/dashboard/schedule/BookingButton';
import {BookingCard} from '@/components/shared/BookingCard';

export default async function SchedulePage(props: {params: Promise<{locale: Locale}>}) {
  const params = await props.params;
  const locale = params.locale;
  const dict = await getDictionary(locale);

  const dateFnsLocale = getDateFnsLocale(locale);

  // 1. Authenticate user
  const user = await requireUser();

  // 2. Fetch slots directly from service (already grouped and processed)
  const groupedSlots = await getScheduleSlots(user.id);

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

                  const dictKey = getLocationDictKey(slot.location);
                  // @ts-expect-error - indexing dynamic dictionary structure
                  const locationLabel = dict.contact?.clubs?.[dictKey]?.name || slot.location;

                  const statsRight = (
                    <span className={slot.is_full ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                      {slot.bookings_count} / {slot.max_capacity} {dict.dashboardArea.schedulePage.spots}
                    </span>
                  );

                  return (
                    <BookingCard
                      key={slot.id}
                      localizedTitle={localizedTitle}
                      startTime={slot.start_time}
                      locationLabel={locationLabel}
                      price={slot.price}
                      currencyLabel={dict.dashboardArea.schedulePage.currency}
                      statsRight={statsRight}>
                      <BookingButton
                        slotId={slot.id}
                        isBooked={slot.is_booked_by_user}
                        isFull={slot.is_full}
                        isDisabled={slot.status !== SLOT_STATUS.SCHEDULED}
                      />
                    </BookingCard>
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
