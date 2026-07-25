'use server';

import {createClient} from '@/lib/supabase/server';
import {getUserProfile} from '@/lib/supabase/session';

export type ActionResponse<T> = {success: true; data: T} | {success: false; error: string};

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

export async function getAdminOverviewStats(): Promise<ActionResponse<DashboardStats>> {
  const {profile} = await getUserProfile();
  if (profile?.role !== 'admin') {
    return {success: false, error: 'Unauthorized'};
  }

  const supabase = await createClient();

  const [kpisResponse, volumeResponse, popularityResponse] = await Promise.all([
    supabase.rpc('admin_dashboard_kpis'),
    supabase.rpc('admin_bookings_volume'),
    supabase.rpc('admin_popular_workout_types')
  ]);

  if (kpisResponse.error) {
    console.error('Error fetching admin KPIs:', kpisResponse.error);
    return {success: false, error: 'Failed to fetch admin KPIs'};
  }

  if (volumeResponse.error) {
    console.error('Error fetching admin bookings volume:', volumeResponse.error);
    return {success: false, error: 'Failed to fetch bookings volume'};
  }

  if (popularityResponse.error) {
    console.error('Error fetching admin workout popularity:', popularityResponse.error);
    return {success: false, error: 'Failed to fetch workout popularity'};
  }

  const kpis = kpisResponse.data?.[0] || {
    total_clients: 0,
    active_bookings: 0,
    upcoming_slots: 0,
    revenue_estimate: 0
  };

  const bookingsByDay = (volumeResponse.data || []).map(
    (row: {week_start: string | null; bookings_count: number | null}) => ({
      date: row.week_start || '',
      count: Number(row.bookings_count || 0)
    })
  );

  const workoutTypePopularity = (popularityResponse.data || []).map(
    (row: {title: string | null; bookings_count: number | null}) => ({
      name: row.title || 'Unknown',
      value: Number(row.bookings_count || 0)
    })
  );

  return {
    success: true,
    data: {
      totalUsers: Number(kpis.total_clients || 0),
      activeBookings: Number(kpis.active_bookings || 0),
      upcomingSlots: Number(kpis.upcoming_slots || 0),
      revenueEstimate: Number(kpis.revenue_estimate || 0),
      bookingsByDay,
      workoutTypePopularity
    }
  };
}

export async function getAdminClients(): Promise<ActionResponse<AdminClientData[]>> {
  const {profile} = await getUserProfile();
  if (profile?.role !== 'admin') {
    return {success: false, error: 'Unauthorized'};
  }

  const supabase = await createClient();

  const {data, error} = await supabase.rpc('admin_client_overview');

  if (error) {
    console.error('Error fetching admin clients:', error);
    return {success: false, error: 'Failed to fetch admin clients'};
  }

  return {
    success: true,
    data: (data || []).map(
      (row: {
        client_id: string | null;
        full_name: string | null;
        email: string | null;
        phone: string | null;
        total_bookings: number | null;
        sessions_attended: number | null;
        upcoming_bookings: number | null;
        cancelled_bookings: number | null;
        last_booking_at: string | null;
      }) => ({
        id: row.client_id || '',
        fullName: row.full_name || '',
        email: row.email,
        phone: row.phone,
        totalBookings: Number(row.total_bookings || 0),
        sessionsAttended: Number(row.sessions_attended || 0),
        upcomingBookings: Number(row.upcoming_bookings || 0),
        cancelledBookings: Number(row.cancelled_bookings || 0),
        lastBookingAt: row.last_booking_at
      })
    )
  };
}
