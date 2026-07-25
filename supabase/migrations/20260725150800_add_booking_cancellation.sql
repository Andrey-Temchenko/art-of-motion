-- 1. Cancellation deadline on the slot (default 24h as per PRD ArtOfMotion-v2.md,
--    but adding it to the existing slots table)
ALTER TABLE public.slots
  ADD COLUMN cancellation_deadline_hours INTEGER DEFAULT 24 NOT NULL;

-- 2. UPDATE policy on bookings - it doesn't exist yet, so clients
--    cannot physically cancel a booking. Allow clients to change the status
--    of their confirmed booking, only while the slot is not past the deadline;
--    admins have no restrictions.
CREATE POLICY "Clients can cancel within policy; Admins can modify any"
  ON public.bookings FOR UPDATE
  USING (
    public.is_admin()
    OR (
      auth.uid() = client_id
      AND status = 'confirmed'
      AND EXISTS (
        SELECT 1 FROM public.slots s
        WHERE s.id = bookings.slot_id
          AND s.start_time > NOW() + (s.cancellation_deadline_hours || ' hours')::INTERVAL
      )
    )
  )
  WITH CHECK (
    public.is_admin() OR auth.uid() = client_id
  );

-- 3. Defense-in-depth: the WITH CHECK above does not restrict WHICH columns change
--    (same issue as with profiles.role in ArtOfMotion-v2.md, pt.2 changelog).
--    A client could technically try to spoof slot_id or set status back to
--    'confirmed' via UPDATE. This trigger prevents it:
CREATE OR REPLACE FUNCTION public.enforce_booking_cancellation_only()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.slot_id IS DISTINCT FROM OLD.slot_id
       OR NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.status IS DISTINCT FROM 'cancelled'::booking_status THEN
      RAISE EXCEPTION 'CANCELLATION_NOT_ALLOWED' USING ERRCODE = 'P0002';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER before_booking_update_enforce_client_scope
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_cancellation_only();
