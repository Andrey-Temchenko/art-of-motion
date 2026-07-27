import {Profile, UserRole} from '@/lib/supabase/types';
import {Database} from '@/types/database.types';
import {QueryData} from '@supabase/supabase-js';
import {createAdminClient} from '@/lib/supabase/admin';

export interface RawDashboardKpis {
  total_clients: number | null;
  active_bookings: number | null;
  upcoming_slots: number | null;
  revenue_estimate: number | null;
}

export interface RawBookingsVolume {
  week_start: string | null;
  bookings_count: number | null;
}

export interface RawWorkoutPopularity {
  title: string | null;
  bookings_count: number | null;
}

export interface RawDashboardStats {
  kpis: RawDashboardKpis;
  volume: RawBookingsVolume[];
  popularity: RawWorkoutPopularity[];
}

export type RawAdminClientData = {
  client_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  total_bookings: number | null;
  sessions_attended: number | null;
  upcoming_bookings: number | null;
  cancelled_bookings: number | null;
  last_booking_at: string | null;
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
  bookings: {id?: string; client_id?: string; status?: string}[] | null;
};

export interface IAdminRepository {
  getAdminDashboardStats(): Promise<RawDashboardStats>;
  getAdminClientsList(): Promise<RawAdminClientData[]>;
}

export const bookingNotificationQuery = () =>
  createAdminClient()
    .from('bookings')
    .select('id, profiles(full_name, phone), slots(start_time, location, workout_type:workout_types(title))')
    .single();

export type RawBookingNotificationData = QueryData<ReturnType<typeof bookingNotificationQuery>>;

export interface IBookingRepository {
  insertBooking(slot_id: string, client_id: string): Promise<RawBookingNotificationData>;
  updateBookingStatus(
    bookingId: string,
    userId: string,
    status: 'confirmed' | 'cancelled'
  ): Promise<RawBookingNotificationData>;
  getClientBookingsList(userId: string): Promise<RawBookingData[]>;
  cancelBookingAsAdmin(bookingId: string): Promise<void>;
}

export interface IProfileRepository {
  getProfileById(userId: string): Promise<Profile | null>;
  getProfileRoleById(userId: string): Promise<UserRole>;
}

export interface ISlotRepository {
  findOverlappingSlots(startTime: string, endTime: string): Promise<{id: string}[]>;
  insertSlot(slotData: CreateSlotData): Promise<void>;
  getAdminSlotsList(): Promise<RawSlotData[]>;
  getScheduleSlotsList(startDate: string, endDate: string): Promise<RawSlotData[]>;
  getAdminSlotDetails(slotId: string): Promise<RawAdminSlotDetails | null>;
}

export const adminSlotDetailsQuery = () =>
  createAdminClient()
    .from('slots')
    .select(
      `
      id,
      location,
      start_time,
      end_time,
      max_capacity,
      price,
      status,
      workout_type:workout_types(title),
      bookings(
        id,
        status,
        created_at,
        profiles(
          id,
          full_name,
          email
        )
      )
    `
    )
    .single();

export type RawAdminSlotDetails = QueryData<ReturnType<typeof adminSlotDetailsQuery>>;

export interface IWorkoutTypeRepository {
  getAllWorkoutTypes(): Promise<WorkoutType[]>;
}
