import {createClient} from '@/lib/supabase/server';

import type {RawSlotTemplateData, CreateSlotTemplateData, UpdateSlotTemplateData} from './types';
import {allSlotTemplatesQuery} from './types';

// Uses standard client for DB operations (RLS enforced)

export async function getAllSlotTemplates(): Promise<RawSlotTemplateData[]> {
  const supabase = await createClient();
  const {data, error} = await allSlotTemplatesQuery(supabase)
    .order('day_of_week', {ascending: true})
    .order('start_time_local', {ascending: true});

  if (error) throw error;

  return data || [];
}

export async function insertSlotTemplate(templateData: CreateSlotTemplateData): Promise<void> {
  const supabase = await createClient();

  const {error} = await supabase.from('slot_templates').insert(templateData);

  if (error) throw error;
}

export async function updateSlotTemplate(id: string, templateData: UpdateSlotTemplateData): Promise<void> {
  const supabase = await createClient();

  const {error} = await supabase.from('slot_templates').update(templateData).eq('id', id);

  if (error) throw error;
}

export async function toggleSlotTemplateActive(id: string): Promise<boolean> {
  const supabase = await createClient();

  // First get current state
  const {data: current, error: fetchError} = await supabase
    .from('slot_templates')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const newState = !(current as {is_active: boolean}).is_active;

  const {error: updateError} = await supabase.from('slot_templates').update({is_active: newState}).eq('id', id);

  if (updateError) throw updateError;

  return newState;
}

export async function deleteSlotTemplate(id: string): Promise<void> {
  const supabase = await createClient();

  const {error} = await supabase.from('slot_templates').delete().eq('id', id);

  if (error) throw error;
}

export async function getMaterializedDatesForTemplates(
  templateIds: string[]
): Promise<{slot_template_id: string; start_time: string}[]> {
  if (templateIds.length === 0) return [];

  const supabase = await createClient();

  const {data, error} = await supabase
    .from('slots')
    .select('slot_template_id, start_time')
    .in('slot_template_id', templateIds);

  if (error) throw error;

  const results = data || [];
  return results.map(row => ({
    slot_template_id: row.slot_template_id as string,
    start_time: row.start_time
  }));
}
