import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  getAllSlotTemplates,
  insertSlotTemplate,
  updateSlotTemplate,
  toggleSlotTemplateActive,
  deleteSlotTemplate,
  getMaterializedDatesForTemplates
} from './slotTemplateRepository';
import {CLUB_LOCATION} from '@/constants/locations';
import {DAY_OF_WEEK} from '@/constants/dayOfWeek';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

import {createClient} from '@/lib/supabase/server';

describe('slotTemplateRepository', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(() => mockSupabase),
      select: vi.fn(() => mockSupabase),
      insert: vi.fn(() => mockSupabase),
      update: vi.fn(() => mockSupabase),
      delete: vi.fn(() => mockSupabase),
      in: vi.fn(() => mockSupabase),
      eq: vi.fn(() => mockSupabase),
      single: vi.fn(() => mockSupabase),
      order: vi.fn(() => mockSupabase)
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('getAllSlotTemplates', () => {
    it('should fetch and return all slot templates', async () => {
      const mockData = [{id: 't-1', location: CLUB_LOCATION.ALPHA, day_of_week: DAY_OF_WEEK.MONDAY}];
      mockSupabase.order.mockReturnValue({
        ...mockSupabase,
        then: (resolve: (value: unknown) => void) => resolve({data: mockData, error: null})
      });

      const result = await getAllSlotTemplates();

      expect(mockSupabase.from).toHaveBeenCalledWith('slot_templates');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.order).toHaveBeenCalledWith('day_of_week', {ascending: true});
      expect(mockSupabase.order).toHaveBeenCalledWith('start_time_local', {ascending: true});
      expect(result).toEqual(mockData);
    });

    it('should throw raw error if fetch fails', async () => {
      const dbError = new Error('Fetch Error');
      mockSupabase.order.mockReturnValue({
        ...mockSupabase,
        then: (resolve: (value: unknown) => void) => resolve({data: null, error: dbError})
      });

      await expect(getAllSlotTemplates()).rejects.toThrow('Fetch Error');
    });
  });

  describe('insertSlotTemplate', () => {
    it('should insert template successfully', async () => {
      mockSupabase.insert.mockResolvedValue({error: null});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const templateData: any = {location: CLUB_LOCATION.ALPHA};

      await expect(insertSlotTemplate(templateData)).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith('slot_templates');
      expect(mockSupabase.insert).toHaveBeenCalledWith(templateData);
    });

    it('should throw raw error if insert fails', async () => {
      const dbError = new Error('Insert Error');
      mockSupabase.insert.mockResolvedValue({error: dbError});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const templateData: any = {location: CLUB_LOCATION.ALPHA};

      await expect(insertSlotTemplate(templateData)).rejects.toThrow('Insert Error');
    });
  });

  describe('updateSlotTemplate', () => {
    it('should update template successfully', async () => {
      mockSupabase.eq.mockResolvedValue({error: null});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const templateData: any = {location: CLUB_LOCATION.ALPHA};

      await expect(updateSlotTemplate('id-1', templateData)).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith('slot_templates');
      expect(mockSupabase.update).toHaveBeenCalledWith(templateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'id-1');
    });

    it('should throw raw error if update fails', async () => {
      const dbError = new Error('Update Error');
      mockSupabase.eq.mockResolvedValue({error: dbError});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(updateSlotTemplate('id-1', {} as any)).rejects.toThrow('Update Error');
    });
  });

  describe('toggleSlotTemplateActive', () => {
    it('should toggle state to true if currently false', async () => {
      mockSupabase.single.mockResolvedValue({data: {is_active: false}, error: null});
      mockSupabase.eq.mockReturnValue({
        single: mockSupabase.single,
        then: (resolve: (value: unknown) => void) => resolve({error: null})
      });

      const result = await toggleSlotTemplateActive('id-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('slot_templates');
      expect(mockSupabase.select).toHaveBeenCalledWith('is_active');
      expect(mockSupabase.update).toHaveBeenCalledWith({is_active: true});
      expect(result).toBe(true);
    });

    it('should toggle state to false if currently true', async () => {
      mockSupabase.single.mockResolvedValue({data: {is_active: true}, error: null});
      mockSupabase.eq.mockReturnValue({
        single: mockSupabase.single,
        then: (resolve: (value: unknown) => void) => resolve({error: null})
      });

      const result = await toggleSlotTemplateActive('id-1');

      expect(mockSupabase.update).toHaveBeenCalledWith({is_active: false});
      expect(result).toBe(false);
    });

    it('should throw raw error if fetching current state fails', async () => {
      const dbError = new Error('Fetch Error');
      mockSupabase.single.mockResolvedValue({data: null, error: dbError});
      mockSupabase.eq.mockReturnValue({
        single: mockSupabase.single,
        then: (resolve: (value: unknown) => void) => resolve({error: null})
      });

      await expect(toggleSlotTemplateActive('id-1')).rejects.toThrow('Fetch Error');
    });

    it('should throw raw error if update fails', async () => {
      mockSupabase.single.mockResolvedValue({data: {is_active: false}, error: null});
      const dbError = new Error('Update Error');
      mockSupabase.eq.mockReturnValue({
        single: mockSupabase.single,
        then: (resolve: (value: unknown) => void) => resolve({error: dbError})
      });

      await expect(toggleSlotTemplateActive('id-1')).rejects.toThrow('Update Error');
    });
  });

  describe('deleteSlotTemplate', () => {
    it('should delete template successfully', async () => {
      mockSupabase.eq.mockResolvedValue({error: null});

      await expect(deleteSlotTemplate('id-1')).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith('slot_templates');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'id-1');
    });

    it('should throw raw error if delete fails', async () => {
      const dbError = new Error('Delete Error');
      mockSupabase.eq.mockResolvedValue({error: dbError});

      await expect(deleteSlotTemplate('id-1')).rejects.toThrow('Delete Error');
    });
  });

  describe('getMaterializedDatesForTemplates', () => {
    it('should fetch and return materialized dates', async () => {
      const mockData = [{slot_template_id: 't-1', start_time: '2026-07-27T10:00:00Z'}];
      mockSupabase.in.mockResolvedValue({data: mockData, error: null});

      const result = await getMaterializedDatesForTemplates(['t-1']);

      expect(mockSupabase.from).toHaveBeenCalledWith('slots');
      expect(mockSupabase.select).toHaveBeenCalledWith('slot_template_id, start_time');
      expect(mockSupabase.in).toHaveBeenCalledWith('slot_template_id', ['t-1']);
      expect(result).toEqual(mockData);
    });

    it('should return empty array if templateIds is empty', async () => {
      const result = await getMaterializedDatesForTemplates([]);
      expect(result).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array if data is null', async () => {
      mockSupabase.in.mockResolvedValue({data: null, error: null});
      const result = await getMaterializedDatesForTemplates(['t-1']);
      expect(result).toEqual([]);
    });

    it('should throw raw error if fetch fails', async () => {
      const dbError = new Error('Fetch Error');
      mockSupabase.in.mockResolvedValue({data: null, error: dbError});

      await expect(getMaterializedDatesForTemplates(['t-1'])).rejects.toThrow('Fetch Error');
    });
  });
});
