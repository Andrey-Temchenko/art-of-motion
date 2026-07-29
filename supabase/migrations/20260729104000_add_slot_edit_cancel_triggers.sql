-- Function to cascade slot cancellation to confirmed bookings
CREATE OR REPLACE FUNCTION public.cancel_slot_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.bookings
    SET status = 'cancelled'::booking_status
    WHERE slot_id = NEW.id AND status = 'confirmed'::booking_status;
    
    RETURN NEW;
END;
$$;

-- Trigger to execute cancel_slot_bookings when a slot is cancelled
-- NOTE: this UPDATE runs as SECURITY DEFINER, so current_user is the
-- function owner (typically postgres) while it executes. The
-- enforce_booking_cancellation_only trigger on bookings calls is_admin(),
-- whose first branch short-circuits to TRUE for
-- current_user IN ('postgres', 'service_role', 'supabase_admin')
-- (see 20260723142837_fix_admin_bypass_for_service_role.sql). That's why
-- this cascading UPDATE passes through cleanly instead of hitting P0002.
CREATE OR REPLACE TRIGGER on_slot_cancelled
    AFTER UPDATE OF status ON public.slots
    FOR EACH ROW
    WHEN (NEW.status = 'cancelled'::slot_status AND OLD.status IS DISTINCT FROM 'cancelled'::slot_status)
    EXECUTE FUNCTION public.cancel_slot_bookings();

-- Function to check capacity on slot update
CREATE OR REPLACE FUNCTION public.check_slot_capacity_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
    confirmed_count INTEGER;
BEGIN
    -- Only check if max_capacity is being decreased
    IF NEW.max_capacity < OLD.max_capacity THEN
        SELECT COUNT(*)
        INTO confirmed_count
        FROM public.bookings
        WHERE slot_id = NEW.id AND status = 'confirmed'::booking_status;

        IF NEW.max_capacity < confirmed_count THEN
            RAISE EXCEPTION 'Cannot decrease capacity below current confirmed bookings (%)', confirmed_count
                USING ERRCODE = 'P0004';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger to execute check_slot_capacity_update before slot update.
-- Deliberately a plain BEFORE UPDATE (not "OF max_capacity"): Postgres
-- only fires "UPDATE OF col" triggers when that column is present in the
-- SET list, even if its value is unchanged. If the app ever moves to a
-- diffed/partial UPDATE that omits max_capacity when it's untouched, an
-- "OF max_capacity" trigger would silently stop protecting this path.
-- The function itself already guards with NEW.max_capacity < OLD.max_capacity,
-- so a plain BEFORE UPDATE is both simpler and safer here.
CREATE OR REPLACE TRIGGER before_slot_update_check_capacity
    BEFORE UPDATE ON public.slots
    FOR EACH ROW
    EXECUTE FUNCTION public.check_slot_capacity_update();