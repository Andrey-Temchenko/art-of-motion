import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {CreateSlotData, RawSlotData, RawAdminSlotDetails, UpdateSlotData} from './types';
import {SLOT_STATUS, SlotStatusType} from '@/constants/slotStatus';

export async function findOverlappingSlots(
  startTime: string,
  endTime: string,
  excludeSlotId?: string
): Promise<{id: string}[]> {
  const supabase = await createClient();
  const STATUS_CANCELLED_STR = SLOT_STATUS.CANCELLED;

  let query = supabase
    .from('slots')
    .select('id')
    .neq('status', STATUS_CANCELLED_STR)
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (excludeSlotId) {
    query = query.neq('id', excludeSlotId);
  }

  const {data: overlappingSlots, error: overlapError} = await query;

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

export async function updateSlotStatus(slotId: string, status: SlotStatusType): Promise<void> {
  const adminClient = createAdminClient();

  const {error} = await adminClient.from('slots').update({status}).eq('id', slotId);

  if (error) {
    throw error;
  }
}

export async function updateSlot(slotId: string, slotData: UpdateSlotData): Promise<void> {
  const adminClient = createAdminClient();

  const {error} = await adminClient.from('slots').update(slotData).eq('id', slotId);

  if (error) {
    throw error;
  }
}

export async function getAdminSlotsList(): Promise<RawSlotData[]> {
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
      bookings(id, status)
    `
    )
    .gte('start_time', nowUtc)
    .order('start_time', {ascending: true});

  const {data, error} = await slotsQuery;

  if (error) throw error;

  return (data || []) as unknown as RawSlotData[];
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

export async function getAdminSlotDetails(slotId: string): Promise<RawAdminSlotDetails | null> {
  const adminClient = createAdminClient();

  const {data, error} = await adminClient
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
      workout_type_id,
      workout_type:workout_types(title),
      bookings(
        id,
        status,
        created_at,
        profiles(
          id,
          full_name,
          email
        )
      )
    `
    )
    .eq('id', slotId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}
