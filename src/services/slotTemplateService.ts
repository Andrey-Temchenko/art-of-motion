import {toKyivTime} from '@/lib/utils/timezone';
import {computeUpcomingOccurrences} from '@/lib/utils/templateOccurrences';
import {getRepositories} from '@/repositories';
import {CreateSlotTemplateData, UpdateSlotTemplateData} from '@/repositories/types';
import {ProcessedSlotTemplate, ProcessedUpcomingOccurrence, DomainError} from './types';
import {ClubLocationType} from '@/constants/locations';
import {DayOfWeekType} from '@/constants/dayOfWeek';

type SlotTemplateInput = {
  workout_type_id: string;
  location: string;
  day_of_week: number;
  start_time_local: string;
  duration_minutes: number;
  max_capacity: number;
  price: number;
  cancellation_deadline_hours: number;
  recurrence_start_date: string;
  recurrence_end_date: string | null;
};

export async function getAllSlotTemplates(repos = getRepositories()): Promise<ProcessedSlotTemplate[]> {
  try {
    const raw = await repos.slotTemplate.getAllSlotTemplates();

    return raw.map(t => {
      const wt = Array.isArray(t.workout_type) ? t.workout_type[0] : t.workout_type;

      return {
        id: t.id,
        workout_type_id: t.workout_type_id,
        workout_title_key: wt?.title || '',
        location: t.location,
        day_of_week: t.day_of_week,
        start_time_local: t.start_time_local,
        duration_minutes: t.duration_minutes,
        max_capacity: t.max_capacity,
        price: t.price,
        cancellation_deadline_hours: t.cancellation_deadline_hours,
        is_active: t.is_active,
        recurrence_start_date: t.recurrence_start_date,
        recurrence_end_date: t.recurrence_end_date
      };
    });
  } catch {
    throw new Error('Failed to load slot templates');
  }
}

export async function createSlotTemplate(data: SlotTemplateInput, repos = getRepositories()): Promise<void> {
  try {
    const insertData: CreateSlotTemplateData = {
      workout_type_id: data.workout_type_id,
      location: data.location as ClubLocationType,
      day_of_week: data.day_of_week as DayOfWeekType,
      start_time_local: data.start_time_local,
      duration_minutes: data.duration_minutes,
      max_capacity: data.max_capacity,
      price: data.price,
      cancellation_deadline_hours: data.cancellation_deadline_hours,
      is_active: true,
      recurrence_start_date: data.recurrence_start_date,
      recurrence_end_date: data.recurrence_end_date
    };

    await repos.slotTemplate.insertSlotTemplate(insertData);
  } catch {
    throw new DomainError('DB_ERROR', 'Database error occurred while creating template.');
  }
}

export async function updateSlotTemplate(
  id: string,
  data: SlotTemplateInput,
  repos = getRepositories()
): Promise<void> {
  try {
    const updateData: UpdateSlotTemplateData = {
      workout_type_id: data.workout_type_id,
      location: data.location as ClubLocationType,
      day_of_week: data.day_of_week as DayOfWeekType,
      start_time_local: data.start_time_local,
      duration_minutes: data.duration_minutes,
      max_capacity: data.max_capacity,
      price: data.price,
      cancellation_deadline_hours: data.cancellation_deadline_hours,
      recurrence_start_date: data.recurrence_start_date,
      recurrence_end_date: data.recurrence_end_date
    };

    await repos.slotTemplate.updateSlotTemplate(id, updateData);
  } catch {
    throw new DomainError('DB_ERROR', 'Database error occurred while updating template.');
  }
}

export async function toggleSlotTemplateActive(id: string, repos = getRepositories()): Promise<boolean> {
  try {
    return await repos.slotTemplate.toggleSlotTemplateActive(id);
  } catch {
    throw new DomainError('DB_ERROR', 'Database error occurred while toggling template state.');
  }
}

export async function deleteSlotTemplate(id: string, repos = getRepositories()): Promise<void> {
  try {
    await repos.slotTemplate.deleteSlotTemplate(id);
  } catch {
    throw new DomainError('DB_ERROR', 'Database error occurred while deleting template.');
  }
}

export async function getUpcomingOccurrences(
  weeksAhead: number = 6,
  repos = getRepositories()
): Promise<ProcessedUpcomingOccurrence[]> {
  try {
    // Fetch all active templates
    const allTemplates = await repos.slotTemplate.getAllSlotTemplates();
    const activeTemplates = allTemplates.filter(t => t.is_active);

    if (activeTemplates.length === 0) return [];

    // Fetch materialized dates for all active templates
    const templateIds = activeTemplates.map(t => t.id);
    const materializedRows = await repos.slotTemplate.getMaterializedDatesForTemplates(templateIds);

    // Group materialized dates by template ID, converting to Kyiv local date strings
    const materializedByTemplate = new Map<string, Set<string>>();
    for (const row of materializedRows) {
      const kyivDate = toKyivTime(row.start_time);
      const year = kyivDate.getFullYear();
      const month = String(kyivDate.getMonth() + 1).padStart(2, '0');
      const day = String(kyivDate.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;

      let dateSet = materializedByTemplate.get(row.slot_template_id);
      if (!dateSet) {
        dateSet = new Set<string>();
        materializedByTemplate.set(row.slot_template_id, dateSet);
      }
      dateSet.add(localDateStr);
    }

    // Compute occurrences for each active template
    const allOccurrences: ProcessedUpcomingOccurrence[] = [];

    for (const template of activeTemplates) {
      const materializedDates = materializedByTemplate.get(template.id) ?? new Set<string>();
      const wt = Array.isArray(template.workout_type) ? template.workout_type[0] : template.workout_type;

      const occurrences = computeUpcomingOccurrences(
        {
          id: template.id,
          day_of_week: template.day_of_week,
          start_time_local: template.start_time_local,
          duration_minutes: template.duration_minutes,
          recurrence_start_date: template.recurrence_start_date,
          recurrence_end_date: template.recurrence_end_date
        },
        materializedDates,
        weeksAhead
      );

      for (const occ of occurrences) {
        allOccurrences.push({
          templateId: occ.templateId,
          occurrenceDate: occ.occurrenceDate,
          startUtc: occ.startUtc.toISOString(),
          endUtc: occ.endUtc.toISOString(),
          workout_type_id: template.workout_type_id,
          workout_title_key: wt?.title || '',
          location: template.location,
          max_capacity: template.max_capacity,
          price: template.price,
          duration_minutes: template.duration_minutes,
          cancellation_deadline_hours: template.cancellation_deadline_hours,
          start_time_local: template.start_time_local
        });
      }
    }

    // Sort by date ascending
    allOccurrences.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate));

    return allOccurrences;
  } catch {
    throw new Error('Failed to compute upcoming occurrences');
  }
}
