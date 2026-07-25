import {addDays} from 'date-fns';

export const SCHEDULE_DAYS_RANGE = 7;

export function getNextWeekRange(now: Date = new Date()): {startDate: Date; endDate: Date} {
  const startDate = new Date(now);
  const endDate = addDays(startDate, SCHEDULE_DAYS_RANGE);
  return {startDate, endDate};
}

/**
 * Checks if a booking can still be cancelled based on the slot's start time and the cancellation deadline.
 * The cancellation must happen strictly before the deadline (start_time - deadline_hours).
 */
export function canCancelBooking(
  startTimeIso: string,
  cancellationDeadlineHours: number,
  now: Date = new Date()
): boolean {
  const start = new Date(startTimeIso).getTime();
  const deadline = start - cancellationDeadlineHours * 60 * 60 * 1000;
  return now.getTime() < deadline;
}
