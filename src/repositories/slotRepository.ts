import type {SupabaseClient} from '@supabase/supabase-js';

import type {SlotStatusType} from '@/constants/slotStatus';
import {SLOT_STATUS} from '@/constants/slotStatus';

import type {Database} from '@/types/database.types';

import {createAdminClient} from '@/lib/supabase/admin';
import {createClient} from '@/lib/supabase/server';

import type {CreateSlotData, RawSlotData, RawScheduleSlotData, RawAdminSlotDetails, UpdateSlotData} from './types';

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

  const insertPayload: Database['public']['Tables']['slots']['Insert'] = {
    workout_type_id: slotData.workout_type_id,
    location: slotData.location,
    start_time: slotData.start_time,
    end_time: slotData.end_time,
    max_capacity: slotData.max_capacity,
    price: slotData.price,
    status: slotData.status
  };

  if (slotData.cancellation_deadline_hours !== undefined) {
    insertPayload.cancellation_deadline_hours = slotData.cancellation_deadline_hours;
  }
  if (slotData.slot_template_id) {
    insertPayload.slot_template_id = slotData.slot_template_id;
  }

  const {error} = await supabase.from('slots').insert(insertPayload);

  if (error) {
    // Rethrow with the original error code so the service layer can detect exclusion_violation (23P01)
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

export const adminSlotsListQuery = (client: SupabaseClient<Database>) => {
  const nowUtc = new Date().toISOString();
  return client
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
};

export async function getAdminSlotsList(): Promise<RawSlotData[]> {
  const supabase = await createClient();
  const slotsQuery = adminSlotsListQuery(supabase);

  const {data, error} = await slotsQuery;

  if (error) throw error;

  return data || [];
}

export const scheduleSlotsListQuery = (client: SupabaseClient<Database>, startDate: string, endDate: string) =>
  client
    .from('slots')
    .select('*, workout_type:workout_types(title), bookings(client_id, status)')
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .order('start_time', {ascending: true});

export async function getScheduleSlotsList(startDate: string, endDate: string): Promise<RawScheduleSlotData[]> {
  const adminClient = createAdminClient();
  const slotsQuery = scheduleSlotsListQuery(adminClient, startDate, endDate);

  const {data, error} = await slotsQuery;

  if (error) {
    throw error;
  }

  return data || [];
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
