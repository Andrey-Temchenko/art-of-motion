import {addDays, isAfter, startOfDay} from 'date-fns';
import {fromZonedTime, toZonedTime} from 'date-fns-tz';

import {KYIV_TIMEZONE} from '@/lib/utils/timezone';
import {parseLocalDate} from '@/lib/utils/date';

export interface SlotTemplateLike {
  id: string;
  day_of_week: number; // 0 = Sunday .. 6 = Saturday
  start_time_local: string; // 'HH:mm:ss' or 'HH:mm'
  duration_minutes: number;
  recurrence_start_date: string; // 'YYYY-MM-DD'
  recurrence_end_date: string | null;
}

export interface TemplateOccurrence {
  templateId: string;
  occurrenceDate: string; // 'YYYY-MM-DD', local Kyiv date
  startUtc: Date;
  endUtc: Date;
}

/**
 * Computes upcoming occurrence dates for a single active template within the window
 * [today, +weeksAheadWindow weeks], additionally bounded by recurrence_end_date,
 * excluding dates that already have a materialized slot (alreadyMaterializedLocalDates).
 *
 * Cancelled slots are included in the "already materialized" set by the caller -
 * a cancelled template-originated slot does NOT resurface as a new occurrence.
 */
export function computeUpcomingOccurrences(
  template: SlotTemplateLike,
  alreadyMaterializedLocalDates: Set<string>,
  weeksAheadWindow: number
): TemplateOccurrence[] {
  const results: TemplateOccurrence[] = [];
  const today = startOfDay(toZonedTime(new Date(), KYIV_TIMEZONE));
  const windowEnd = addDays(today, weeksAheadWindow * 7);

  const recurrenceStart = parseLocalDate(template.recurrence_start_date);

  let cursor = isAfter(today, recurrenceStart) ? today : recurrenceStart;

  // Advance cursor to the first matching day of week
  while (cursor.getDay() !== template.day_of_week) {
    cursor = addDays(cursor, 1);
  }

  let parsedEndDate = windowEnd;
  if (template.recurrence_end_date) {
    parsedEndDate = parseLocalDate(template.recurrence_end_date);
  }

  const hardEnd = template.recurrence_end_date
    ? new Date(Math.min(windowEnd.getTime(), parsedEndDate.getTime()))
    : windowEnd;

  while (!isAfter(cursor, hardEnd)) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    const day = String(cursor.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;

    if (!alreadyMaterializedLocalDates.has(localDateStr)) {
      const [h, m, s] = template.start_time_local.split(':').map(Number);
      const localDateTime = new Date(cursor);
      localDateTime.setHours(h, m, s ?? 0, 0);

      const startUtc = fromZonedTime(localDateTime, KYIV_TIMEZONE);
      const endUtc = new Date(startUtc.getTime() + template.duration_minutes * 60_000);

      results.push({templateId: template.id, occurrenceDate: localDateStr, startUtc, endUtc});
    }

    cursor = addDays(cursor, 7);
  }

  return results;
}
