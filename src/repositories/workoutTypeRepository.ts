import {createClient} from '@/lib/supabase/server';
import {Database} from '@/types/database.types';

export type WorkoutType = Database['public']['Tables']['workout_types']['Row'];

export async function getAllWorkoutTypes(): Promise<WorkoutType[]> {
  const supabase = await createClient();
  const {data, error} = await supabase.from('workout_types').select('*').order('title');

  if (error) {
    throw new Error(`Failed to load workout types: ${error.message}`);
  }

  return data;
}
