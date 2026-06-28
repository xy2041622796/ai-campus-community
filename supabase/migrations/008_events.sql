-- 008_events.sql
-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ,
  max_participants INT DEFAULT 0,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Users create events" ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers update events" ON events FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers delete events" ON events FOR DELETE USING (auth.uid() = organizer_id);

CREATE POLICY "Participants viewable by everyone" ON event_participants FOR SELECT USING (true);
CREATE POLICY "Users join events" ON event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cancel participation" ON event_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own participation" ON event_participants FOR DELETE USING (auth.uid() = user_id);

-- Updated at trigger
DROP TRIGGER IF EXISTS on_events_updated ON events;
CREATE TRIGGER on_events_updated
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Count participants function
CREATE OR REPLACE FUNCTION get_event_participant_count(event_id UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  count INT;
BEGIN
  SELECT COUNT(*) INTO count FROM event_participants
  WHERE event_participants.event_id = get_event_participant_count.event_id
    AND status = 'registered';
  RETURN count;
END;
$$;
