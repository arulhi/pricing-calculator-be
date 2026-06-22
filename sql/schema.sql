-- Admin users (managed by Supabase Auth, store profile)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service types
CREATE TABLE service_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rate INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'hour',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add-ons
CREATE TABLE addons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'event',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quote submissions (from pricing calculator)
CREATE TABLE submissions (
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
CREATE TABLE contacts (
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
  ('multiple', 'Multiple Services', 'Combination of services for your needs', 0, 'hour');

INSERT INTO addons (id, name, description, price, unit) VALUES
  ('text-to-speech', 'Text-to-Speech', 'AI voice output for translations', 50, 'event'),
  ('interpreter', 'Professional Interpreter', 'Human interpreter for live supervision', 200, 'hour'),
  ('ai-customization', 'AI Customization', 'Train AI on your terminology & style', 500, 'project'),
  ('support', 'On-Call Support', 'Dedicated technician during your event', 150, 'event'),
  ('polls', 'Multilingual Polls', 'Interactive polls in multiple languages', 25, 'event');
