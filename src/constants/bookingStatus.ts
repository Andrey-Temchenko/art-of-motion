export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
} as const;

export type BookingStatusType = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS) as [BookingStatusType, ...BookingStatusType[]];
