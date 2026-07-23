-- Migration to allow Supabase Dashboard (Table Editor) and service_role to bypass admin checks
-- This fixes the issue where even database administrators could not change user roles via UI

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow superuser, service_role, and supabase_admin to bypass the check
  -- This is required because auth.uid() is NULL when using the Table Editor
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
    RETURN TRUE;
  END IF;

  -- Standard check for authenticated users
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
