import {differenceInDays} from 'date-fns';
import {describe, it, expect} from 'vitest';

import {canCancelBooking, getNextWeekRange, SCHEDULE_DAYS_RANGE, formatDate} from './date';

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

describe('canCancelBooking', () => {
  it('allows cancellation if time is well before the deadline', () => {
    const startTime = '2026-07-27T12:00:00Z'; // In 48 hours
    const now = new Date('2026-07-25T12:00:00Z');
    const deadlineHours = 24;

    // 48 hours remaining > 24 hours deadline
    expect(canCancelBooking(startTime, deadlineHours, now)).toBe(true);
  });

  it('does not allow cancellation if time is after the deadline', () => {
    const startTime = '2026-07-26T10:00:00Z'; // In 22 hours
    const now = new Date('2026-07-25T12:00:00Z');
    const deadlineHours = 24;

    // 22 hours remaining < 24 hours deadline
    expect(canCancelBooking(startTime, deadlineHours, now)).toBe(false);
  });

  it('does not allow cancellation exactly on the deadline boundary', () => {
    const startTime = '2026-07-26T12:00:00Z'; // Exactly 24 hours
    const now = new Date('2026-07-25T12:00:00Z');
    const deadlineHours = 24;

    // 24 hours remaining == 24 hours deadline (must be strictly before deadline according to < logic and RLS)
    expect(canCancelBooking(startTime, deadlineHours, now)).toBe(false);
  });

  it('handles 0 hours deadline correctly (cancellation allowed up to start time)', () => {
    const startTime = '2026-07-25T13:00:00Z'; // In 1 hour
    const now = new Date('2026-07-25T12:00:00Z');
    const deadlineHours = 0;

    expect(canCancelBooking(startTime, deadlineHours, now)).toBe(true);
  });
});

describe('formatDate', () => {
  it('formats date with default locale (en-US fallback or current)', () => {
    const date = new Date('2026-08-01T12:00:00Z');
    const formatted = formatDate(date, 'yyyy-MM-dd');
    expect(formatted).toBe('2026-08-01');
  });

  it('formats date correctly with given locale string', () => {
    const date = new Date('2026-08-01T12:00:00Z');
    // For 'uk' locale, month should be localized
    const formatted = formatDate(date, 'MMM', 'uk');
    expect(formatted).toBe('серп.'); // серпня/серп. in uk
  });

  it('supports formatting from string input', () => {
    const formatted = formatDate('2026-08-01T12:00:00Z', 'yyyy-MM-dd');
    expect(formatted).toBe('2026-08-01');
  });
});
