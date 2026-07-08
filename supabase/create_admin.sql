-- Run this in your Supabase SQL Editor to create the admin user and assign the admin role.

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 1. Check if user already exists
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@example.com';

  -- 2. If user does not exist, create them
  IF new_user_id IS NULL THEN
    new_user_id := gen_random_uuid();
    
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
    );
  END IF;

  -- 3. Associate with admin role in public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;

