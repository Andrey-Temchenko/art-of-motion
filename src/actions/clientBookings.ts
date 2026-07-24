'use server';

import {revalidatePath} from 'next/cache';
import {QueryData} from '@supabase/supabase-js';

import {requireUser} from '@/lib/supabase/session';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {formatKyivTime} from '@/lib/utils/timezone';
import {getNextWeekRange} from '@/lib/utils/date';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale, defaultLocale, locales} from '@/lib/i18n/config';

export type ActionState = {
  success: boolean;
  message?: string;
};

export async function bookSlotAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const localeForm = formData.get('locale') as string;
  const locale = locales.includes(localeForm as Locale) ? (localeForm as Locale) : defaultLocale;
  const dict = await getDictionary(locale);

  let user;
  try {
    user = await requireUser();
  } catch {
    return {
      success: false,
      message: dict.dashboardArea.booking.errorUnauthorized
    };
  }

  const slot_id = formData.get('slot_id');

  if (!slot_id || typeof slot_id !== 'string') {
    return {
      success: false,
      message: dict.dashboardArea.booking.errorInvalidSlot
    };
  }

  const supabase = await createClient();

  // Attempt to create the booking
  const {error} = await supabase.from('bookings').insert({
    slot_id,
    client_id: user.id,
    status: 'confirmed'
  });

  if (error) {
    console.error('Failed to book slot:', error);

    // Check for the specific trigger error we created in the migration
    if (error.message.includes('SLOT_FULL') || error.code === 'P0001') {
      return {
        success: false,
        message: dict.dashboardArea.booking.errorSlotFull
      };
    }

    // Check for unique constraint violation (user already booked this slot)
    if (error.code === '23505') {
      return {
        success: false,
        message: dict.dashboardArea.booking.errorAlreadyBooked
      };
    }

    return {
      success: false,
      message: dict.dashboardArea.booking.errorDatabase
    };
  }

  revalidatePath('/[locale]/dashboard/schedule', 'page');

  return {
    success: true,
    message: dict.dashboardArea.booking.successBooked
  };
}

export type ProcessedScheduleSlot = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  status: string;
  workout_title_key: string;
  bookings_count: number;
  is_full: boolean;
  is_booked_by_user: boolean;
};

export type GroupedScheduleSlots = Record<string, ProcessedScheduleSlot[]>;

export async function getScheduleSlots(userId: string): Promise<GroupedScheduleSlots> {
  const adminClient = createAdminClient();
  const {startDate, endDate} = getNextWeekRange();

  const slotsQuery = adminClient
    .from('slots')
    .select('*, workout_type:workout_types(title), bookings(client_id, status)')
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', {ascending: true});

  type SlotsData = QueryData<typeof slotsQuery>;

  const {data, error} = await slotsQuery;

  if (error) {
    console.error('Error fetching slots:', error);
    throw new Error('Failed to load schedule slots');
  }

  const rawSlots: SlotsData = data || [];
  const groupedSlots: GroupedScheduleSlots = {};

  rawSlots.forEach(slot => {
    // 1. Resolve workout title
    const wt = Array.isArray(slot.workout_type) ? slot.workout_type[0] : slot.workout_type;
    const workout_title_key = wt?.title || '';

    // 2. Calculate bookings
    const confirmedBookings = (slot.bookings || []).filter(b => b.status === 'confirmed');
    const bookings_count = confirmedBookings.length;
    const is_full = bookings_count >= slot.max_capacity;
    const is_booked_by_user = confirmedBookings.some(b => b.client_id === userId);

    const processedSlot: ProcessedScheduleSlot = {
      id: slot.id,
      location: slot.location,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity,
      price: slot.price,
      status: slot.status,
      workout_title_key,
      bookings_count,
      is_full,
      is_booked_by_user
    };

    // 3. Group by date in Kyiv timezone
    const dateKey = formatKyivTime(slot.start_time, 'yyyy-MM-dd');
    if (!groupedSlots[dateKey]) {
      groupedSlots[dateKey] = [];
    }
    groupedSlots[dateKey].push(processedSlot);
  });

  return groupedSlots;
}
