import type {SupabaseClient} from '@supabase/supabase-js';

import type {BookingStatusType} from '@/constants/bookingStatus';
import {BOOKING_STATUS} from '@/constants/bookingStatus';

import type {Database} from '@/types/database.types';

import {createAdminClient} from '@/lib/supabase/admin';
import {createClient} from '@/lib/supabase/server';

import type {RawBookingData, RawBookingNotificationData} from './types';

export async function insertBooking(slot_id: string, client_id: string): Promise<RawBookingNotificationData> {
  const supabase = await createClient();

  const {data: insertData, error: insertError} = await supabase
    .from('bookings')
    .upsert(
      {
        slot_id,
        client_id,
        status: BOOKING_STATUS.CONFIRMED,
        created_at: new Date().toISOString()
      },
      {onConflict: 'slot_id,client_id'}
    )
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  const {data, error} = await supabase
    .from('bookings')
    .select('id, profiles(full_name, phone), slots(start_time, location, workout_type:workout_types(title))')
    .eq('id', insertData.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBookingStatus(
  bookingId: string,
  userId: string,
  status: BookingStatusType
): Promise<RawBookingNotificationData> {
  const supabase = await createClient();

  const {error: updateError} = await supabase
    .from('bookings')
    .update({status})
    .eq('id', bookingId)
    .eq('client_id', userId);

  if (updateError) {
    throw updateError;
  }

  const {data, error} = await supabase
    .from('bookings')
    .select('id, profiles(full_name, phone), slots(start_time, location, workout_type:workout_types(title))')
    .eq('id', bookingId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const clientBookingsListQuery = (client: SupabaseClient<Database>, userId: string) =>
  client
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

export async function getClientBookingsList(userId: string): Promise<RawBookingData[]> {
  const supabase = await createClient();
  const bookingsQuery = clientBookingsListQuery(supabase, userId);

  const {data, error} = await bookingsQuery;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function cancelBookingAsAdmin(bookingId: string): Promise<void> {
  const adminClient = createAdminClient();
  const {error} = await adminClient.from('bookings').update({status: BOOKING_STATUS.CANCELLED}).eq('id', bookingId);

  if (error) {
    throw error;
  }
}
