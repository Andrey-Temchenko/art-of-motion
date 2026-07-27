import {
  GroupedScheduleSlots,
  ProcessedClientBooking,
  CancelBookingResult,
  DomainError,
  ProcessedScheduleSlot
} from './types';
import {getRepositories} from '@/repositories';
import {formatKyivTime} from '@/lib/utils/timezone';
import {getNextWeekRange} from '@/lib/utils/date';

export async function bookSlot(slot_id: string, client_id: string, repos = getRepositories()): Promise<void> {
  try {
    await repos.booking.insertBooking(slot_id, client_id);
  } catch (error: unknown) {
    const err = error as {code?: string; message?: string};
    if (err.message?.includes('SLOT_FULL') || err.code === 'P0001') {
      throw new DomainError('SLOT_FULL', 'errorSlotFull');
    }
    if (err.code === '23505') {
      throw new DomainError('ALREADY_BOOKED', 'errorAlreadyBooked');
    }
    throw new DomainError('DB_ERROR', 'errorDatabase');
  }
}

export async function getScheduleSlots(userId: string, repos = getRepositories()): Promise<GroupedScheduleSlots> {
  const {startDate, endDate} = getNextWeekRange();

  const rawSlots = await repos.slot.getScheduleSlotsList(startDate.toISOString(), endDate.toISOString());

  const groupedSlots: GroupedScheduleSlots = {};

  rawSlots.forEach(slot => {
    const wt = Array.isArray(slot.workout_type) ? slot.workout_type[0] : slot.workout_type;
    const workout_title_key = wt?.title || '';

    const confirmedBookings = (slot.bookings || []).filter(b => b.status === 'confirmed');
    const bookings_count = confirmedBookings.length;
    const is_full = bookings_count >= slot.max_capacity;
    const is_booked_by_user = confirmedBookings.some(b => b.client_id === userId);

    const processedSlot: ProcessedScheduleSlot = {
      id: slot.id,
      location: slot.location,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_capacity: slot.max_capacity,
      price: slot.price,
      status: slot.status,
      workout_title_key,
      bookings_count,
      is_full,
      is_booked_by_user
    };

    const dateKey = formatKyivTime(slot.start_time, 'yyyy-MM-dd');
    if (!groupedSlots[dateKey]) {
      groupedSlots[dateKey] = [];
    }
    groupedSlots[dateKey].push(processedSlot);
  });

  return groupedSlots;
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  repos = getRepositories()
): Promise<CancelBookingResult> {
  try {
    await repos.booking.updateBookingStatus(bookingId, userId, 'cancelled');
    return {success: true};
  } catch (error: unknown) {
    const err = error as {code?: string; message?: string};
    if (err.code === 'P0002' || err.message?.includes('CANCELLATION_NOT_ALLOWED')) {
      return {success: false, code: 'CANCELLATION_NOT_ALLOWED'};
    }
    return {success: false, code: 'UNKNOWN'};
  }
}

export async function getClientBookings(userId: string, repos = getRepositories()): Promise<ProcessedClientBooking[]> {
  const rawBookings = await repos.booking.getClientBookingsList(userId);

  const processedBookings: ProcessedClientBooking[] = rawBookings
    .map(b => {
      const slot = Array.isArray(b.slots) ? b.slots[0] : b.slots;
      const wt = slot?.workout_types as {title: string} | {title: string}[] | null | undefined;
      const workoutTitle = Array.isArray(wt) ? wt[0]?.title : wt?.title;

      return {
        id: b.id,
        status: b.status as 'confirmed' | 'cancelled',
        slot: {
          id: slot?.id || '',
          start_time: slot?.start_time || '',
          end_time: slot?.end_time || '',
          location: (slot?.location || '') as ProcessedClientBooking['slot']['location'],
          price: slot?.price || 0,
          cancellation_deadline_hours: slot?.cancellation_deadline_hours || 24,
          workout_title_key: workoutTitle || ''
        }
      };
    })
    .sort((a, b) => new Date(a.slot.start_time).getTime() - new Date(b.slot.start_time).getTime());

  return processedBookings;
}
