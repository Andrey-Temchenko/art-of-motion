import {
  IAdminRepository,
  IBookingRepository,
  IProfileRepository,
  ISlotRepository,
  IWorkoutTypeRepository
} from './types';
import * as adminRepository from './adminRepository';
import * as bookingRepository from './bookingRepository';
import * as profileRepository from './profileRepository';
import * as slotRepository from './slotRepository';
import * as workoutTypeRepository from './workoutTypeRepository';

export interface RepositoryRegistry {
  admin: IAdminRepository;
  booking: IBookingRepository;
  profile: IProfileRepository;
  slot: ISlotRepository;
  workoutType: IWorkoutTypeRepository;
}

const supabaseRegistry: RepositoryRegistry = {
  admin: adminRepository,
  booking: bookingRepository,
  profile: profileRepository,
  slot: slotRepository,
  workoutType: workoutTypeRepository
};

export function getRepositories(): RepositoryRegistry {
  return supabaseRegistry;
}
