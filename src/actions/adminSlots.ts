'use server';

import {revalidatePath} from 'next/cache';
import {z} from 'zod';

import {requireRole} from '@/lib/supabase/session';
import {USER_ROLE} from '@/constants/roles';
import {slotSchema} from '@/lib/validators/slots';
import {createSlot, updateAdminSlot, cancelAdminSlot} from '@/services/slotService';
import {cancelClientBookingAsAdmin} from '@/services/adminService';
import {DomainError} from '@/services/types';

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ── Shared helpers ──────────────────────────────────────────────────────

function parseSlotFormData(formData: FormData) {
  return {
    workout_type_id: formData.get('workout_type_id'),
    location: formData.get('location'),
    start_time: formData.get('start_time'),
    end_time: formData.get('end_time'),
    max_capacity: parseInt(formData.get('max_capacity') as string, 10),
    price: parseFloat(formData.get('price') as string)
  };
}

function revalidateSlotPaths() {
  revalidatePath('/[locale]/admin/slots', 'page');
  revalidatePath('/[locale]/dashboard/schedule', 'page');
  revalidatePath('/[locale]/dashboard/my-bookings', 'page');
  revalidatePath('/[locale]/admin/slots/[id]', 'page');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

// Relaxed regex because test DB uses non-RFC compliant UUIDs like 'aaaa0000-...'
const uuidSchema = z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

// ── Actions ─────────────────────────────────────────────────────────────

export async function createSlotAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch {
    return {success: false, message: 'Unauthorized access'};
  }

  const input = parseSlotFormData(formData);
  const validationResult = slotSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: validationResult.error.flatten().fieldErrors
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
  } catch {
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
      errors: validationResult.error.flatten().fieldErrors
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
  } catch {
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
  } catch {
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

  revalidatePath('/[locale]/admin/slots/[id]', 'page');

  return {success: true, message: 'Booking cancelled successfully!'};
}
