import {addDays} from 'date-fns';

export const SCHEDULE_DAYS_RANGE = 7;

export function getNextWeekRange(now: Date = new Date()): {startDate: Date; endDate: Date} {
  const startDate = new Date(now);
  const endDate = addDays(startDate, SCHEDULE_DAYS_RANGE);
  return {startDate, endDate};
}
