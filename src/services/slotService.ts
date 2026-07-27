import {QueryData} from '@supabase/supabase-js';

import {createClient} from '@/lib/supabase/server';
import {fromKyivTime} from '@/lib/utils/timezone';
import {Database, Constants} from '@/types/database.types';
import {ProcessedAdminSlot, DomainError} from './types';

type CreateSlotInput = {
  workout_type_id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
};

export async function createSlot(validData: CreateSlotInput): Promise<void> {
  const utcStartTime = fromKyivTime(validData.start_time);
  const utcEndTime = fromKyivTime(validData.end_time);

  const supabase = await createClient();
  const [STATUS_SCHEDULED, STATUS_CANCELLED] = Constants.public.Enums.slot_status;

  const {data: overlappingSlots, error: overlapError} = await supabase
    .from('slots')
    .select('id')
    .neq('status', STATUS_CANCELLED)
    .lt('start_time', utcEndTime.toISOString())
    .gt('end_time', utcStartTime.toISOString());

  if (overlapError) {
    throw new DomainError('DB_ERROR', 'Error checking time availability.');
  }

  if (overlappingSlots && overlappingSlots.length > 0) {
    throw new DomainError('OVERLAP', 'Trainer is already booked at this time!');
  }

  const {error} = await supabase.from('slots').insert({
    workout_type_id: validData.workout_type_id,
    location: validData.location as Database['public']['Enums']['club_location'],
    start_time: utcStartTime.toISOString(),
    end_time: utcEndTime.toISOString(),
    max_capacity: validData.max_capacity,
    price: validData.price,
    status: STATUS_SCHEDULED
  });

  if (error) {
    throw new DomainError('DB_ERROR', 'Database error occurred while creating slot.');
  }
}

export async function getAdminSlots(): Promise<ProcessedAdminSlot[]> {
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

  if (error) throw new Error('Failed to load slots');

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
