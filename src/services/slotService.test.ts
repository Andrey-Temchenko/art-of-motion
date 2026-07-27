import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createSlot, getAdminSlots} from './slotService';
import {DomainError} from './types';

// Mock timezone util
vi.mock('@/lib/utils/timezone', () => ({
  fromKyivTime: vi.fn((timeStr: string) => new Date(`${timeStr}Z`)) // fake conversion for test
}));

describe('slotService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepos: any;

  beforeEach(() => {
    mockRepos = {
      slot: {
        findOverlappingSlots: vi.fn(),
        insertSlot: vi.fn(),
        getAdminSlotsList: vi.fn()
      }
    };
  });

  describe('createSlot', () => {
    const validData = {
      workout_type_id: 'wt-1',
      location: 'alpha',
      start_time: '2026-07-27T10:00:00',
      end_time: '2026-07-27T11:00:00',
      max_capacity: 10,
      price: 500
    };

    it('should successfully create a slot if no overlaps', async () => {
      mockRepos.slot.findOverlappingSlots.mockResolvedValue([]);
      mockRepos.slot.insertSlot.mockResolvedValue();

      await expect(createSlot(validData, mockRepos)).resolves.toBeUndefined();
      expect(mockRepos.slot.findOverlappingSlots).toHaveBeenCalled();
      expect(mockRepos.slot.insertSlot).toHaveBeenCalled();
    });

    it('should throw DomainError(OVERLAP) if overlapping slots exist', async () => {
      mockRepos.slot.findOverlappingSlots.mockResolvedValue([{id: 'slot-1'}]);

      await expect(createSlot(validData, mockRepos)).rejects.toThrow(DomainError);
      await expect(createSlot(validData, mockRepos)).rejects.toMatchObject({code: 'OVERLAP'});
      expect(mockRepos.slot.insertSlot).not.toHaveBeenCalled();
    });

    it('should throw DomainError(DB_ERROR) if overlap check fails', async () => {
      mockRepos.slot.findOverlappingSlots.mockRejectedValue(new Error('Network error'));

      await expect(createSlot(validData, mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
      expect(mockRepos.slot.insertSlot).not.toHaveBeenCalled();
    });

    it('should throw DomainError(DB_ERROR) if insert fails', async () => {
      mockRepos.slot.findOverlappingSlots.mockResolvedValue([]);
      mockRepos.slot.insertSlot.mockRejectedValue(new Error('Insert error'));

      await expect(createSlot(validData, mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
    });
  });

  describe('getAdminSlots', () => {
    it('should return slots list from repo', async () => {
      const mockSlots = [{id: 'slot-1', location: 'alpha'}];
      mockRepos.slot.getAdminSlotsList.mockResolvedValue(mockSlots);

      const result = await getAdminSlots(mockRepos);
      expect(result).toEqual(mockSlots);
    });

    it('should throw generic Error if repo fails', async () => {
      mockRepos.slot.getAdminSlotsList.mockRejectedValue(new Error('DB connection lost'));

      await expect(getAdminSlots(mockRepos)).rejects.toThrow('Failed to load slots');
    });
  });
});
