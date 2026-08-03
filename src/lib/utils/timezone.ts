import {format as formatFn} from 'date-fns';
import {toZonedTime, fromZonedTime, formatInTimeZone} from 'date-fns-tz';

export const KYIV_TIMEZONE = 'Europe/Kyiv';

/**
 * Converts a local datetime string or Date object created on the client/admin
 * to a UTC Date object, assuming the input represents Kyiv time.
 * @param date The local datetime string (e.g. "2026-07-29T18:00") or Date
 * @returns A Date object representing the equivalent UTC time
 */
export function fromKyivTime(date: Date | string | number): Date {
  return fromZonedTime(date, KYIV_TIMEZONE);
}

/**
 * Converts a UTC Date object (from the DB) to a Kyiv-zoned Date object
 * for display purposes on the client.
 * @param date The UTC date
 * @returns A Date object shifted to Kyiv time
 */
export function toKyivTime(date: Date | string | number): Date {
  return toZonedTime(date, KYIV_TIMEZONE);
}

import type {Locale} from 'date-fns';

/**
 * Formats a given date (UTC or local) directly into a string representation in Kyiv timezone.
 * @param date The date to format
 * @param formatStr The date-fns format string (e.g. "HH:mm")
 * @param options Additional date-fns options (like locale)
 * @returns The formatted string
 */
export function formatKyivTime(date: Date | string | number, formatStr: string, options?: {locale?: Locale}): string {
  return formatInTimeZone(date, KYIV_TIMEZONE, formatStr, options);
}

/**
 * Formats a Kyiv-zoned Date object using the standard date-fns format.
 * (Assumes the Date object was already converted via `toKyivTime`).
 */
export function formatZonedTime(date: Date, formatStr: string): string {
  return formatFn(date, formatStr);
}
