CREATE OR REPLACE FUNCTION public.admin_client_overview()
RETURNS TABLE (
  client_id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  total_bookings BIGINT,
  sessions_attended BIGINT,
  upcoming_bookings BIGINT,
  cancelled_bookings BIGINT,
  last_booking_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.phone,
    COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS total_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'confirmed' AND s.start_time <= NOW()) AS sessions_attended,
    COUNT(b.id) FILTER (WHERE b.status = 'confirmed' AND s.start_time > NOW()) AS upcoming_bookings,
    COUNT(b.id) FILTER (WHERE b.status = 'cancelled') AS cancelled_bookings,
    MAX(b.created_at) AS last_booking_at
  FROM public.profiles p
  LEFT JOIN public.bookings b ON b.client_id = p.id
  LEFT JOIN public.slots s ON s.id = b.slot_id
  WHERE p.role = 'client'
  GROUP BY p.id, p.full_name, p.email, p.phone
  ORDER BY sessions_attended DESC, total_bookings DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
