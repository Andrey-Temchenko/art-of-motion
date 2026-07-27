import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {RawBookingData, RawBookingNotificationData} from './types';

export async function insertBooking(slot_id: string, client_id: string): Promise<RawBookingNotificationData> {
  const supabase = await createClient();

  const {data: insertData, error: insertError} = await supabase
    .from('bookings')
    .insert({
      slot_id,
      client_id,
      status: 'confirmed'
    })
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
  status: 'confirmed' | 'cancelled'
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

export async function getClientBookingsList(userId: string): Promise<RawBookingData[]> {
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
    throw error;
  }

  // Cast because QueryData doesn't perfectly align with the manual interface
  return (data || []) as unknown as RawBookingData[];
}

export async function cancelBookingAsAdmin(bookingId: string): Promise<void> {
  const adminClient = createAdminClient();
  const {error} = await adminClient.from('bookings').update({status: 'cancelled'}).eq('id', bookingId);

  if (error) {
    throw error;
  }
}
