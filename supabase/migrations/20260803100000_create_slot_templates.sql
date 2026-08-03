-- Migration: Create slot_templates table, add slot_template_id to slots, add overlap constraint
-- ============================================================================

-- 1. Templates table -----------------------------------------------------------
CREATE TABLE public.slot_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_type_id UUID REFERENCES public.workout_types(id) ON DELETE CASCADE NOT NULL,
  location club_location NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday (matches JS Date.getDay() and Postgres EXTRACT(DOW))
  start_time_local TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60 NOT NULL,
  max_capacity INTEGER DEFAULT 1 NOT NULL CHECK (max_capacity >= 1),
  price NUMERIC(10, 2) NOT NULL,
  cancellation_deadline_hours INTEGER DEFAULT 24 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  recurrence_start_date DATE NOT NULL,
  recurrence_end_date DATE, -- NULL = indefinite
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT valid_recurrence_range
    CHECK (recurrence_end_date IS NULL OR recurrence_end_date >= recurrence_start_date)
);

CREATE INDEX idx_slot_templates_active ON public.slot_templates(is_active) WHERE is_active = TRUE;

ALTER TABLE public.slot_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view or manage slot templates"
  ON public.slot_templates FOR ALL USING (public.is_admin());

-- 2. Link slots to source template ---------------------------------------------
ALTER TABLE public.slots
  ADD COLUMN slot_template_id UUID REFERENCES public.slot_templates(id) ON DELETE SET NULL;

CREATE INDEX idx_slots_template_id ON public.slots(slot_template_id) WHERE slot_template_id IS NOT NULL;

-- 3. Prevent overlapping slots -------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.slots
  ADD CONSTRAINT no_overlapping_active_slots
  EXCLUDE USING gist (
    tstzrange(start_time, end_time, '[)') WITH &&
  ) WHERE (status <> 'cancelled'::slot_status);
