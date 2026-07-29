import {z} from 'zod';

// Relaxed regex because test DB uses non-RFC compliant UUIDs like 'aaaa0000-...'
export const uuidSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
