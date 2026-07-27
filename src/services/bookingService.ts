import {QueryData} from '@supabase/supabase-js';

import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {formatKyivTime} from '@/lib/utils/timezone';
import {getNextWeekRange} from '@/lib/utils/date';
import {
  ProcessedScheduleSlot,
  GroupedScheduleSlots,
  ProcessedClientBooking,
  CancelBookingResult,
  DomainError
} from './types';

export async function bookSlot(slot_id: string, client_id: string): Promise<void> {
  const supabase = await createClient();

  const {error} = await supabase.from('bookings').insert({
    slot_id,
    client_id,
    status: 'confirmed'
  });

  if (error) {
    if (error.message.includes('SLOT_FULL') || error.code === 'P0001') {
      throw new DomainError('SLOT_FULL', 'errorSlotFull');
    }
    if (error.code === '23505') {
      throw new DomainError('ALREADY_BOOKED', 'errorAlreadyBooked');
    }
    throw new DomainError('DB_ERROR', 'errorDatabase');
  }
}

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
    throw new Error('Failed to load schedule slots');
  }

  const rawSlots: SlotsData = data || [];
  const groupedSlots: GroupedScheduleSlots = {};

  rawSlots.forEach(slot => {
    const wt = Array.isArray(slot.workout_type) ? slot.workout_type[0] : slot.workout_type;
    const workout_title_key = wt?.title || '';

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

    const dateKey = formatKyivTime(slot.start_time, 'yyyy-MM-dd');
    if (!groupedSlots[dateKey]) {
      groupedSlots[dateKey] = [];
    }
    groupedSlots[dateKey].push(processedSlot);
  });

  return groupedSlots;
}

export async function cancelBooking(bookingId: string, userId: string): Promise<CancelBookingResult> {
  const supabase = await createClient();
  const {error} = await supabase
    .from('bookings')
    .update({status: 'cancelled'})
    .eq('id', bookingId)
    .eq('client_id', userId);

  if (error) {
    if (error.code === 'P0002' || error.message.includes('CANCELLATION_NOT_ALLOWED')) {
      return {success: false, code: 'CANCELLATION_NOT_ALLOWED'};
    }
    return {success: false, code: 'UNKNOWN'};
  }

  return {success: true};
}

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
    throw new Error('Failed to load bookings');
  }

  type BookingsResult = QueryData<typeof bookingsQuery>;
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
    .sort((a, b) => new Date(a.slot.start_time).getTime() - new Date(b.slot.start_time).getTime());

  return processedBookings;
}
