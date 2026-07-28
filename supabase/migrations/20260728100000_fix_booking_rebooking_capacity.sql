-- ==============================================================================
-- Migration: fix_booking_rebooking_capacity
-- Scope: allow a client to re-book a slot they previously cancelled, without
-- violating the UNIQUE(slot_id, client_id) constraint on bookings, and
-- without reopening the overbooking race that check_slot_capacity() closed
-- for the INSERT path.
--
-- Bug being fixed:
--   1. Client books a slot -> bookings row (slot_id, client_id, 'confirmed').
--   2. Client cancels -> UPDATE ... SET status = 'cancelled' (row stays).
--   3. Client tries to book the same slot again -> app does INSERT -> hits
--      UNIQUE(slot_id, client_id) -> 23505, silently swallowed / confusing
--      error, no feedback shown to the user.
--
-- Root cause: cancellation is modeled as an UPDATE (status flag), not a
-- DELETE, so the row already exists when the client tries to rebook.
--
-- Fix approach: treat "rebooking" as a legitimate UPDATE transition
-- (cancelled -> confirmed) on the client's own row, gated by:
--   (a) RLS: the client must be allowed to select/target their own
--       cancelled row for UPDATE in the first place.
--   (b) The status-transition trigger: must allow this specific reverse
--       transition (previously only confirmed -> cancelled was legal for
--       non-admins).
--   (c) Capacity: since this transition re-activates a "confirmed" booking,
--       it is functionally equivalent to a fresh INSERT for capacity
--       purposes, so it must go through the same atomic
--       SELECT ... FOR UPDATE row-lock check that check_slot_capacity()
--       does on INSERT. Skipping this would silently reopen the exact
--       overbooking race condition that trigger was built to close.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. RLS: extend the UPDATE policy to also cover the "rebook" case.
--    (Original policy from 20260725150800_add_booking_cancellation.sql only
--    matched status = 'confirmed', so a cancelled row was invisible to
--    UPDATE for a non-admin client.)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Clients can cancel within policy; Admins can modify any" ON public.bookings;

CREATE POLICY "Clients can cancel or rebook; Admins can modify any"
  ON public.bookings FOR UPDATE
  USING (
    public.is_admin()
    OR (
      auth.uid() = client_id
      AND (
        -- Cancelling: unchanged from the original policy.
        (
          status = 'confirmed'
          AND EXISTS (
            SELECT 1 FROM public.slots s
            WHERE s.id = bookings.slot_id
              AND s.start_time > NOW() + (s.cancellation_deadline_hours || ' hours')::INTERVAL
          )
        )
        OR
        -- Rebooking: the client's own previously-cancelled row, as long as
        -- the slot itself is still live and in the future. No
        -- cancellation_deadline_hours check here on purpose — that column
        -- governs how late you may cancel, not whether you may rebook.
        (
          status = 'cancelled'
          AND EXISTS (
            SELECT 1 FROM public.slots s
            WHERE s.id = bookings.slot_id
              AND s.status = 'scheduled'::slot_status
              AND s.start_time > NOW()
          )
        )
      )
    )
  )
  WITH CHECK (
    public.is_admin() OR auth.uid() = client_id
  );

-- ------------------------------------------------------------------------------
-- 2. Defense-in-depth trigger: allow the reverse transition, and enforce
--    capacity atomically on that path. Replaces
--    enforce_booking_cancellation_only from 20260725150800 in place (same
--    trigger, same name — extended, not duplicated).
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_booking_cancellation_only()
RETURNS TRIGGER AS $$
DECLARE
  v_max INTEGER;
  v_current INTEGER;
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Never allow a non-admin to repoint a booking at a different slot or
  -- client, regardless of which status transition is being attempted.
  IF NEW.slot_id IS DISTINCT FROM OLD.slot_id
     OR NEW.client_id IS DISTINCT FROM OLD.client_id THEN
    RAISE EXCEPTION 'CANCELLATION_NOT_ALLOWED' USING ERRCODE = 'P0002';
  END IF;

  -- Only two transitions are legal for a non-admin: cancel, or rebook.
  IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    RETURN NEW; -- cancellation path, unchanged behavior

  ELSIF OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
    -- Rebooking path: this is the INSERT-equivalent for capacity purposes.
    -- Same row-lock pattern as check_slot_capacity() so concurrent
    -- rebook/insert attempts on this slot serialize correctly.
    PERFORM 1 FROM public.slots WHERE id = NEW.slot_id FOR UPDATE;

    SELECT max_capacity INTO v_max FROM public.slots WHERE id = NEW.slot_id;
    SELECT COUNT(*) INTO v_current FROM public.bookings
      WHERE slot_id = NEW.slot_id AND status = 'confirmed';

    IF v_current >= v_max THEN
      RAISE EXCEPTION 'SLOT_FULL' USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;

  ELSE
    RAISE EXCEPTION 'CANCELLATION_NOT_ALLOWED' USING ERRCODE = 'P0002';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger itself is unchanged (same name, same timing) — only the
-- function body changed via CREATE OR REPLACE above, so no need to
-- drop/recreate the trigger.
