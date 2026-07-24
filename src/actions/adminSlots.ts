'use server';

import {revalidatePath} from 'next/cache';
import {QueryData} from '@supabase/supabase-js';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';
import {createClient} from '@/lib/supabase/server';
import {createSlotSchema} from '@/lib/validators/slots';
import {fromKyivTime} from '@/lib/utils/timezone';
import {Database} from '@/types/database.types';

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createSlotAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Verify role server-side
  try {
    await requireRole([USER_ROLES.ADMIN]);
  } catch {
    return {
      success: false,
      message: 'Unauthorized access'
    };
  }

  // 2. Parse and validate input
  const input = {
    workout_type_id: formData.get('workout_type_id'),
    location: formData.get('location'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    max_capacity: parseInt(formData.get('max_capacity') as string, 10),
    price: parseFloat(formData.get('price') as string)
  };

  const validationResult = createSlotSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validationResult.error.flatten().fieldErrors
    };
  }

  const validData = validationResult.data;

  // 3. Timezone conversion:
  // We assume the user inputs Kyiv time. We convert it to UTC for the DB.
  // The validation schema already expects an ISO string, but the browser form might submit a local string
  // (e.g. "2026-07-29T18:00"). We use our timezone util to get the correct UTC Date.
  const utcStartTime = fromKyivTime(validData.start_time);
  const utcEndTime = fromKyivTime(validData.end_time);

  // 4. Insert into DB
  const supabase = await createClient();
  const {error} = await supabase.from('slots').insert({
    workout_type_id: validData.workout_type_id,
    location: validData.location as Database['public']['Enums']['club_location'],
    start_time: utcStartTime.toISOString(),
    end_time: utcEndTime.toISOString(),
    max_capacity: validData.max_capacity,
    price: validData.price,
    status: 'scheduled'
  });

  if (error) {
    console.error('Failed to create slot:', error);
    return {
      success: false,
      message: 'Database error occurred while creating slot.'
    };
  }

  // 5. Revalidate admin slots and client schedule
  revalidatePath('/[locale]/admin/slots', 'page');
  revalidatePath('/[locale]/dashboard/schedule', 'page');

  return {
    success: true,
    message: 'Slot created successfully!'
  };
}

export async function getWorkoutTypes() {
  const supabase = await createClient();
  const {data, error} = await supabase.from('workout_types').select('*').order('title');
  if (error) throw new Error('Failed to load workout types');
  return data;
}

export type ProcessedAdminSlot = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  status: string;
  workout_title_key: string;
  bookings_count: number;
};

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
    // workout_type is a single object because it's a many-to-one relation,
    // but the generated types sometimes infer it as an array if not careful.
    // QueryData correctly handles it. We just need to extract the title.
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
