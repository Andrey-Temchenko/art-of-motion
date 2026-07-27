import {createClient} from '@/lib/supabase/server';

import {DashboardStats, AdminClientData} from './types';

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [kpisResponse, volumeResponse, popularityResponse] = await Promise.all([
    supabase.rpc('admin_dashboard_kpis'),
    supabase.rpc('admin_bookings_volume'),
    supabase.rpc('admin_popular_workout_types')
  ]);

  if (kpisResponse.error) {
    throw new Error(`Failed to fetch admin KPIs: ${kpisResponse.error.message}`);
  }

  if (volumeResponse.error) {
    throw new Error(`Failed to fetch bookings volume: ${volumeResponse.error.message}`);
  }

  if (popularityResponse.error) {
    throw new Error(`Failed to fetch workout popularity: ${popularityResponse.error.message}`);
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
    totalUsers: Number(kpis.total_clients || 0),
    activeBookings: Number(kpis.active_bookings || 0),
    upcomingSlots: Number(kpis.upcoming_slots || 0),
    revenueEstimate: Number(kpis.revenue_estimate || 0),
    bookingsByDay,
    workoutTypePopularity
  };
}

export async function getAdminClientsList(): Promise<AdminClientData[]> {
  const supabase = await createClient();

  const {data, error} = await supabase.rpc('admin_client_overview');

  if (error) {
    throw new Error(`Failed to fetch admin clients: ${error.message}`);
  }

  return (data || []).map(
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
  );
}
