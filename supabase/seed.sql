-- Fix local Supabase default privileges bug (these grants only run locally)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- 1. Create Test Users in auth.users
-- This inserts the users directly into Supabase's auth schema so they can login.
insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) values
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'user@test.com',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
),
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@test.com',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Insert identities for the users (required by Supabase Auth for login to work properly)
insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) values
(
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    format('{"sub":"%s","email":"%s"}', '11111111-1111-1111-1111-111111111111', 'user@test.com')::jsonb,
    'email',
    'user@test.com',
    now(),
    now(),
    now()
),
(
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    format('{"sub":"%s","email":"%s"}', '22222222-2222-2222-2222-222222222222', 'admin@test.com')::jsonb,
    'email',
    'admin@test.com',
    now(),
    now(),
    now()
);


-- 2. Update Profiles (trigger auto-creates them)
update public.profiles set role = 'admin' where email = 'admin@test.com';

-- 3. Create Workout Types (from production data)
insert into public.workout_types (id, title, duration_minutes, default_price, created_at) values
('2335f652-e898-40d7-9486-a6a20f05b91a', 'mfr', 60, 0.00, '2026-07-24 12:33:36.767947+00'),
('393035ad-ff6d-4c1e-9b13-8658e3aed383', 'trx', 60, 0.00, '2026-07-24 12:33:36.767947+00'),
('569043db-1bb8-4e5f-aed6-0ad7150e2151', 'stretching', 60, 0.00, '2026-07-24 12:33:36.767947+00'),
('590da815-cc34-43ae-b9e9-3c11070b6483', 'balance_board', 60, 0.00, '2026-07-24 12:33:36.767947+00'),
('80042596-f3f3-42d4-a64a-0792d2575832', 'gym', 60, 0.00, '2026-07-24 12:33:36.767947+00'),
('b400de07-8145-49da-98c2-0c8d79410447', 'strength', 60, 0.00, '2026-07-24 12:33:36.767947+00');

-- 4. Create Slots
insert into public.slots (id, workout_type_id, start_time, end_time, location, price, max_capacity, cancellation_deadline_hours, status) values
-- Past slot (completed)
('aaaa0000-0000-0000-0000-000000000001', '2335f652-e898-40d7-9486-a6a20f05b91a', now() - interval '2 days', now() - interval '2 days' + interval '1 hour', 'alpha', 0, 10, 24, 'completed'),
-- Near future slot (cannot cancel, deadline 24h, starts in 2h)
('aaaa0000-0000-0000-0000-000000000002', '393035ad-ff6d-4c1e-9b13-8658e3aed383', now() + interval '2 hours', now() + interval '3 hours', 'top_gun', 0, 10, 24, 'scheduled'),
-- Far future slot (can cancel, deadline 24h, starts in 7 days)
('aaaa0000-0000-0000-0000-000000000003', '80042596-f3f3-42d4-a64a-0792d2575832', now() + interval '7 days', now() + interval '7 days' + interval '1 hour', 'alpha', 0, 10, 24, 'scheduled');

-- 5. Create Bookings for the Test User
insert into public.bookings (id, client_id, slot_id, status) values
('bbbb0000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaa0000-0000-0000-0000-000000000001', 'confirmed'),
('bbbb0000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaa0000-0000-0000-0000-000000000002', 'confirmed'),
('bbbb0000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaa0000-0000-0000-0000-000000000003', 'confirmed');
