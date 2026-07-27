'use server';

import {revalidatePath} from 'next/cache';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLES} from '@/lib/supabase/constants';
import {createSlotSchema} from '@/lib/validators/slots';
import {createSlot, getAdminSlots as getAdminSlotsService} from '@/services/slotService';
import {DomainError} from '@/services/types';
import type {ProcessedAdminSlot} from '@/services/types';
import {WorkoutType} from '@/repositories/types';
import {getRepositories} from '@/repositories';

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

  // 3. Delegate to service layer
  try {
    await createSlot(validData);
  } catch (error) {
    if (error instanceof DomainError) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred.'
    };
  }

  // 4. Revalidate cache
  revalidatePath('/[locale]/admin/slots', 'page');
  revalidatePath('/[locale]/dashboard/schedule', 'page');

  return {
    success: true,
    message: 'Slot created successfully!'
  };
}

export async function getWorkoutTypes(): Promise<WorkoutType[]> {
  const repos = getRepositories();
  return repos.workoutType.getAllWorkoutTypes();
}

export async function getAdminSlots(): Promise<ProcessedAdminSlot[]> {
  return getAdminSlotsService();
}
