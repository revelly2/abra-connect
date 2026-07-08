-- 1. Dynamically drop all custom triggers on the auth.users table
-- (Legacy or broken triggers here cause 500 errors during sign-in/up).
DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' 
          AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(t.trigger_name) || ' ON auth.users;';
    END LOOP;
END $$;

-- 2. Drop the legacy handler function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Clean up any previous attempts for admin@example.com
DELETE FROM auth.users WHERE email = 'admin@example.com';

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 4. Create the user in auth.users with confirmed email
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

  -- 5. Associate with admin role in public.user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

END $$;


