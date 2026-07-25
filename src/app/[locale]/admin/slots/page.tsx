import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale} from '@/lib/i18n/config';
import {formatKyivTime} from '@/lib/utils/timezone';
import {Constants} from '@/types/database.types';

import {CreateSlotDialog} from '@/components/admin/CreateSlotDialog';
import {getWorkoutTypes, getAdminSlots} from '@/actions/adminSlots';
import {uk, ru, enUS} from 'date-fns/locale';

// Map enum values to dictionary keys
const locationToDictKey: Record<string, string> = {
  [Constants.public.Enums.club_location[0]]: 'alfa',
  [Constants.public.Enums.club_location[1]]: 'topgun'
};

export default async function AdminSlotsPage(props: {params: Promise<{locale: Locale}>}) {
  const {locale} = await props.params;
  await requireRole([USER_ROLES.ADMIN]);

  const dict = await getDictionary(locale);

  const dateFnsLocale = locale === 'uk' ? uk : locale === 'ru' ? ru : enUS;

  // Fetch data via server actions/functions
  const workoutTypes = await getWorkoutTypes();
  const slots = await getAdminSlots();

  // Map workout types with localized title
  const localizedWorkoutTypes = workoutTypes.map(wt => ({
    ...wt,
    title: (dict.workouts as Record<string, string>)[wt.title] || wt.title
  }));

  // Map location options
  const locationOptions = Constants.public.Enums.club_location.map(loc => {
    const dictKey = locationToDictKey[loc] || loc;
    // @ts-expect-error - dynamic dictionary indexing
    const label = dict.contact?.clubs?.[dictKey]?.name || loc;
    return {value: loc, label};
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dict.admin.slotsPage.title}</h1>
          <p className="text-muted-foreground">{dict.admin.slotsPage.subtitle}</p>
        </div>
        <CreateSlotDialog
          workoutTypes={localizedWorkoutTypes}
          locationOptions={locationOptions}
          existingSlots={slots}
          dict={dict.admin.slotsPage.form}
          title={dict.admin.slotsPage.createSlot}
          buttonText={dict.admin.slotsPage.createSlot}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{dict.admin.slotsPage.upcomingSlots}</h2>
        <div className="bg-card overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground border-b text-xs uppercase">
              <tr>
                <th className="px-4 py-3">{dict.admin.slotsPage.table.dateTime}</th>
                <th className="px-4 py-3">{dict.admin.slotsPage.table.workout}</th>
                <th className="px-4 py-3">{dict.admin.slotsPage.table.location}</th>
                <th className="px-4 py-3">{dict.admin.slotsPage.table.bookings}</th>
                <th className="px-4 py-3">{dict.admin.slotsPage.table.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {slots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted-foreground px-4 py-4 text-center">
                    {dict.admin.slotsPage.noSlots}
                  </td>
                </tr>
              ) : (
                slots.map(slot => {
                  const localizedWtTitle =
                    (dict.workouts as Record<string, string>)[slot.workout_title_key] || slot.workout_title_key;

                  const dictKey = locationToDictKey[slot.location] || slot.location;
                  // @ts-expect-error - dynamic indexing
                  const locationLabel = dict.contact?.clubs?.[dictKey]?.name || slot.location;

                  // Convert UTC to Kyiv time for display
                  const startDateObj = new Date(slot.start_time);
                  const endDateObj = new Date(slot.end_time);

                  const [STATUS_SCHEDULED, STATUS_CANCELLED] = Constants.public.Enums.slot_status;

                  return (
                    <tr key={slot.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        {formatKyivTime(startDateObj, 'dd MMM yyyy, HH:mm', {locale: dateFnsLocale})} -{' '}
                        {formatKyivTime(endDateObj, 'HH:mm', {locale: dateFnsLocale})}
                      </td>
                      <td className="px-4 py-3">{localizedWtTitle}</td>
                      <td className="px-4 py-3">{locationLabel}</td>
                      <td className="px-4 py-3">
                        {slot.bookings_count} / {slot.max_capacity}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            slot.status === STATUS_SCHEDULED
                              ? 'bg-blue-100 text-blue-800'
                              : slot.status === STATUS_CANCELLED
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                          {slot.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
