import {describe, it, expect} from 'vitest';

import {CLUB_LOCATION} from '@/constants/locations';

import {createSlotSchema} from './slots';

describe('createSlotSchema', () => {
  const validData = {
    workout_type_id: '123e4567-e89b-12d3-a456-426614174000',
    location: CLUB_LOCATION.ALPHA,
    start_time: '2026-07-29T15:00:00.000Z',
    end_time: '2026-07-29T16:00:00.000Z',
    max_capacity: 5,
    price: 300
  };

  it('accepts valid slot data', () => {
    const result = createSlotSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects end_time before or equal to start_time', () => {
    const invalidData = {
      ...validData,
      end_time: '2026-07-29T14:00:00.000Z' // Before start
    };
    const result = createSlotSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('end_time');
      expect(result.error.issues[0].message).toBe('End time must be after start time');
    }

    const equalData = {
      ...validData,
      end_time: validData.start_time
    };
    const equalResult = createSlotSchema.safeParse(equalData);
    expect(equalResult.success).toBe(false);
  });

  it('rejects max_capacity less than 1', () => {
    const invalidData = {...validData, max_capacity: 0};
    const result = createSlotSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
