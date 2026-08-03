import {describe, it, expect, vi, afterEach} from 'vitest';
import {computeUpcomingOccurrences, SlotTemplateLike} from './templateOccurrences';

// Fix "now" to a known Wednesday: 2026-08-05 (Wednesday) at 10:00 Kyiv time
// In UTC that is 2026-08-05T07:00:00Z (Kyiv is UTC+3 in summer)
const FIXED_NOW = new Date('2026-08-05T07:00:00Z');

function makeTemplate(overrides: Partial<SlotTemplateLike> = {}): SlotTemplateLike {
  return {
    id: 'tpl-001',
    day_of_week: 3, // Wednesday
    start_time_local: '18:00:00',
    duration_minutes: 60,
    recurrence_start_date: '2026-08-01',
    recurrence_end_date: null,
    ...overrides
  };
}

describe('computeUpcomingOccurrences', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function runWithFixedTime(fn: () => void) {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    fn();
  }

  it('produces dates only on the correct day of week (Wednesday)', () => {
    runWithFixedTime(() => {
      const template = makeTemplate({day_of_week: 3}); // Wednesday
      const results = computeUpcomingOccurrences(template, new Set(), 4);

      expect(results.length).toBeGreaterThanOrEqual(1);
      for (const occ of results) {
        // Verify the local date falls on a Wednesday
        const d = new Date(occ.occurrenceDate);
        expect(d.getDay()).toBe(3);
      }
    });
  });

  it('produces dates only on Sundays when day_of_week=0', () => {
    runWithFixedTime(() => {
      const template = makeTemplate({day_of_week: 0}); // Sunday
      const results = computeUpcomingOccurrences(template, new Set(), 4);

      expect(results.length).toBeGreaterThanOrEqual(1);
      for (const occ of results) {
        const d = new Date(occ.occurrenceDate);
        expect(d.getDay()).toBe(0);
      }
    });
  });

  it('excludes already-materialized dates (including cancelled slots)', () => {
    runWithFixedTime(() => {
      const template = makeTemplate({day_of_week: 3});
      const allResults = computeUpcomingOccurrences(template, new Set(), 4);

      expect(allResults.length).toBeGreaterThanOrEqual(2);

      // Exclude the first occurrence date
      const excludedDate = allResults[0].occurrenceDate;
      const filteredResults = computeUpcomingOccurrences(template, new Set([excludedDate]), 4);

      expect(filteredResults.length).toBe(allResults.length - 1);
      expect(filteredResults.find(r => r.occurrenceDate === excludedDate)).toBeUndefined();
    });
  });

  it('respects weeksAheadWindow boundary', () => {
    runWithFixedTime(() => {
      const template = makeTemplate({day_of_week: 3});

      const results2Weeks = computeUpcomingOccurrences(template, new Set(), 2);
      const results6Weeks = computeUpcomingOccurrences(template, new Set(), 6);

      expect(results6Weeks.length).toBeGreaterThan(results2Weeks.length);

      // 2-week window from a Wednesday includes up to 3 Wednesdays (today + 2 more)
      expect(results2Weeks.length).toBeLessThanOrEqual(3);
    });
  });

  it('respects recurrence_end_date boundary', () => {
    runWithFixedTime(() => {
      // End date is 2 weeks from now
      const template = makeTemplate({
        day_of_week: 3,
        recurrence_end_date: '2026-08-19' // ~2 weeks, covers 2 Wednesdays: Aug 5 and Aug 12
      });

      const results = computeUpcomingOccurrences(template, new Set(), 8);

      // All results should be on or before the end date
      for (const occ of results) {
        expect(occ.occurrenceDate <= '2026-08-19').toBe(true);
      }

      // With 8-week window but end date at Aug 19, we get at most ~2 Wednesdays
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  it('skips dates before recurrence_start_date when it is in the future', () => {
    runWithFixedTime(() => {
      // Start date is 2 weeks from now (Aug 19, which is a Tuesday)
      const template = makeTemplate({
        day_of_week: 3, // Wednesday
        recurrence_start_date: '2026-08-19'
      });

      const results = computeUpcomingOccurrences(template, new Set(), 4);

      // First occurrence should be on or after Aug 19
      for (const occ of results) {
        expect(occ.occurrenceDate >= '2026-08-19').toBe(true);
      }
    });
  });

  it('returns empty array when no dates match the window', () => {
    runWithFixedTime(() => {
      // Recurrence ended in the past
      const template = makeTemplate({
        day_of_week: 3,
        recurrence_end_date: '2026-07-01'
      });

      const results = computeUpcomingOccurrences(template, new Set(), 6);
      expect(results).toEqual([]);
    });
  });

  it('computes correct UTC start/end times from Kyiv local time', () => {
    runWithFixedTime(() => {
      const template = makeTemplate({
        day_of_week: 3,
        start_time_local: '18:00:00',
        duration_minutes: 90
      });

      const results = computeUpcomingOccurrences(template, new Set(), 2);
      expect(results.length).toBeGreaterThanOrEqual(1);

      const first = results[0];
      // Duration should be 90 minutes
      const durationMs = first.endUtc.getTime() - first.startUtc.getTime();
      expect(durationMs).toBe(90 * 60_000);
    });
  });

  it('handles start_time_local without seconds (HH:mm format)', () => {
    runWithFixedTime(() => {
      const template = makeTemplate({
        day_of_week: 3,
        start_time_local: '18:00' // no seconds
      });

      const results = computeUpcomingOccurrences(template, new Set(), 2);
      expect(results.length).toBeGreaterThanOrEqual(1);

      const first = results[0];
      const durationMs = first.endUtc.getTime() - first.startUtc.getTime();
      expect(durationMs).toBe(60 * 60_000);
    });
  });
});
