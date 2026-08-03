import {BookingStatusType} from '@/constants/bookingStatus';
import {ClubLocationType} from '@/constants/locations';
import {SlotStatusType} from '@/constants/slotStatus';

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
  status: SlotStatusType;
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
  status: SlotStatusType;
  workout_title_key: string;
  bookings_count: number;
  is_full: boolean;
  is_booked_by_user: boolean;
};

export type GroupedScheduleSlots = Record<string, ProcessedScheduleSlot[]>;

export type ProcessedClientBooking = {
  id: string;
  status: BookingStatusType;
  slot: {
    id: string;
    start_time: string;
    end_time: string;
    location: ClubLocationType;
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
  status: SlotStatusType;
  workout_type_id: string;
  workout_title_key: string;
  bookings: ProcessedAdminBooking[];
};

export type UpdateSlotInput = {
  workout_type_id?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  max_capacity?: number;
  price?: number;
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

// Slot Templates

export type ProcessedSlotTemplate = {
  id: string;
  workout_type_id: string;
  workout_title_key: string;
  location: string;
  day_of_week: number;
  start_time_local: string;
  duration_minutes: number;
  max_capacity: number;
  price: number;
  cancellation_deadline_hours: number;
  is_active: boolean;
  recurrence_start_date: string;
  recurrence_end_date: string | null;
};

export type ProcessedUpcomingOccurrence = {
  templateId: string;
  occurrenceDate: string;
  startUtc: string; // ISO string for serialization to client
  endUtc: string; // ISO string for serialization to client
  workout_type_id: string;
  workout_title_key: string;
  location: string;
  max_capacity: number;
  price: number;
  duration_minutes: number;
  cancellation_deadline_hours: number;
  start_time_local: string;
};
