-- Roles Enum
CREATE TYPE user_role AS ENUM ('alumni', 'staff', 'admin');

-- Job Type Enum
CREATE TYPE job_type AS ENUM ('CDI', 'CDD', 'Freelance');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'alumni' NOT NULL,
  graduation_year INTEGER,
  degree TEXT,
  current_company TEXT,
  current_position TEXT,
  linkedin_url TEXT,
  bio TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  type job_type DEFAULT 'CDI' NOT NULL,
  apply_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Jobs Policies
CREATE POLICY "Jobs are viewable by everyone." ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Staff and admins can insert jobs." ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'staff' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Staff and admins can update jobs." ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'staff' OR profiles.role = 'admin')
    )
  );

-- Events Policies
CREATE POLICY "Events are viewable by everyone." ON events
  FOR SELECT USING (true);

CREATE POLICY "Staff and admins can insert events." ON events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'staff' OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Staff and admins can update events." ON events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'staff' OR profiles.role = 'admin')
    )
  );
