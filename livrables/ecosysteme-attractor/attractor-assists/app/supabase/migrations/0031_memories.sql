-- Migration 0031 : Table memories — mémoires long terme de l'assistant
-- Utilisée par extract-memories (edge function) et lue par chat-assistant

CREATE TABLE IF NOT EXISTS memories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  categorie   text NOT NULL CHECK (categorie IN ('projet', 'client', 'decision', 'livrable', 'contexte')),
  contenu     text NOT NULL,
  importance  integer NOT NULL DEFAULT 1,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own" ON memories;
CREATE POLICY "own" ON memories FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS memories_updated_at ON memories;
CREATE TRIGGER memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_memories_updated_at();
