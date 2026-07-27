import {getRepositories} from '@/repositories';
import {WorkoutType} from '@/repositories/types';

export async function getWorkoutTypes(repos = getRepositories()): Promise<WorkoutType[]> {
  try {
    return await repos.workoutType.getAllWorkoutTypes();
  } catch (error: unknown) {
    const err = error as Error;
    throw new Error(`Failed to get workout types: ${err.message}`);
  }
}
