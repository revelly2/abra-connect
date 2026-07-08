-- Run this in your Supabase SQL Editor to create the admin user and assign the admin role.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Create the user in auth.users with confirmed email
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('Admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  )
  ON CONFLICT (email) DO NOTHING;

  -- 2. Associate with admin role in public.user_roles
  -- Get the user ID of the existing or newly created user
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;
