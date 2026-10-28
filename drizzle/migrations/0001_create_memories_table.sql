CREATE TABLE public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id),
  text text NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.memories TO authenticated;
GRANT SELECT ON public.memories TO anon;
GRANT ALL ON public.memories TO service_role;

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_public_or_own_memories"
  ON public.memories
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "insert_own_memories"
  ON public.memories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_memories_song_id ON public.memories(song_id);
CREATE INDEX idx_memories_user_id ON public.memories(user_id);