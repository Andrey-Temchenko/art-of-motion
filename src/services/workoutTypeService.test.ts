import {describe, it, expect, vi, beforeEach} from 'vitest';

import {getWorkoutTypes} from './workoutTypeService';

describe('workoutTypeService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepos: any;

  beforeEach(() => {
    mockRepos = {
      workoutType: {
        getAllWorkoutTypes: vi.fn()
      }
    };
  });

  describe('getWorkoutTypes', () => {
    it('should return workout types from repo', async () => {
      const mockTypes = [{id: 'wt-1', title: 'Boxing'}];
      mockRepos.workoutType.getAllWorkoutTypes.mockResolvedValue(mockTypes);

      const result = await getWorkoutTypes(mockRepos);
      expect(result).toEqual(mockTypes);
      expect(mockRepos.workoutType.getAllWorkoutTypes).toHaveBeenCalled();
    });

    it('should throw Error if repo fails', async () => {
      mockRepos.workoutType.getAllWorkoutTypes.mockRejectedValue(new Error('DB Error'));

      await expect(getWorkoutTypes(mockRepos)).rejects.toThrow('Failed to get workout types: DB Error');
    });
  });
});
