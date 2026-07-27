import {getRepositories} from '@/repositories';
import {DashboardStats, AdminClientData} from './types';

export async function getAdminDashboardStats(repos = getRepositories()): Promise<DashboardStats> {
  try {
    const stats = await repos.admin.getAdminDashboardStats();

    const bookingsByDay = (stats.volume || []).map(row => ({
      date: row.week_start || '',
      count: Number(row.bookings_count || 0)
    }));

    const workoutTypePopularity = (stats.popularity || []).map(row => ({
      name: row.title || 'Unknown',
      value: Number(row.bookings_count || 0)
    }));

    return {
      totalUsers: Number(stats.kpis.total_clients || 0),
      activeBookings: Number(stats.kpis.active_bookings || 0),
      upcomingSlots: Number(stats.kpis.upcoming_slots || 0),
      revenueEstimate: Number(stats.kpis.revenue_estimate || 0),
      bookingsByDay,
      workoutTypePopularity
    };
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`Failed to load admin dashboard stats: ${err.message}`);
  }
}

export async function getAdminClientsList(repos = getRepositories()): Promise<AdminClientData[]> {
  try {
    const rawClients = await repos.admin.getAdminClientsList();

    return rawClients.map(row => ({
      id: row.client_id || '',
      fullName: row.full_name || '',
      email: row.email,
      phone: row.phone,
      totalBookings: Number(row.total_bookings || 0),
      sessionsAttended: Number(row.sessions_attended || 0),
      upcomingBookings: Number(row.upcoming_bookings || 0),
      cancelledBookings: Number(row.cancelled_bookings || 0),
      lastBookingAt: row.last_booking_at
    }));
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`Failed to fetch admin clients: ${err.message}`);
  }
}
