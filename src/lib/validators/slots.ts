import {z} from 'zod';
import {CLUB_LOCATION_VALUES} from '@/constants/locations';

export const createSlotSchema = z
  .object({
    workout_type_id: z.string().uuid({message: 'Invalid workout type'}),
    location: z.enum(CLUB_LOCATION_VALUES),
    start_time: z.string().refine(v => !isNaN(Date.parse(v)), {message: 'Invalid start time'}),
    end_time: z.string().refine(v => !isNaN(Date.parse(v)), {message: 'Invalid end time'}),
    max_capacity: z.number().int().min(1, {message: 'Capacity must be at least 1'}),
    price: z.number().min(0, {message: 'Price cannot be negative'})
  })
  .refine(
    data => {
      const start = new Date(data.start_time).getTime();
      const end = new Date(data.end_time).getTime();
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['end_time']
    }
  );

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
