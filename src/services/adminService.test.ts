import {describe, it, expect, vi, beforeEach} from 'vitest';
import {getAdminDashboardStats, getAdminClientsList} from './adminService';
import {RawDashboardStats, RawAdminClientData} from '@/repositories/types';

describe('adminService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepos: any;

  beforeEach(() => {
    mockRepos = {
      admin: {
        getAdminDashboardStats: vi.fn(),
        getAdminClientsList: vi.fn()
      }
    };
  });

  describe('getAdminDashboardStats', () => {
    it('should correctly map raw stats to DashboardStats', async () => {
      const rawStats: RawDashboardStats = {
        kpis: {
          total_clients: 10,
          active_bookings: 5,
          upcoming_slots: 2,
          revenue_estimate: 1000
        },
        volume: [{week_start: '2026-07-27', bookings_count: 5}],
        popularity: [{title: 'Boxing', bookings_count: 5}]
      };

      mockRepos.admin.getAdminDashboardStats.mockResolvedValue(rawStats);

      const result = await getAdminDashboardStats(mockRepos);

      expect(result).toEqual({
        totalUsers: 10,
        activeBookings: 5,
        upcomingSlots: 2,
        revenueEstimate: 1000,
        bookingsByDay: [{date: '2026-07-27', count: 5}],
        workoutTypePopularity: [{name: 'Boxing', value: 5}]
      });
    });

    it('should handle null/undefined values correctly', async () => {
      const rawStats: RawDashboardStats = {
        kpis: {
          total_clients: null,
          active_bookings: null,
          upcoming_slots: null,
          revenue_estimate: null
        },
        volume: [{week_start: null, bookings_count: null}],
        popularity: [{title: null, bookings_count: null}]
      };

      mockRepos.admin.getAdminDashboardStats.mockResolvedValue(rawStats);

      const result = await getAdminDashboardStats(mockRepos);

      expect(result).toEqual({
        totalUsers: 0,
        activeBookings: 0,
        upcomingSlots: 0,
        revenueEstimate: 0,
        bookingsByDay: [{date: '', count: 0}],
        workoutTypePopularity: [{name: 'Unknown', value: 0}]
      });
    });

    it('should throw an error if repo fails', async () => {
      mockRepos.admin.getAdminDashboardStats.mockRejectedValue(new Error('Repo failed'));
      await expect(getAdminDashboardStats(mockRepos)).rejects.toThrow(
        'Failed to load admin dashboard stats: Repo failed'
      );
    });
  });

  describe('getAdminClientsList', () => {
    it('should correctly map raw client data to AdminClientData', async () => {
      const rawClients: RawAdminClientData[] = [
        {
          client_id: 'c-1',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+123',
          total_bookings: 10,
          sessions_attended: 8,
          upcoming_bookings: 1,
          cancelled_bookings: 1,
          last_booking_at: '2026-07-27'
        }
      ];

      mockRepos.admin.getAdminClientsList.mockResolvedValue(rawClients);

      const result = await getAdminClientsList(mockRepos);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'c-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+123',
        totalBookings: 10,
        sessionsAttended: 8,
        upcomingBookings: 1,
        cancelledBookings: 1,
        lastBookingAt: '2026-07-27'
      });
    });

    it('should handle missing data with defaults', async () => {
      const rawClients: RawAdminClientData[] = [
        {
          client_id: null,
          full_name: null,
          email: null,
          phone: null,
          total_bookings: null,
          sessions_attended: null,
          upcoming_bookings: null,
          cancelled_bookings: null,
          last_booking_at: null
        }
      ];

      mockRepos.admin.getAdminClientsList.mockResolvedValue(rawClients);

      const result = await getAdminClientsList(mockRepos);

      expect(result[0]).toEqual({
        id: '',
        fullName: '',
        email: null,
        phone: null,
        totalBookings: 0,
        sessionsAttended: 0,
        upcomingBookings: 0,
        cancelledBookings: 0,
        lastBookingAt: null
      });
    });

    it('should throw an error if repo fails', async () => {
      mockRepos.admin.getAdminClientsList.mockRejectedValue(new Error('Network issue'));
      await expect(getAdminClientsList(mockRepos)).rejects.toThrow('Failed to fetch admin clients: Network issue');
    });
  });
});
