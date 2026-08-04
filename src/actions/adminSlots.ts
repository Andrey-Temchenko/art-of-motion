'use server';

import {revalidatePath} from 'next/cache';
import {isRedirectError} from 'next/dist/client/components/redirect-error';

import {flattenError} from 'zod';

import {ROUTES, buildRevalidatePath} from '@/config/navigation';

import {USER_ROLE} from '@/constants/roles';

import {requireRole} from '@/lib/supabase/session';
import {uuidSchema} from '@/lib/validators/common';
import {slotSchema} from '@/lib/validators/slots';

import {cancelClientBookingAsAdmin} from '@/services/adminService';
import {createSlot, updateAdminSlot, cancelAdminSlot} from '@/services/slotService';
import {DomainError} from '@/services/types';

import type {ActionState} from './types';

export async function createSlotAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {success: false, message: 'Unauthorized access'};
  }

  const input = parseSlotFormData(formData);
  const validationResult = slotSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: flattenError(validationResult.error).fieldErrors
    };
  }

  try {
    await createSlot(validationResult.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return {success: false, message: error.message};
    }
    return {success: false, message: 'An unexpected error occurred.'};
  }

  revalidateSlotPaths();

  return {success: true, message: 'Slot created successfully!'};
}

export async function editSlotAction(slotId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {success: false, message: 'Unauthorized access'};
  }

  if (!uuidSchema.safeParse(slotId).success) {
    return {success: false, message: 'Invalid slot ID'};
  }

  const input = parseSlotFormData(formData);
  const validationResult = slotSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: flattenError(validationResult.error).fieldErrors
    };
  }

  try {
    await updateAdminSlot(slotId, validationResult.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return {success: false, message: error.message};
    }
    return {success: false, message: 'An unexpected error occurred.'};
  }

  revalidateSlotPaths();

  return {success: true, message: 'Slot updated successfully!'};
}

export async function cancelSlotAction(slotId: string): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {success: false, message: 'Unauthorized access'};
  }

  if (!uuidSchema.safeParse(slotId).success) {
    return {success: false, message: 'Invalid slot ID'};
  }

  try {
    await cancelAdminSlot(slotId);
  } catch (error) {
    return {success: false, message: getErrorMessage(error)};
  }

  revalidateSlotPaths();

  return {success: true, message: 'Slot cancelled successfully!'};
}

export async function cancelBookingAction(bookingId: string): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {success: false, message: 'Unauthorized access'};
  }

  if (!bookingId) {
    return {success: false, message: 'Booking ID is required'};
  }

  try {
    await cancelClientBookingAsAdmin(bookingId);
  } catch (error) {
    return {success: false, message: getErrorMessage(error)};
  }

  revalidatePath(`${buildRevalidatePath(ROUTES.ADMIN.SLOTS)}/[id]`, 'page');

  return {success: true, message: 'Booking cancelled successfully!'};
}

// helper methods

function parseSlotFormData(formData: FormData) {
  const slotTemplateId = formData.get('slot_template_id') as string | null;
  const cancellationDeadlineRaw = formData.get('cancellation_deadline_hours') as string | null;

  return {
    workout_type_id: formData.get('workout_type_id'),
    location: formData.get('location'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    max_capacity: parseInt(formData.get('max_capacity') as string, 10),
    price: parseFloat(formData.get('price') as string),
    ...(cancellationDeadlineRaw ? {cancellation_deadline_hours: parseInt(cancellationDeadlineRaw, 10)} : {}),
    ...(slotTemplateId ? {slot_template_id: slotTemplateId} : {})
  };
}

function revalidateSlotPaths() {
  revalidatePath(buildRevalidatePath(ROUTES.ADMIN.SLOTS), 'page');
  revalidatePath(buildRevalidatePath(ROUTES.DASHBOARD.SCHEDULE), 'page');
  revalidatePath(buildRevalidatePath(ROUTES.DASHBOARD.MY_BOOKINGS), 'page');
  revalidatePath(`${buildRevalidatePath(ROUTES.ADMIN.SLOTS)}/[id]`, 'page');
  revalidatePath(buildRevalidatePath(ROUTES.ADMIN.TEMPLATES), 'page');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
