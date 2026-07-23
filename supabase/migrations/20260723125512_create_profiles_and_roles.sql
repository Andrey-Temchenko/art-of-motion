-- ==============================================================================
-- Migration: init_auth_profiles
-- Scope: Auth & Profiles only (roles, RLS, triggers). No workout_types /
-- slots / slot_templates / bookings in this migration - those come later.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Enums
-- ------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('client', 'admin');

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Extends auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'client'::user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Row Level Security
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper: is the executing user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp;

--- PROFILES POLICIES ---
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- NOTE: this USING/WITH CHECK pair only restricts *which row* can be
-- touched (your own), not *which columns* change. Column-level protection
-- for `role` and `email` is enforced separately by the triggers below -
-- do not remove those triggers and assume this policy alone is enough.
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4. Triggers
-- ------------------------------------------------------------------------------

-- 4.1. Auto-create a profile row on signup, seeded with the auth email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Client'),
    new.raw_user_meta_data->>'avatar_url',
    'client'::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.2. Keep profiles.updated_at honest
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.3. Close the privilege-escalation gap: only an admin may change
-- someone's role. The RLS policy above cannot do column-level
-- restriction on its own - this trigger is the actual enforcement.
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER before_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

-- 4.4. Prevent clients from editing `email` directly through the
-- profiles UPDATE policy - it must stay in sync with auth.users.email,
-- not become a free-text field a client can overwrite. Admins exempt,
-- same pattern as the role-escalation guard above.
CREATE OR REPLACE FUNCTION public.prevent_email_self_edit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Email is managed by auth and cannot be edited directly';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER before_profile_email_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_email_self_edit();

-- 4.5. Sync profiles.email whenever a user changes their email via
-- Supabase Auth (e.g. after confirming a new email address), so
-- profiles.email never silently drifts from auth.users.email.
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.sync_profile_email();