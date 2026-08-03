import {QueryData, SupabaseClient} from '@supabase/supabase-js';

import {Profile, UserRole} from '@/lib/supabase/types';
import {Database} from '@/types/database.types';
import {createAdminClient} from '@/lib/supabase/admin';
import {BookingStatusType} from '@/constants/bookingStatus';
import {ClubLocationType} from '@/constants/locations';
import {SlotStatusType} from '@/constants/slotStatus';
import {DayOfWeekType} from '@/constants/dayOfWeek';

import {adminSlotsListQuery, scheduleSlotsListQuery} from './slotRepository';
import {clientBookingsListQuery} from './bookingRepository';

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

export interface RawAdminClientData {
  client_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  total_bookings: number | null;
  sessions_attended: number | null;
  upcoming_bookings: number | null;
  cancelled_bookings: number | null;
  last_booking_at: string | null;
}

export interface CreateSlotData {
  workout_type_id: string;
  location: ClubLocationType;
  start_time: string; // ISO string
  end_time: string; // ISO string
  max_capacity: number;
  price: number;
  status: SlotStatusType;
  cancellation_deadline_hours?: number;
  slot_template_id?: string;
}

export type UpdateSlotData = Partial<CreateSlotData>;

export type WorkoutType = Database['public']['Tables']['workout_types']['Row'];

export type RawSlotData = QueryData<ReturnType<typeof adminSlotsListQuery>>[number];
export type RawScheduleSlotData = QueryData<ReturnType<typeof scheduleSlotsListQuery>>[number];
export type RawBookingData = QueryData<ReturnType<typeof clientBookingsListQuery>>[number];

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
    status: BookingStatusType
  ): Promise<RawBookingNotificationData>;
  getClientBookingsList(userId: string): Promise<RawBookingData[]>;
  cancelBookingAsAdmin(bookingId: string): Promise<void>;
}

export interface IProfileRepository {
  getProfileById(userId: string): Promise<Profile | null>;
  getProfileRoleById(userId: string): Promise<UserRole>;
}

export interface ISlotRepository {
  findOverlappingSlots(startTime: string, endTime: string, excludeSlotId?: string): Promise<{id: string}[]>;
  insertSlot(slotData: CreateSlotData): Promise<void>;
  updateSlotStatus(slotId: string, status: SlotStatusType): Promise<void>;
  updateSlot(slotId: string, slotData: UpdateSlotData): Promise<void>;
  getAdminSlotsList(): Promise<RawSlotData[]>;
  getScheduleSlotsList(startDate: string, endDate: string): Promise<RawScheduleSlotData[]>;
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
      workout_type_id,
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

// Slot Templates

export const allSlotTemplatesQuery = (client: SupabaseClient<Database> = createAdminClient()) =>
  client.from('slot_templates').select(
    `
      id,
      workout_type_id,
      location,
      day_of_week,
      start_time_local,
      duration_minutes,
      max_capacity,
      price,
      cancellation_deadline_hours,
      is_active,
      recurrence_start_date,
      recurrence_end_date,
      created_at,
      workout_type:workout_types(title)
    `
  );

export type RawSlotTemplateData = QueryData<ReturnType<typeof allSlotTemplatesQuery>>[number];

export interface CreateSlotTemplateData {
  workout_type_id: string;
  location: ClubLocationType;
  day_of_week: DayOfWeekType;
  start_time_local: string;
  duration_minutes: number;
  max_capacity: number;
  price: number;
  cancellation_deadline_hours: number;
  is_active: boolean;
  recurrence_start_date: string;
  recurrence_end_date: string | null;
}

export type UpdateSlotTemplateData = Partial<CreateSlotTemplateData>;

export interface ISlotTemplateRepository {
  getAllSlotTemplates(): Promise<RawSlotTemplateData[]>;
  insertSlotTemplate(data: CreateSlotTemplateData): Promise<void>;
  updateSlotTemplate(id: string, data: UpdateSlotTemplateData): Promise<void>;
  toggleSlotTemplateActive(id: string): Promise<boolean>;
  deleteSlotTemplate(id: string): Promise<void>;
  getMaterializedDatesForTemplates(templateIds: string[]): Promise<{slot_template_id: string; start_time: string}[]>;
}
