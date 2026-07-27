import {describe, it, expect, vi, beforeEach} from 'vitest';
import {insertBooking, updateBookingStatus, getClientBookingsList} from './bookingRepository';

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

import {createClient} from '@/lib/supabase/server';

describe('bookingRepository', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    // Setup chainable mock methods
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase),
      update: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase)
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue(mockSupabase);
  });

  describe('insertBooking', () => {
    it('should insert booking successfully', async () => {
      mockSupabase.insert.mockResolvedValue({error: null});

      await expect(insertBooking('slot-1', 'client-1')).resolves.toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        slot_id: 'slot-1',
        client_id: 'client-1',
        status: 'confirmed'
      });
    });

    it('should throw raw error if insert fails', async () => {
      const dbError = new Error('DB Error');
      mockSupabase.insert.mockResolvedValue({error: dbError});

      await expect(insertBooking('slot-1', 'client-1')).rejects.toThrow('DB Error');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      // The last chained method (.eq) should return the final promise on its second call
      mockSupabase.eq.mockReturnValueOnce(mockSupabase).mockResolvedValueOnce({error: null});

      await expect(updateBookingStatus('b-1', 'u-1', 'cancelled')).resolves.toBeUndefined();
      expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
      expect(mockSupabase.update).toHaveBeenCalledWith({status: 'cancelled'});

      // We expect eq to have been called twice in a chain: .eq('id', bookingId).eq('client_id', userId)
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'b-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('client_id', 'u-1');
    });

    it('should throw raw error if update fails', async () => {
      const dbError = new Error('Update Error');
      mockSupabase.eq.mockReturnValueOnce(mockSupabase).mockResolvedValueOnce({error: dbError});

      await expect(updateBookingStatus('b-1', 'u-1', 'cancelled')).rejects.toThrow('Update Error');
    });
  });

  describe('getClientBookingsList', () => {
    it('should return bookings array on success', async () => {
      const mockData = [{id: 'b-1', status: 'confirmed'}];
      mockSupabase.eq.mockResolvedValue({data: mockData, error: null});

      const result = await getClientBookingsList('u-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
      expect(mockSupabase.select).toHaveBeenCalled(); // Should contain the complex query string
      expect(mockSupabase.eq).toHaveBeenCalledWith('client_id', 'u-1');
      expect(result).toEqual(mockData);
    });

    it('should return empty array if data is null', async () => {
      mockSupabase.eq.mockResolvedValue({data: null, error: null});

      const result = await getClientBookingsList('u-1');
      expect(result).toEqual([]);
    });

    it('should throw raw error if select fails', async () => {
      const dbError = new Error('Select Error');
      mockSupabase.eq.mockResolvedValue({data: null, error: dbError});

      await expect(getClientBookingsList('u-1')).rejects.toThrow('Select Error');
    });
  });
});
