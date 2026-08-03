import {fromKyivTime} from '@/lib/utils/timezone';
import {SLOT_STATUS} from '@/constants/slotStatus';
import {BOOKING_STATUS} from '@/constants/bookingStatus';
import {ClubLocationType} from '@/constants/locations';
import {ProcessedAdminSlot, ProcessedAdminSlotDetails, DomainError, UpdateSlotInput} from './types';
import {getRepositories} from '@/repositories';
import {CreateSlotData, UpdateSlotData} from '@/repositories/types';

interface CreateSlotInput {
  workout_type_id: string;
  location: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  price: number;
  cancellation_deadline_hours?: number;
  slot_template_id?: string;
}

export async function createSlot(validData: CreateSlotInput, repos = getRepositories()): Promise<void> {
  const utcStartTime = fromKyivTime(validData.start_time).toISOString();
  const utcEndTime = fromKyivTime(validData.end_time).toISOString();

  const STATUS_SCHEDULED = SLOT_STATUS.SCHEDULED;

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
      status: STATUS_SCHEDULED,
      cancellation_deadline_hours: validData.cancellation_deadline_hours,
      slot_template_id: validData.slot_template_id
    });
  } catch (error) {
    // Handle DB exclusion_violation from the EXCLUDE constraint (code 23P01)
    if (error && typeof error === 'object' && 'code' in error && (error as {code: string}).code === '23P01') {
      throw new DomainError('OVERLAP', 'Trainer is already booked at this time!');
    }
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
        bookings_count: slot.bookings?.filter(b => b.status === BOOKING_STATUS.CONFIRMED).length || 0
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
      workout_type_id: rawSlot.workout_type_id,
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

export async function cancelAdminSlot(slotId: string, repos = getRepositories()): Promise<void> {
  try {
    const slot = await repos.slot.getAdminSlotDetails(slotId);
    if (!slot) throw new DomainError('NOT_FOUND', 'Slot not found');

    await repos.slot.updateSlotStatus(slotId, SLOT_STATUS.CANCELLED);
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError('DB_ERROR', 'Database error occurred while cancelling slot.');
  }
}

export async function updateAdminSlot(
  slotId: string,
  updates: UpdateSlotInput,
  repos = getRepositories()
): Promise<void> {
  try {
    const slot = await repos.slot.getAdminSlotDetails(slotId);
    if (!slot) throw new DomainError('NOT_FOUND', 'Slot not found');

    const confirmedCount = (slot.bookings || []).filter(b => b.status === BOOKING_STATUS.CONFIRMED).length;

    // Defense-in-depth: the DB trigger `check_slot_capacity_update` also enforces
    // this constraint (ERRCODE P0004) to guard against race conditions where two
    // concurrent requests pass this app-level check. Do NOT remove this check
    // thinking it's redundant with the trigger - the trigger is the safety net,
    // this check provides a clean user-facing error without a DB round-trip.
    if (updates.max_capacity !== undefined && updates.max_capacity < confirmedCount) {
      throw new DomainError('CAPACITY_ERROR', 'Cannot decrease capacity below current confirmed bookings.');
    }

    let utcStartTime = slot.start_time;
    let utcEndTime = slot.end_time;

    if (updates.start_time || updates.end_time) {
      utcStartTime = updates.start_time ? fromKyivTime(updates.start_time).toISOString() : slot.start_time;
      utcEndTime = updates.end_time ? fromKyivTime(updates.end_time).toISOString() : slot.end_time;

      const overlappingSlots = await repos.slot.findOverlappingSlots(utcStartTime, utcEndTime, slotId);
      if (overlappingSlots && overlappingSlots.length > 0) {
        throw new DomainError('OVERLAP', 'Trainer is already booked at this time!');
      }
    }

    const dbUpdates: UpdateSlotData = {
      workout_type_id: updates.workout_type_id,
      location: updates.location as ClubLocationType | undefined,
      start_time: updates.start_time ? utcStartTime : undefined,
      end_time: updates.end_time ? utcEndTime : undefined,
      max_capacity: updates.max_capacity,
      price: updates.price
    };

    // Clean up undefined values so Supabase doesn't overwrite columns with null
    const cleanedUpdates = Object.fromEntries(
      Object.entries(dbUpdates).filter(([, v]) => v !== undefined)
    ) as UpdateSlotData;

    await repos.slot.updateSlot(slotId, cleanedUpdates);
  } catch (error) {
    if (error instanceof DomainError) throw error;

    if (error && typeof error === 'object' && 'code' in error && (error as {code: string}).code === 'P0004') {
      throw new DomainError('CAPACITY_ERROR', 'Cannot decrease capacity below current confirmed bookings.');
    }
    throw new DomainError('DB_ERROR', 'Database error occurred while updating slot.');
  }
}
