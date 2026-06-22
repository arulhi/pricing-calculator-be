-- Fix admin user: delete existing identities and re-create cleanly.
-- Run this if the admin exists but login keeps failing.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Find the admin user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@spf.io';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Admin user not found in auth.users — run schema.sql first.';
    RETURN;
  END IF;

  -- Remove existing identities for this user
  DELETE FROM auth.identities WHERE user_id = v_user_id;

  -- Remove from admin_users too for clean re-insert
  DELETE FROM public.admin_users WHERE email = 'admin@spf.io';

  -- Re-create identity
  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    'admin@spf.io',
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', 'admin@spf.io'),
    'email',
    now(), now(), now()
  );

  -- Ensure password is correct
  UPDATE auth.users
  SET encrypted_password = crypt('adminspfio123', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now()
  WHERE id = v_user_id;

  -- Re-insert admin_users record
  INSERT INTO public.admin_users (id, email) VALUES (v_user_id, 'admin@spf.io')
  ON CONFLICT (email) DO NOTHING;

  RAISE NOTICE 'Admin user fixed: %', v_user_id;
END;
$$;
