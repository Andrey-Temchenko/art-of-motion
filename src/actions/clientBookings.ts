'use server';

import {revalidatePath} from 'next/cache';

import type {User} from '@supabase/supabase-js';

import {ROUTES, buildRevalidatePath} from '@/config/navigation';

import type {Locale} from '@/lib/i18n/config';
import {defaultLocale, locales} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {requireUser} from '@/lib/supabase/session';

import {bookSlot, cancelBooking as cancelBookingService} from '@/services/bookingService';
import type {CancelBookingResult} from '@/services/types';
import {DomainError} from '@/services/types';

import type {ActionState} from './types';

export async function bookSlotAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const localeForm = formData.get('locale') as string;
  const locale = locales.includes(localeForm as Locale) ? (localeForm as Locale) : defaultLocale;
  const dict = await getDictionary(locale);

  let user: User;
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

  revalidatePath(buildRevalidatePath(ROUTES.DASHBOARD.SCHEDULE), 'page');

  return {
    success: true,
    message: dict.dashboardArea.booking.successBooked
  };
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
    revalidatePath(buildRevalidatePath(ROUTES.DASHBOARD.MY_BOOKINGS), 'page');
    revalidatePath(buildRevalidatePath(ROUTES.DASHBOARD.SCHEDULE), 'page');
  }

  return result;
}
