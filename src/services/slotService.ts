import {fromKyivTime} from '@/lib/utils/timezone';
import {Constants} from '@/types/database.types';
import {ProcessedAdminSlot, ProcessedAdminSlotDetails, DomainError} from './types';
import {getRepositories} from '@/repositories';
import {CreateSlotData} from '@/repositories/types';

type CreateSlotInput = {
  workout_type_id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
};

export async function createSlot(validData: CreateSlotInput, repos = getRepositories()): Promise<void> {
  const utcStartTime = fromKyivTime(validData.start_time).toISOString();
  const utcEndTime = fromKyivTime(validData.end_time).toISOString();

  const [STATUS_SCHEDULED] = Constants.public.Enums.slot_status;

  try {
    const overlappingSlots = await repos.slot.findOverlappingSlots(utcStartTime, utcEndTime);
    const isOverlapping = overlappingSlots && overlappingSlots.length > 0;
    if (isOverlapping) {
      throw new DomainError('OVERLAP', 'Trainer is already booked at this time!');
    }
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError('DB_ERROR', 'Error checking time availability.');
  }

  try {
    await repos.slot.insertSlot({
      workout_type_id: validData.workout_type_id,
      location: validData.location as CreateSlotData['location'],
      start_time: utcStartTime,
      end_time: utcEndTime,
      max_capacity: validData.max_capacity,
      price: validData.price,
      status: STATUS_SCHEDULED
    });
  } catch {
    throw new DomainError('DB_ERROR', 'Database error occurred while creating slot.');
  }
}

export async function getAdminSlots(repos = getRepositories()): Promise<ProcessedAdminSlot[]> {
  try {
    const rawSlots = await repos.slot.getAdminSlotsList();
    return rawSlots.map(slot => {
      const wt = Array.isArray(slot.workout_type) ? slot.workout_type[0] : slot.workout_type;

      return {
        id: slot.id,
        location: slot.location,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_capacity: slot.max_capacity,
        price: slot.price,
        status: slot.status,
        workout_title_key: wt?.title || '',
        bookings_count: slot.bookings?.filter(b => b.status === Constants.public.Enums.booking_status[0]).length || 0
      };
    });
  } catch {
    throw new Error('Failed to load slots');
  }
}

export async function getSlotDetails(
  slotId: string,
  repos = getRepositories()
): Promise<ProcessedAdminSlotDetails | null> {
  try {
    const rawSlot = await repos.slot.getAdminSlotDetails(slotId);
    if (!rawSlot) return null;

    const wt = Array.isArray(rawSlot.workout_type) ? rawSlot.workout_type[0] : rawSlot.workout_type;

    return {
      id: rawSlot.id,
      location: rawSlot.location,
      start_time: rawSlot.start_time,
      end_time: rawSlot.end_time,
      max_capacity: rawSlot.max_capacity,
      price: rawSlot.price,
      status: rawSlot.status,
      workout_title_key: wt?.title || '',
      bookings: (rawSlot.bookings || []).map(b => {
        const profile = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
        return {
          id: b.id,
          status: b.status,
          createdAt: b.created_at,
          clientName: profile?.full_name || null,
          clientEmail: profile?.email || null
        };
      })
    };
  } catch {
    throw new Error('Failed to load slot details');
  }
}
