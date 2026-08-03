import React from 'react';

import {CLUB_LOCATION_VALUES} from '@/constants/locations';
import {USER_ROLE} from '@/constants/roles';

import type {Locale} from '@/lib/i18n/config';
import {getDictionary} from '@/lib/i18n/getDictionary';
import {requireRole} from '@/lib/supabase/session';
import {getLocationLabel} from '@/lib/utils/locations';

import {getRepositories} from '@/repositories';

import {getAllSlotTemplates, getUpcomingOccurrences} from '@/services/slotTemplateService';

import {CreateTemplateDialog} from '@/components/admin/slot_templates/CreateTemplateDialog';
import {TemplatesTable} from '@/components/admin/slot_templates/TemplatesTable';
import {UpcomingOccurrences} from '@/components/admin/slot_templates/UpcomingOccurrences';

interface PageProps {
  params: Promise<{locale: Locale}>;
  searchParams: Promise<{weeks?: string}>;
}

export default async function SlotTemplatesPage({params, searchParams}: PageProps) {
  await requireRole([USER_ROLE.ADMIN]);

  const {locale} = await params;
  const {weeks} = await searchParams;

  const dictionary = await getDictionary(locale);
  const dict = dictionary.admin.slotTemplatesPage;

  const repos = getRepositories();
  const rawWorkoutTypes = await repos.workoutType.getAllWorkoutTypes();

  const workoutTypes = rawWorkoutTypes.map(w => ({
    id: w.id,
    title: (dictionary.workouts as Record<string, string>)[w.title] || w.title,
    duration_minutes: w.duration_minutes,
    default_price: w.default_price
  }));

  const locationOptions = CLUB_LOCATION_VALUES.map(loc => ({
    value: loc,
    label: getLocationLabel(dictionary, loc)
  }));

  const weeksAhead = weeks ? parseInt(weeks, 10) : 6;
  const currentWeeksAhead = isNaN(weeksAhead) ? 6 : weeksAhead;

  // Fetch data
  const [templates, occurrences] = await Promise.all([
    getAllSlotTemplates(repos),
    getUpcomingOccurrences(currentWeeksAhead, repos)
  ]);

  // Translate workout titles in templates and occurrences
  const localizedTemplates = templates.map(t => ({
    ...t,
    workout_title_key: (dictionary.workouts as Record<string, string>)[t.workout_title_key] || t.workout_title_key
  }));

  const localizedOccurrences = occurrences.map(o => ({
    ...o,
    workout_title_key: (dictionary.workouts as Record<string, string>)[o.workout_title_key] || o.workout_title_key
  }));

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 text-foreground font-bold tracking-tight">{dict.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{dict.subtitle}</p>
          </div>
          <CreateTemplateDialog workoutTypes={workoutTypes} locationOptions={locationOptions} />
        </div>
      </div>

      <div className="space-y-8">
        <TemplatesTable templates={localizedTemplates} workoutTypes={workoutTypes} locationOptions={locationOptions} />

        <div className="border-t pt-8">
          <UpcomingOccurrences
            occurrences={localizedOccurrences}
            workoutTypes={workoutTypes}
            locationOptions={locationOptions}
            currentWeeksAhead={currentWeeksAhead}
          />
        </div>
      </div>
    </div>
  );
}
