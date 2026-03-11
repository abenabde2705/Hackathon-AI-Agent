-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated users to insert their own registration
CREATE POLICY "Users can register themselves." ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view participants of events
CREATE POLICY "Users can view participants." ON event_participants
  FOR SELECT USING (true);

-- 3. Allow users to unregister themselves
CREATE POLICY "Users can unregister themselves." ON event_participants
  FOR DELETE USING (auth.uid() = user_id);
