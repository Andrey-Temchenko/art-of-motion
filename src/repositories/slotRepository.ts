import {QueryData} from '@supabase/supabase-js';

import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {ProcessedAdminSlot} from '@/services/types';
import {CreateSlotData, RawSlotData} from './types';

export async function findOverlappingSlots(startTime: string, endTime: string): Promise<{id: string}[]> {
  const supabase = await createClient();
  const STATUS_CANCELLED_STR = 'cancelled';

  const {data: overlappingSlots, error: overlapError} = await supabase
    .from('slots')
    .select('id')
    .neq('status', STATUS_CANCELLED_STR)
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (overlapError) {
    throw overlapError;
  }

  return overlappingSlots || [];
}

export async function insertSlot(slotData: CreateSlotData): Promise<void> {
  const supabase = await createClient();

  const {error} = await supabase.from('slots').insert(slotData);

  if (error) {
    throw error;
  }
}

export async function getAdminSlotsList(): Promise<ProcessedAdminSlot[]> {
  const supabase = await createClient();
  const nowUtc = new Date().toISOString();

  const slotsQuery = supabase
    .from('slots')
    .select(
      `
      id,
      location,
      start_time,
      end_time,
      max_capacity,
      price,
      status,
      workout_type:workout_types(title),
      bookings(id)
    `
    )
    .gte('start_time', nowUtc)
    .order('start_time', {ascending: true});

  type SlotsData = QueryData<typeof slotsQuery>;
  const {data, error} = await slotsQuery;

  if (error) throw error;

  const rawSlots: SlotsData = data || [];

  return rawSlots.map(slot => {
    const wt = Array.isArray(slot.workout_type) ? slot.workout_type[0] : slot.workout_type;

    return {
      id: slot.id,
      location: slot.location,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity,
      price: slot.price,
      status: slot.status,
      workout_title_key: wt?.title || '',
      bookings_count: slot.bookings ? slot.bookings.length : 0
    };
  });
}

export async function getScheduleSlotsList(startDate: string, endDate: string): Promise<RawSlotData[]> {
  const adminClient = createAdminClient();

  const slotsQuery = adminClient
    .from('slots')
    .select('*, workout_type:workout_types(title), bookings(client_id, status)')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', {ascending: true});

  const {data, error} = await slotsQuery;

  if (error) {
    throw error;
  }

  return (data || []) as unknown as RawSlotData[];
}
