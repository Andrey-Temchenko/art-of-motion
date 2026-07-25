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
    COALESCE(SUM(ss.booked_count), 0)::BIGINT AS bookings_count,
    ROUND(AVG(ss.booked_count::NUMERIC / NULLIF(ss.max_capacity, 0)) * 100, 1) AS avg_occupancy_pct
  FROM public.workout_types wt
  JOIN slot_stats ss ON ss.workout_type_id = wt.id
  GROUP BY wt.id, wt.title
  ORDER BY bookings_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
