import {Profile, UserRole} from '@/lib/supabase/types';
import {Database} from '@/types/database.types';
import {ProcessedAdminSlot} from '@/services/types';

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

export type CreateSlotData = {
  workout_type_id: string;
  location: Database['public']['Enums']['club_location'];
  start_time: string; // ISO string
  end_time: string; // ISO string
  max_capacity: number;
  price: number;
  status: Database['public']['Enums']['slot_status'];
};

export type WorkoutType = Database['public']['Tables']['workout_types']['Row'];

export type RawBookingData = {
  id: string;
  status: string;
  slots:
    | {
        id: string;
        start_time: string;
        end_time: string;
        location: string;
        price: number;
        cancellation_deadline_hours: number;
        workout_types: {title: string} | {title: string}[] | null;
      }
    | {
        id: string;
        start_time: string;
        end_time: string;
        location: string;
        price: number;
        cancellation_deadline_hours: number;
        workout_types: {title: string} | {title: string}[] | null;
      }[]
    | null;
};

export type RawSlotData = {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  status: string;
  workout_type: {title: string} | {title: string}[] | null;
  bookings: {client_id: string; status: string}[] | null;
};

export interface IAdminRepository {
  getAdminDashboardStats(): Promise<DashboardStats>;
  getAdminClientsList(): Promise<AdminClientData[]>;
}

export interface IBookingRepository {
  insertBooking(slot_id: string, client_id: string): Promise<void>;
  updateBookingStatus(bookingId: string, userId: string, status: 'confirmed' | 'cancelled'): Promise<void>;
  getClientBookingsList(userId: string): Promise<RawBookingData[]>;
}

export interface IProfileRepository {
  getProfileById(userId: string): Promise<Profile | null>;
  getProfileRoleById(userId: string): Promise<UserRole>;
}

export interface ISlotRepository {
  findOverlappingSlots(startTime: string, endTime: string): Promise<{id: string}[]>;
  insertSlot(slotData: CreateSlotData): Promise<void>;
  getAdminSlotsList(): Promise<ProcessedAdminSlot[]>;
  getScheduleSlotsList(startDate: string, endDate: string): Promise<RawSlotData[]>;
}

export interface IWorkoutTypeRepository {
  getAllWorkoutTypes(): Promise<WorkoutType[]>;
}
