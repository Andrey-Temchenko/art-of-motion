CREATE OR REPLACE FUNCTION public.admin_dashboard_kpis()
RETURNS TABLE (
  total_clients BIGINT,
  active_bookings BIGINT,
  upcoming_slots BIGINT,
  revenue_estimate NUMERIC
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'client'),
    (SELECT COUNT(*) FROM public.bookings b JOIN public.slots s ON s.id = b.slot_id
       WHERE b.status = 'confirmed' AND s.start_time > NOW()),
    (SELECT COUNT(*) FROM public.slots
       WHERE status = 'scheduled' AND start_time > NOW()),
    (SELECT COALESCE(SUM(s.price), 0) FROM public.bookings b JOIN public.slots s ON s.id = b.slot_id
       WHERE b.status = 'confirmed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.admin_bookings_volume(weeks_back INT DEFAULT 8)
RETURNS TABLE (week_start DATE, bookings_count BIGINT) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  SELECT
    date_trunc('week', b.created_at AT TIME ZONE 'Europe/Kyiv')::DATE AS week_start,
    COUNT(*) AS bookings_count
  FROM public.bookings b
  WHERE b.created_at > NOW() - (weeks_back || ' weeks')::INTERVAL
    AND b.status = 'confirmed'
  GROUP BY 1
  ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.admin_popular_workout_types(limit_count INT DEFAULT 5)
RETURNS TABLE (
  workout_type_id UUID,
  title TEXT,
  bookings_count BIGINT,
  avg_occupancy_pct NUMERIC
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = 'P0003';
  END IF;

  RETURN QUERY
  WITH slot_stats AS (
    SELECT
      s.id AS slot_id,
      s.workout_type_id,
      s.max_capacity,
      COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS booked_count
    FROM public.slots s
    LEFT JOIN public.bookings b ON b.slot_id = s.id
    GROUP BY s.id, s.workout_type_id, s.max_capacity
  )
  SELECT
    wt.id,
    wt.title,
    COALESCE(SUM(ss.booked_count), 0) AS bookings_count,
    ROUND(AVG(ss.booked_count::NUMERIC / NULLIF(ss.max_capacity, 0)) * 100, 1) AS avg_occupancy_pct
  FROM public.workout_types wt
  JOIN slot_stats ss ON ss.workout_type_id = wt.id
  GROUP BY wt.id, wt.title
  ORDER BY bookings_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
