import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  getAllSlotTemplates,
  createSlotTemplate,
  updateSlotTemplate,
  toggleSlotTemplateActive,
  deleteSlotTemplate,
  getUpcomingOccurrences
} from './slotTemplateService';
import {CLUB_LOCATION} from '@/constants/locations';
import {DAY_OF_WEEK} from '@/constants/dayOfWeek';

// Mock dependencies
vi.mock('@/lib/utils/timezone', () => ({
  toKyivTime: vi.fn((timeStr: string) => new Date(`${timeStr}Z`)) // fake conversion
}));

vi.mock('@/lib/utils/templateOccurrences', () => ({
  computeUpcomingOccurrences: vi.fn()
}));

import {computeUpcomingOccurrences} from '@/lib/utils/templateOccurrences';

describe('slotTemplateService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepos: any;

  beforeEach(() => {
    mockRepos = {
      slotTemplate: {
        getAllSlotTemplates: vi.fn(),
        insertSlotTemplate: vi.fn(),
        updateSlotTemplate: vi.fn(),
        toggleSlotTemplateActive: vi.fn(),
        deleteSlotTemplate: vi.fn(),
        getMaterializedDatesForTemplates: vi.fn()
      }
    };
    vi.clearAllMocks();
  });

  describe('getAllSlotTemplates', () => {
    it('should map and return all templates successfully', async () => {
      const rawData = [
        {
          id: 't-1',
          workout_type_id: 'wt-1',
          workout_type: {title: 'Boxing'},
          location: CLUB_LOCATION.ALPHA,
          day_of_week: DAY_OF_WEEK.MONDAY,
          start_time_local: '10:00',
          duration_minutes: 60,
          max_capacity: 10,
          price: 500,
          cancellation_deadline_hours: 12,
          is_active: true,
          recurrence_start_date: '2026-07-27',
          recurrence_end_date: null
        }
      ];
      mockRepos.slotTemplate.getAllSlotTemplates.mockResolvedValue(rawData);

      const result = await getAllSlotTemplates(mockRepos);

      expect(mockRepos.slotTemplate.getAllSlotTemplates).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 't-1',
        workout_type_id: 'wt-1',
        workout_title_key: 'Boxing',
        location: CLUB_LOCATION.ALPHA,
        day_of_week: DAY_OF_WEEK.MONDAY,
        start_time_local: '10:00',
        duration_minutes: 60,
        max_capacity: 10,
        price: 500,
        cancellation_deadline_hours: 12,
        is_active: true,
        recurrence_start_date: '2026-07-27',
        recurrence_end_date: null
      });
    });

    it('should throw an Error if repo fails', async () => {
      mockRepos.slotTemplate.getAllSlotTemplates.mockRejectedValue(new Error('DB Error'));

      await expect(getAllSlotTemplates(mockRepos)).rejects.toThrow('Failed to load slot templates');
    });
  });

  describe('createSlotTemplate', () => {
    const validData = {
      workout_type_id: 'wt-1',
      location: CLUB_LOCATION.ALPHA,
      day_of_week: DAY_OF_WEEK.MONDAY,
      start_time_local: '10:00',
      duration_minutes: 60,
      max_capacity: 10,
      price: 500,
      cancellation_deadline_hours: 12,
      recurrence_start_date: '2026-07-27',
      recurrence_end_date: null
    };

    it('should create template successfully', async () => {
      mockRepos.slotTemplate.insertSlotTemplate.mockResolvedValue();

      await expect(createSlotTemplate(validData, mockRepos)).resolves.toBeUndefined();
      expect(mockRepos.slotTemplate.insertSlotTemplate).toHaveBeenCalledWith({
        ...validData,
        is_active: true
      });
    });

    it('should throw DomainError(DB_ERROR) if insert fails', async () => {
      mockRepos.slotTemplate.insertSlotTemplate.mockRejectedValue(new Error('Insert error'));

      await expect(createSlotTemplate(validData, mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
    });
  });

  describe('updateSlotTemplate', () => {
    const validData = {
      workout_type_id: 'wt-1',
      location: CLUB_LOCATION.ALPHA,
      day_of_week: DAY_OF_WEEK.MONDAY,
      start_time_local: '10:00',
      duration_minutes: 60,
      max_capacity: 10,
      price: 500,
      cancellation_deadline_hours: 12,
      recurrence_start_date: '2026-07-27',
      recurrence_end_date: null
    };

    it('should update template successfully', async () => {
      mockRepos.slotTemplate.updateSlotTemplate.mockResolvedValue();

      await expect(updateSlotTemplate('t-1', validData, mockRepos)).resolves.toBeUndefined();
      expect(mockRepos.slotTemplate.updateSlotTemplate).toHaveBeenCalledWith('t-1', validData);
    });

    it('should throw DomainError(DB_ERROR) if update fails', async () => {
      mockRepos.slotTemplate.updateSlotTemplate.mockRejectedValue(new Error('Update error'));

      await expect(updateSlotTemplate('t-1', validData, mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
    });
  });

  describe('toggleSlotTemplateActive', () => {
    it('should toggle template state successfully', async () => {
      mockRepos.slotTemplate.toggleSlotTemplateActive.mockResolvedValue(true);

      const result = await toggleSlotTemplateActive('t-1', mockRepos);

      expect(mockRepos.slotTemplate.toggleSlotTemplateActive).toHaveBeenCalledWith('t-1');
      expect(result).toBe(true);
    });

    it('should throw DomainError(DB_ERROR) if toggle fails', async () => {
      mockRepos.slotTemplate.toggleSlotTemplateActive.mockRejectedValue(new Error('Toggle error'));

      await expect(toggleSlotTemplateActive('t-1', mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
    });
  });

  describe('deleteSlotTemplate', () => {
    it('should delete template successfully', async () => {
      mockRepos.slotTemplate.deleteSlotTemplate.mockResolvedValue();

      await expect(deleteSlotTemplate('t-1', mockRepos)).resolves.toBeUndefined();
      expect(mockRepos.slotTemplate.deleteSlotTemplate).toHaveBeenCalledWith('t-1');
    });

    it('should throw DomainError(DB_ERROR) if delete fails', async () => {
      mockRepos.slotTemplate.deleteSlotTemplate.mockRejectedValue(new Error('Delete error'));

      await expect(deleteSlotTemplate('t-1', mockRepos)).rejects.toMatchObject({code: 'DB_ERROR'});
    });
  });

  describe('getUpcomingOccurrences', () => {
    it('should compute and return upcoming occurrences correctly', async () => {
      const mockTemplates = [
        {
          id: 't-1',
          is_active: true,
          workout_type: {title: 'Boxing'},
          workout_type_id: 'wt-1',
          location: CLUB_LOCATION.ALPHA,
          day_of_week: DAY_OF_WEEK.MONDAY,
          start_time_local: '10:00',
          duration_minutes: 60,
          max_capacity: 10,
          price: 500,
          cancellation_deadline_hours: 12,
          recurrence_start_date: '2026-07-27',
          recurrence_end_date: null
        },
        {
          id: 't-2',
          is_active: false // should be ignored
        }
      ];
      const mockMaterializedDates = [
        {slot_template_id: 't-1', start_time: '2026-07-27T07:00:00Z'} // UTC time
      ];
      const mockOccurrences = [
        {
          templateId: 't-1',
          occurrenceDate: '2026-08-03',
          startUtc: new Date('2026-08-03T07:00:00Z'),
          endUtc: new Date('2026-08-03T08:00:00Z')
        }
      ];

      mockRepos.slotTemplate.getAllSlotTemplates.mockResolvedValue(mockTemplates);
      mockRepos.slotTemplate.getMaterializedDatesForTemplates.mockResolvedValue(mockMaterializedDates);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (computeUpcomingOccurrences as any).mockReturnValue(mockOccurrences);

      const result = await getUpcomingOccurrences(4, mockRepos);

      expect(mockRepos.slotTemplate.getMaterializedDatesForTemplates).toHaveBeenCalledWith(['t-1']);
      expect(computeUpcomingOccurrences).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        templateId: 't-1',
        occurrenceDate: '2026-08-03',
        workout_type_id: 'wt-1',
        workout_title_key: 'Boxing',
        startUtc: '2026-08-03T07:00:00.000Z',
        endUtc: '2026-08-03T08:00:00.000Z'
      });
    });

    it('should return empty array if no active templates', async () => {
      mockRepos.slotTemplate.getAllSlotTemplates.mockResolvedValue([{id: 't-2', is_active: false}]);

      const result = await getUpcomingOccurrences(4, mockRepos);

      expect(result).toEqual([]);
      expect(mockRepos.slotTemplate.getMaterializedDatesForTemplates).not.toHaveBeenCalled();
    });

    it('should throw Error if repo fails', async () => {
      mockRepos.slotTemplate.getAllSlotTemplates.mockRejectedValue(new Error('DB Error'));

      await expect(getUpcomingOccurrences(4, mockRepos)).rejects.toThrow('Failed to compute upcoming occurrences');
    });
  });
});
