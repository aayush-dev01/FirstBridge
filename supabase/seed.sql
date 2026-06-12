-- ─── Dev seed: one pre-built account per role ────────────────────────────────
-- Phone numbers match the test_otp entries in config.toml.
-- OTP for all of them: 123456
-- Run automatically on: supabase db reset
-- To apply to live project: supabase db push --seed

-- Insert test auth users (phone-confirmed, no password needed)
INSERT INTO auth.users (
  id, instance_id,
  aud, role,
  phone, phone_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change_token_new, email_change_token_current
) VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000001', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000002', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000003', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000004', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000005', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000006', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000007', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000008', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  ),
  (
    '11111111-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    '+919100000009', now(),
    '{"provider":"phone","providers":["phone"]}', '{}',
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Insert profiles (onboarding already complete, goes straight to dashboard)
INSERT INTO public.profiles (
  user_id, name, phone, email,
  role, auth_provider, onboarding_complete, verification_status,
  created_at, updated_at
) VALUES
  (
    '11111111-0000-0000-0000-000000000001',
    'Dev Student', '+919100000001', null,
    'student', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000002',
    'Dev Scholar', '+919100000002', null,
    'scholar', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000003',
    'Dev Mentor', '+919100000003', null,
    'mentor', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000004',
    'Dev Staff', '+919100000004', null,
    'staff', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000005',
    'Dev Alumni', '+919100000005', null,
    'alumni', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000006',
    'Dev Donor', '+919100000006', null,
    'donor', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000007',
    'Dev Parent', '+919100000007', null,
    'parent', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000008',
    'Dev School Rep', '+919100000008', null,
    'school_rep', 'phone', true, 'unverified',
    now(), now()
  ),
  (
    '11111111-0000-0000-0000-000000000009',
    'Dev Visitor', '+919100000009', null,
    'visitor', 'phone', true, 'unverified',
    now(), now()
  )
ON CONFLICT (user_id) DO NOTHING;
