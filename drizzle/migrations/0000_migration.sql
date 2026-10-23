CREATE TABLE IF NOT EXISTS public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  policy_version text NOT NULL,
  agreed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, policy_version)
);

GRANT SELECT, INSERT ON public.consent_log TO authenticated;
GRANT ALL ON public.consent_log TO service_role;

ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_consent" ON public.consent_log;
CREATE POLICY "select_own_consent"
  ON public.consent_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_consent" ON public.consent_log;
CREATE POLICY "insert_own_consent"
  ON public.consent_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  year integer,
  mbid text NOT NULL UNIQUE,
  youtube_video_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.songs TO anon, authenticated;
GRANT ALL ON public.songs TO service_role;

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_songs" ON public.songs;
CREATE POLICY "public_select_songs"
  ON public.songs FOR SELECT
  TO anon, authenticated
  USING (true);