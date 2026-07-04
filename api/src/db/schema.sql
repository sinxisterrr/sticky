CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  color TEXT DEFAULT '#fef9c3',
  opacity REAL DEFAULT 1.0,
  shape TEXT DEFAULT 'rectangle',
  font TEXT DEFAULT 'Montserrat',
  font_size INTEGER DEFAULT 14,
  pinned BOOLEAN DEFAULT false,
  pos_x REAL DEFAULT 100,
  pos_y REAL DEFAULT 100,
  width INTEGER DEFAULT 280,
  height INTEGER DEFAULT 300,
  z_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorite_colors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  position INTEGER NOT NULL,
  UNIQUE(user_id, position)
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
