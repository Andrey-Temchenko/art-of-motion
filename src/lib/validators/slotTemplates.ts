import {z} from 'zod';
import {CLUB_LOCATION_VALUES} from '@/constants/locations';
import {DAY_OF_WEEK_VALUES} from '@/constants/dayOfWeek';

export const slotTemplateSchema = z
  .object({
    workout_type_id: z.uuid({message: 'Invalid workout type'}),
    location: z.enum(CLUB_LOCATION_VALUES),
    day_of_week: z
      .number()
      .int()
      .refine(v => DAY_OF_WEEK_VALUES.includes(v as (typeof DAY_OF_WEEK_VALUES)[number]), {
        message: 'Invalid day of week'
      }),
    start_time_local: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, {message: 'Time must be in HH:mm or HH:mm:ss format'}),
    duration_minutes: z.number().int().min(1, {message: 'Duration must be at least 1 minute'}),
    max_capacity: z.number().int().min(1, {message: 'Capacity must be at least 1'}),
    price: z.number().min(0, {message: 'Price cannot be negative'}),
    cancellation_deadline_hours: z.number().int().min(0, {message: 'Deadline cannot be negative'}),
    recurrence_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Date must be in YYYY-MM-DD format'}),
    recurrence_end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {message: 'Date must be in YYYY-MM-DD format'})
      .nullable()
  })
  .refine(
    data => {
      if (data.recurrence_end_date === null) return true;
      return data.recurrence_end_date >= data.recurrence_start_date;
    },
    {
      message: 'End date must be on or after start date',
      path: ['recurrence_end_date']
    }
  );

export type SlotTemplateInput = z.infer<typeof slotTemplateSchema>;
