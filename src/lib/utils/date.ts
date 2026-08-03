import {addDays, format as formatFn} from 'date-fns';
import type {Locale as DateFnsLocaleType} from 'date-fns';
import {uk, ru, enUS} from 'date-fns/locale';

import {APP_LOCALES} from '@/lib/i18n/config';

export const SCHEDULE_DAYS_RANGE = 7;

export function getDateFnsLocale(locale: string): DateFnsLocaleType {
  return locale === APP_LOCALES.UK ? uk : locale === APP_LOCALES.RU ? ru : enUS;
}

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

/**
 * Safely parses a YYYY-MM-DD string into a local Date object.
 * Prevents the timezone shifting issues that occur when using new Date('YYYY-MM-DD').
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formats a given date (Date, string, or number) into a localized string using date-fns.
 * @param date The date to format
 * @param formatStr The format string
 * @param localeStr Optional locale string (e.g. 'uk', 'ru', 'en')
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | number, formatStr: string, localeStr?: string): string {
  const dateObj = new Date(date);
  return formatFn(dateObj, formatStr, {
    locale: localeStr ? getDateFnsLocale(localeStr) : undefined
  });
}
