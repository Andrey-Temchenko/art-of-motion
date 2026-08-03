'use server';

import {revalidatePath} from 'next/cache';

import {flattenError} from 'zod';

import {buildRevalidatePath, ROUTES} from '@/config/navigation';

import {USER_ROLE} from '@/constants/roles';

import {requireRole} from '@/lib/supabase/session';
import {uuidSchema} from '@/lib/validators/common';
import {slotTemplateSchema} from '@/lib/validators/slotTemplates';

import {
  createSlotTemplate,
  updateSlotTemplate,
  toggleSlotTemplateActive,
  deleteSlotTemplate
} from '@/services/slotTemplateService';
import {DomainError} from '@/services/types';

import type {ActionState} from './types';

export async function createSlotTemplateAction(input: unknown): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch {
    return {success: false, message: 'Unauthorized access'};
  }

  const validationResult = slotTemplateSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: flattenError(validationResult.error).fieldErrors
    };
  }

  try {
    await createSlotTemplate(validationResult.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return {success: false, message: error.message};
    }
    return {success: false, message: 'An unexpected error occurred.'};
  }

  revalidateTemplatePaths();

  return {success: true, message: 'Template created successfully!'};
}

export async function updateSlotTemplateAction(templateId: string, input: unknown): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch {
    return {success: false, message: 'Unauthorized access'};
  }

  if (!uuidSchema.safeParse(templateId).success) {
    return {success: false, message: 'Invalid template ID'};
  }

  const validationResult = slotTemplateSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: flattenError(validationResult.error).fieldErrors
    };
  }

  try {
    await updateSlotTemplate(templateId, validationResult.data);
  } catch (error) {
    if (error instanceof DomainError) {
      return {success: false, message: error.message};
    }
    return {success: false, message: 'An unexpected error occurred.'};
  }

  revalidateTemplatePaths();

  return {success: true, message: 'Template updated successfully!'};
}

export async function toggleSlotTemplateActiveAction(templateId: string): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch {
    return {success: false, message: 'Unauthorized access'};
  }

  if (!uuidSchema.safeParse(templateId).success) {
    return {success: false, message: 'Invalid template ID'};
  }

  try {
    const newState = await toggleSlotTemplateActive(templateId);
    revalidateTemplatePaths();
    return {success: true, message: newState ? 'Template activated' : 'Template deactivated'};
  } catch (error) {
    if (error instanceof DomainError) {
      return {success: false, message: error.message};
    }
    return {success: false, message: 'An unexpected error occurred.'};
  }
}

export async function deleteSlotTemplateAction(templateId: string): Promise<ActionState> {
  try {
    await requireRole([USER_ROLE.ADMIN]);
  } catch {
    return {success: false, message: 'Unauthorized access'};
  }

  if (!uuidSchema.safeParse(templateId).success) {
    return {success: false, message: 'Invalid template ID'};
  }

  try {
    await deleteSlotTemplate(templateId);
  } catch (error) {
    if (error instanceof DomainError) {
      return {success: false, message: error.message};
    }
    return {success: false, message: 'An unexpected error occurred.'};
  }

  revalidateTemplatePaths();

  return {success: true, message: 'Template deleted successfully!'};
}

// Helper methods

function revalidateTemplatePaths() {
  revalidatePath(buildRevalidatePath(ROUTES.ADMIN.TEMPLATES), 'page');
}
