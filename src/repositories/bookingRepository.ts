import {createClient} from '@/lib/supabase/server';
import {RawBookingData} from './types';

export async function insertBooking(slot_id: string, client_id: string): Promise<void> {
  const supabase = await createClient();

  const {error} = await supabase.from('bookings').insert({
    slot_id,
    client_id,
    status: 'confirmed'
  });

  if (error) {
    throw error;
  }
}

export async function updateBookingStatus(
  bookingId: string,
  userId: string,
  status: 'confirmed' | 'cancelled'
): Promise<void> {
  const supabase = await createClient();
  const {error} = await supabase.from('bookings').update({status}).eq('id', bookingId).eq('client_id', userId);

  if (error) {
    throw error;
  }
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
