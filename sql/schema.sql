-- Admin users (managed by Supabase Auth, store profile)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service types
CREATE TABLE IF NOT EXISTS service_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rate INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'hour',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add-ons
CREATE TABLE IF NOT EXISTS addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'event',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quote submissions (from pricing calculator)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT REFERENCES service_types(id),
  service_name TEXT NOT NULL,
  hours INTEGER NOT NULL,
  languages INTEGER NOT NULL,
  attendees INTEGER NOT NULL,
  premium_languages BOOLEAN DEFAULT false,
  selected_addons JSONB DEFAULT '[]',
  total_estimate INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact form submissions (from /request-a-quote)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT DEFAULT '',
  service TEXT DEFAULT '',
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO service_types (id, name, description, rate, unit) VALUES
  ('live-events', 'Live Events', 'Real-time captions, translations & streaming', 150, 'hour'),
  ('content', 'Content Translation', 'Audio, video, slides & documents', 100, 'hour'),
  ('conversations', 'Conversations', 'Multilingual meetings & discussions', 75, 'hour'),
  ('multiple', 'Multiple Services', 'Combination of services for your needs', 0, 'hour')
ON CONFLICT (id) DO NOTHING;

INSERT INTO addons (id, name, description, price, unit) VALUES
  ('text-to-speech', 'Text-to-Speech', 'AI voice output for translations', 50, 'event'),
  ('interpreter', 'Professional Interpreter', 'Human interpreter for live supervision', 200, 'hour'),
  ('ai-customization', 'AI Customization', 'Train AI on your terminology & style', 500, 'project'),
  ('support', 'On-Call Support', 'Dedicated technician during your event', 150, 'event'),
  ('polls', 'Multilingual Polls', 'Interactive polls in multiple languages', 25, 'event')
ON CONFLICT (id) DO NOTHING;

-- Seed admin user (requires pgcrypto, enabled by default in Supabase)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, is_sso_user
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@spf.io',
  crypt('adminspfio123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  false
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@spf.io');

INSERT INTO auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
SELECT
  email,
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  now(), now(), now()
FROM auth.users
WHERE email = 'admin@spf.io'
  AND NOT EXISTS (SELECT 1 FROM auth.identities WHERE provider = 'email' AND user_id = auth.users.id);

INSERT INTO public.admin_users (id, email)
SELECT id, email FROM auth.users WHERE email = 'admin@spf.io'
ON CONFLICT (email) DO NOTHING;
