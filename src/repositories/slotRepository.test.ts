import {describe, it, expect, vi, beforeEach} from 'vitest';
import {findOverlappingSlots, insertSlot, getAdminSlotsList, getScheduleSlotsList} from './slotRepository';

// Mock Supabase clients
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn()
}));

import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';

describe('slotRepository', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAdminSupabase: any;

  beforeEach(() => {
    // Mock chainable methods
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      neq: vi.fn(() => mockSupabase),
      lt: vi.fn(() => mockSupabase),
      gt: vi.fn(() => mockSupabase),
      gte: vi.fn(() => mockSupabase),
      order: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase)
    };

    mockAdminSupabase = {
      from: vi.fn(() => mockAdminSupabase),
      select: vi.fn(() => mockAdminSupabase),
      gte: vi.fn(() => mockAdminSupabase),
      lte: vi.fn(() => mockAdminSupabase),
      order: vi.fn(() => mockAdminSupabase)
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockResolvedValue(mockSupabase);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createAdminClient as any).mockReturnValue(mockAdminSupabase);
  });

  describe('findOverlappingSlots', () => {
    it('should return array of overlapping slot ids', async () => {
      const mockData = [{id: 'slot-1'}];
      mockSupabase.gt.mockResolvedValue({data: mockData, error: null});

      const result = await findOverlappingSlots('2026-07-27T10:00:00Z', '2026-07-27T11:00:00Z');

      expect(mockSupabase.from).toHaveBeenCalledWith('slots');
      expect(mockSupabase.select).toHaveBeenCalledWith('id');
      expect(mockSupabase.neq).toHaveBeenCalledWith('status', 'cancelled');
      expect(mockSupabase.lt).toHaveBeenCalledWith('start_time', '2026-07-27T11:00:00Z');
      expect(mockSupabase.gt).toHaveBeenCalledWith('end_time', '2026-07-27T10:00:00Z');
      expect(result).toEqual(mockData);
    });

    it('should return empty array if data is null', async () => {
      mockSupabase.gt.mockResolvedValue({data: null, error: null});
      const result = await findOverlappingSlots('time1', 'time2');
      expect(result).toEqual([]);
    });

    it('should throw raw error if DB fails', async () => {
      const dbError = new Error('Overlap Query Error');
      mockSupabase.gt.mockResolvedValue({data: null, error: dbError});

      await expect(findOverlappingSlots('time1', 'time2')).rejects.toThrow('Overlap Query Error');
    });
  });

  describe('insertSlot', () => {
    it('should insert slot successfully', async () => {
      mockSupabase.insert.mockResolvedValue({error: null});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(insertSlot({location: 'alpha'} as any)).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith('slots');
      expect(mockSupabase.insert).toHaveBeenCalledWith({location: 'alpha'});
    });

    it('should throw raw error if insert fails', async () => {
      const dbError = new Error('Insert Error');
      mockSupabase.insert.mockResolvedValue({error: dbError});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(insertSlot({location: 'alpha'} as any)).rejects.toThrow('Insert Error');
    });
  });

  describe('getAdminSlotsList', () => {
    it('should fetch and map admin slots correctly', async () => {
      const rawDbData = [
        {
          id: 's-1',
          location: 'alpha',
          start_time: '2026-07-27T10:00:00Z',
          end_time: '2026-07-27T11:00:00Z',
          max_capacity: 5,
          price: 100,
          status: 'scheduled',
          workout_type: {title: 'Boxing'},
          bookings: [{id: 'b-1'}, {id: 'b-2'}]
        },
        {
          id: 's-2',
          location: 'top_gun',
          start_time: '2026-07-28T10:00:00Z',
          end_time: '2026-07-28T11:00:00Z',
          max_capacity: 10,
          price: 200,
          status: 'scheduled',
          workout_type: [{title: 'TRX'}], // Test array extraction
          bookings: null // Test missing bookings
        }
      ];
      mockSupabase.order.mockResolvedValue({data: rawDbData, error: null});

      const result = await getAdminSlotsList();

      expect(mockSupabase.from).toHaveBeenCalledWith('slots');
      expect(mockSupabase.gte).toHaveBeenCalled();
      expect(mockSupabase.order).toHaveBeenCalledWith('start_time', {ascending: true});

      expect(result).toHaveLength(2);
      // Verify data mapping (now it returns raw slots)
      expect(result[0].workout_type).toEqual({title: 'Boxing'});
      expect(result[0].bookings).toEqual([{id: 'b-1'}, {id: 'b-2'}]);

      expect(result[1].workout_type).toEqual([{title: 'TRX'}]);
      expect(result[1].bookings).toBeNull();
    });

    it('should throw raw error if fetch fails', async () => {
      const dbError = new Error('Fetch Error');
      mockSupabase.order.mockResolvedValue({data: null, error: dbError});

      await expect(getAdminSlotsList()).rejects.toThrow('Fetch Error');
    });
  });

  describe('getScheduleSlotsList', () => {
    it('should fetch schedule slots using admin client', async () => {
      const mockData = [{id: 's-1'}];
      mockAdminSupabase.order.mockResolvedValue({data: mockData, error: null});

      const result = await getScheduleSlotsList('2026-07-27', '2026-08-02');

      expect(createAdminClient).toHaveBeenCalled(); // Verify Admin client was used
      expect(mockAdminSupabase.from).toHaveBeenCalledWith('slots');
      expect(mockAdminSupabase.select).toHaveBeenCalled();
      expect(mockAdminSupabase.gte).toHaveBeenCalledWith('start_time', '2026-07-27');
      expect(mockAdminSupabase.lte).toHaveBeenCalledWith('start_time', '2026-08-02');
      expect(mockAdminSupabase.order).toHaveBeenCalledWith('start_time', {ascending: true});

      expect(result).toEqual(mockData);
    });

    it('should return empty array if data is null', async () => {
      mockAdminSupabase.order.mockResolvedValue({data: null, error: null});

      const result = await getScheduleSlotsList('d1', 'd2');
      expect(result).toEqual([]);
    });

    it('should throw raw error if fetch fails', async () => {
      const dbError = new Error('Schedule Fetch Error');
      mockAdminSupabase.order.mockResolvedValue({data: null, error: dbError});

      await expect(getScheduleSlotsList('d1', 'd2')).rejects.toThrow('Schedule Fetch Error');
    });
  });
});
