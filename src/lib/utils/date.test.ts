import {describe, it, expect} from 'vitest';
import {differenceInDays} from 'date-fns';
import {getNextWeekRange, SCHEDULE_DAYS_RANGE} from './date';

describe('getNextWeekRange', () => {
  it('should return a range of exactly SCHEDULE_DAYS_RANGE days from the given date', () => {
    const fixedNow = new Date('2026-07-24T12:00:00.000Z');
    const {startDate, endDate} = getNextWeekRange(fixedNow);

    expect(startDate.toISOString()).toBe('2026-07-24T12:00:00.000Z');
    expect(endDate.toISOString()).toBe('2026-07-31T12:00:00.000Z');

    // Ensure it's exactly SCHEDULE_DAYS_RANGE days difference
    expect(differenceInDays(endDate, startDate)).toBe(SCHEDULE_DAYS_RANGE);
  });
});
