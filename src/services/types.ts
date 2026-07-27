import {Database} from '@/types/database.types';

export type DashboardStats = {
  totalUsers: number;
  activeBookings: number;
  upcomingSlots: number;
  revenueEstimate: number;
  bookingsByDay: {date: string; count: number}[];
  workoutTypePopularity: {name: string; value: number}[];
};

export type AdminClientData = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  totalBookings: number;
  sessionsAttended: number;
  upcomingBookings: number;
  cancelledBookings: number;
  lastBookingAt: string | null;
};

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

export type ProcessedAdminBooking = {
  id: string;
  status: string;
  createdAt: string;
  clientName: string | null;
  clientEmail: string | null;
};

export type ProcessedAdminSlotDetails = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  status: string;
  workout_title_key: string;
  bookings: ProcessedAdminBooking[];
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
