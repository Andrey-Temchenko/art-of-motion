import {createClient} from '@/lib/supabase/server';

import type {RawDashboardStats, RawAdminClientData, RawDashboardKpis} from './types';

export async function getAdminDashboardStats(): Promise<RawDashboardStats> {
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

  const kpis = (kpisResponse.data?.[0] || {
    total_clients: 0,
    active_bookings: 0,
    upcoming_slots: 0,
    revenue_estimate: 0
  }) as RawDashboardKpis;

  return {
    kpis,
    volume: volumeResponse.data || [],
    popularity: popularityResponse.data || []
  };
}

export async function getAdminClientsList(): Promise<RawAdminClientData[]> {
  const supabase = await createClient();

  const {data, error} = await supabase.rpc('admin_client_overview');

  if (error) {
    throw new Error(`Failed to fetch admin clients: ${error.message}`);
  }

  return (data || []) as RawAdminClientData[];
}
