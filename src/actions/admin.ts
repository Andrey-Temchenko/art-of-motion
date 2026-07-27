'use server';

import {getRepositories} from '@/repositories';
import {DashboardStats, AdminClientData} from '@/repositories/types';
import {getUserProfile} from '@/lib/supabase/session';

export type ActionResponse<T> = {success: true; data: T} | {success: false; error: string};

export type {DashboardStats, AdminClientData};

export async function getAdminOverviewStats(): Promise<ActionResponse<DashboardStats>> {
  const {profile} = await getUserProfile();
  if (profile?.role !== 'admin') {
    return {success: false, error: 'Unauthorized'};
  }

  try {
    const repos = getRepositories();
    const stats = await repos.admin.getAdminDashboardStats();
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
  if (profile?.role !== 'admin') {
    return {success: false, error: 'Unauthorized'};
  }

  try {
    const repos = getRepositories();
    const clients = await repos.admin.getAdminClientsList();
    return {
      success: true,
      data: clients
    };
  } catch (error) {
    console.error('Error fetching admin clients:', error);
    return {success: false, error: 'Failed to fetch admin clients'};
  }
}
