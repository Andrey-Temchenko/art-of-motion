import {fromKyivTime} from '@/lib/utils/timezone';
import {Constants} from '@/types/database.types';
import {ProcessedAdminSlot, DomainError} from './types';
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
    return await repos.slot.getAdminSlotsList();
  } catch {
    throw new Error('Failed to load slots');
  }
}
