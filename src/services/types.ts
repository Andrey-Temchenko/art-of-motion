import {Database} from '@/types/database.types';

export type ProcessedAdminSlot = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  status: string;
  workout_title_key: string;
  bookings_count: number;
};

export type ProcessedScheduleSlot = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  status: string;
  workout_title_key: string;
  bookings_count: number;
  is_full: boolean;
  is_booked_by_user: boolean;
};

export type GroupedScheduleSlots = Record<string, ProcessedScheduleSlot[]>;

export type ProcessedClientBooking = {
  id: string;
  status: Database['public']['Enums']['booking_status'];
  slot: {
    id: string;
    start_time: string;
    end_time: string;
    location: Database['public']['Enums']['club_location'];
    price: number;
    cancellation_deadline_hours: number;
    workout_title_key: string;
  };
};

export type CancelBookingResult =
  {success: true} | {success: false; code: 'UNAUTHORIZED' | 'CANCELLATION_NOT_ALLOWED' | 'UNKNOWN'};

// Base domain error
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
