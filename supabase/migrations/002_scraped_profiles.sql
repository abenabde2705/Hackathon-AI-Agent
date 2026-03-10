CREATE TABLE scraped_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_url TEXT UNIQUE NOT NULL,
  name TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  education TEXT,
  avatar_url TEXT,
  summary TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scraped_profiles ENABLE ROW LEVEL SECURITY;

-- Lisible par tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read scraped profiles"
  ON scraped_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Insertable par staff/admin seulement
CREATE POLICY "Staff can insert scraped profiles"
  ON scraped_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );
