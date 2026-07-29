'use server';

import {
  getAdminDashboardStats as getAdminDashboardStatsService,
  getAdminClientsList as getAdminClientsListService
} from '@/services/adminService';
import type {DashboardStats, AdminClientData} from '@/services/types';
import {getUserProfile} from '@/lib/supabase/session';
import {USER_ROLE} from '@/constants/roles';

export type ActionResponse<T> = {success: true; data: T} | {success: false; error: string};

export async function getAdminOverviewStats(): Promise<ActionResponse<DashboardStats>> {
  const {profile} = await getUserProfile();
  if (profile?.role !== USER_ROLE.ADMIN) {
    return {success: false, error: 'Unauthorized'};
  }

  try {
    const stats = await getAdminDashboardStatsService();
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error fetching admin KPIs:', error);
    return {success: false, error: 'Failed to fetch admin dashboard stats'};
  }
}

export async function getAdminClients(): Promise<ActionResponse<AdminClientData[]>> {
  const {profile} = await getUserProfile();
  if (profile?.role !== USER_ROLE.ADMIN) {
    return {success: false, error: 'Unauthorized'};
  }

  try {
    const clients = await getAdminClientsListService();
    return {
      success: true,
      data: clients
    };
  } catch (error) {
    console.error('Error fetching admin clients:', error);
    return {success: false, error: 'Failed to fetch admin clients'};
  }
}
