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
import type {Database} from '@/types/database.types';

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

export type CancelBookingResult =
  {success: true} | {success: false; code: 'UNAUTHORIZED' | 'CANCELLATION_NOT_ALLOWED' | 'UNKNOWN'};

export async function cancelBookingAction(bookingId: string): Promise<CancelBookingResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return {success: false, code: 'UNAUTHORIZED'};
  }

  const supabase = await createClient();
  const {error} = await supabase
    .from('bookings')
    .update({status: 'cancelled'})
    .eq('id', bookingId)
    .eq('client_id', user.id);

  if (error) {
    console.error('Failed to cancel booking:', error);
    if (error.code === 'P0002' || error.message.includes('CANCELLATION_NOT_ALLOWED')) {
      return {success: false, code: 'CANCELLATION_NOT_ALLOWED'};
    }
    return {success: false, code: 'UNKNOWN'};
  }

  revalidatePath('/[locale]/dashboard/my-bookings', 'page');
  revalidatePath('/[locale]/dashboard/schedule', 'page');

  return {success: true};
}

export type ProcessedClientBooking = {
  id: string;
  status: Database['public']['Enums']['booking_status'];
  slot: {
    id: string;
    start_time: string;
    end_time: string;
    location: Database['public']['Enums']['club_location'];
    price: number;
    cancellation_deadline_hours: number;
    workout_title_key: string;
  };
};

export async function getClientBookings(userId: string): Promise<ProcessedClientBooking[]> {
  const supabase = await createClient();

  const bookingsQuery = supabase
    .from('bookings')
    .select(
      `
      id,
      status,
      slots (
        id,
        start_time,
        end_time,
        location,
        price,
        cancellation_deadline_hours,
        workout_types (title)
      )
    `
    )
    .eq('client_id', userId);

  const {data, error} = await bookingsQuery;

  if (error) {
    console.error('Error fetching client bookings:', error);
    throw new Error('Failed to load bookings');
  }

  type BookingsResult = import('@supabase/supabase-js').QueryData<typeof bookingsQuery>;
  const rawBookings: BookingsResult = data || [];

  const processedBookings: ProcessedClientBooking[] = rawBookings
    .map(b => {
      const slot = Array.isArray(b.slots) ? b.slots[0] : b.slots;
      const wt = slot?.workout_types as {title: string} | {title: string}[] | null | undefined;
      const workoutTitle = Array.isArray(wt) ? wt[0]?.title : wt?.title;

      return {
        id: b.id,
        status: b.status,
        slot: {
          id: slot?.id || '',
          start_time: slot?.start_time || '',
          end_time: slot?.end_time || '',
          location: slot?.location || '',
          price: slot?.price || 0,
          cancellation_deadline_hours: slot?.cancellation_deadline_hours || 24,
          workout_title_key: workoutTitle || ''
        }
      };
    })
    // Sort by start_time ascending
    .sort((a, b) => new Date(a.slot.start_time).getTime() - new Date(b.slot.start_time).getTime());

  return processedBookings;
}
