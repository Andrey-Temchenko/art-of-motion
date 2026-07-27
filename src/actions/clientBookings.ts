'use server';

import {revalidatePath} from 'next/cache';

import {requireUser} from '@/lib/supabase/session';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {Locale, defaultLocale, locales} from '@/lib/i18n/config';
import {
  bookSlot,
  getScheduleSlots as getScheduleSlotsService,
  cancelBooking as cancelBookingService,
  getClientBookings as getClientBookingsService
} from '@/services/bookingService';
import {DomainError} from '@/services/types';
import type {GroupedScheduleSlots, CancelBookingResult, ProcessedClientBooking} from '@/services/types';

export type ActionState = {
  success: boolean;
  message?: string;
};

export async function bookSlotAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const localeForm = formData.get('locale') as string;
  const locale = locales.includes(localeForm as Locale) ? (localeForm as Locale) : defaultLocale;
  const dict = await getDictionary(locale);

  let user;
  try {
    user = await requireUser();
  } catch {
    return {
      success: false,
      message: dict.dashboardArea.booking.errorUnauthorized
    };
  }

  const slot_id = formData.get('slot_id');

  if (!slot_id || typeof slot_id !== 'string') {
    return {
      success: false,
      message: dict.dashboardArea.booking.errorInvalidSlot
    };
  }

  // Attempt to create the booking via service layer
  try {
    await bookSlot(slot_id, user.id);
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'SLOT_FULL') return {success: false, message: dict.dashboardArea.booking.errorSlotFull};
      if (error.code === 'ALREADY_BOOKED')
        return {success: false, message: dict.dashboardArea.booking.errorAlreadyBooked};
      if (error.code === 'DB_ERROR') return {success: false, message: dict.dashboardArea.booking.errorDatabase};
    }
    return {
      success: false,
      message: dict.dashboardArea.booking.errorDatabase
    };
  }

  revalidatePath('/[locale]/dashboard/schedule', 'page');

  return {
    success: true,
    message: dict.dashboardArea.booking.successBooked
  };
}

export async function getScheduleSlots(userId: string): Promise<GroupedScheduleSlots> {
  return getScheduleSlotsService(userId);
}

export async function cancelBookingAction(bookingId: string): Promise<CancelBookingResult> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return {success: false, code: 'UNAUTHORIZED'};
  }

  const result = await cancelBookingService(bookingId, user.id);

  if (result.success) {
    revalidatePath('/[locale]/dashboard/my-bookings', 'page');
    revalidatePath('/[locale]/dashboard/schedule', 'page');
  }

  return result;
}

export async function getClientBookings(userId: string): Promise<ProcessedClientBooking[]> {
  return getClientBookingsService(userId);
}
