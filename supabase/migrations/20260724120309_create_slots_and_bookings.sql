-- 1. Enums -------------------------------------------------------------
CREATE TYPE public.club_location AS ENUM ('alpha', 'top_gun');
CREATE TYPE public.slot_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'cancelled');

-- 2. Workout types (catalog) --------------------------------------------
CREATE TABLE public.workout_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60 NOT NULL,
  default_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.workout_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workout types are viewable by everyone"
  ON public.workout_types FOR SELECT USING (true);

CREATE POLICY "Only admins can modify workout types"
  ON public.workout_types FOR ALL USING (public.is_admin());

-- 3. Slots (one-off instances only — no slot_templates yet) -------------
CREATE TABLE public.slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_type_id UUID REFERENCES public.workout_types(id) ON DELETE CASCADE NOT NULL,
  location club_location NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_capacity INTEGER DEFAULT 1 NOT NULL CHECK (max_capacity >= 1),
  price NUMERIC(10, 2) NOT NULL,
  status slot_status DEFAULT 'scheduled'::slot_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_slots_start_time ON public.slots(start_time);

ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slots are viewable by everyone"
  ON public.slots FOR SELECT USING (true);

CREATE POLICY "Only admins can manage slots"
  ON public.slots FOR ALL USING (public.is_admin());

-- 4. Bookings -------------------------------------------------------------
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES public.slots(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'confirmed'::booking_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(slot_id, client_id)
);

CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_slot_id ON public.bookings(slot_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own bookings; admins view all"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id OR public.is_admin());

CREATE POLICY "Clients can create bookings for themselves"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- No UPDATE/cancellation policy yet — deliberately deferred to the
-- cancellation ticket.

-- 5. Atomic capacity check (closes the booking race condition) -----------
CREATE OR REPLACE FUNCTION public.check_slot_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_max INTEGER;
  v_current INTEGER;
BEGIN
  PERFORM 1 FROM public.slots WHERE id = NEW.slot_id FOR UPDATE;

  SELECT max_capacity INTO v_max FROM public.slots WHERE id = NEW.slot_id;
  SELECT COUNT(*) INTO v_current FROM public.bookings
    WHERE slot_id = NEW.slot_id AND status = 'confirmed';

  IF v_current >= v_max THEN
    RAISE EXCEPTION 'SLOT_FULL' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER before_booking_insert_check_capacity
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_slot_capacity();
