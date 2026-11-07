CREATE TABLE public.memory_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT memory_images_storage_path_format
    CHECK (storage_path ~ ('^' || memory_id::text || '/[^/]+$'))
);

GRANT SELECT ON public.memory_images TO anon, authenticated;
GRANT INSERT ON public.memory_images TO authenticated;
GRANT ALL ON public.memory_images TO service_role;

ALTER TABLE public.memory_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_visible_memory_images"
  ON public.memory_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.memories AS m
      WHERE m.id = memory_images.memory_id
        AND (m.is_public = true OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "insert_own_memory_images"
  ON public.memory_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.memories AS m
      WHERE m.id = memory_images.memory_id
        AND m.user_id = auth.uid()
    )
  );

CREATE INDEX memory_images_memory_id_idx ON public.memory_images(memory_id);

CREATE OR REPLACE FUNCTION public.enforce_memory_image_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  image_count integer;
BEGIN
  PERFORM 1
  FROM public.memories
  WHERE id = NEW.memory_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'memory_images parent memory does not exist'
      USING ERRCODE = '23503';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT count(*) INTO image_count
    FROM public.memory_images
    WHERE memory_id = NEW.memory_id
      AND id <> OLD.id;
  ELSE
    SELECT count(*) INTO image_count
    FROM public.memory_images
    WHERE memory_id = NEW.memory_id;
  END IF;

  IF image_count >= 5 THEN
    RAISE EXCEPTION 'A memory can have at most 5 images'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_memory_image_limit() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER memory_images_enforce_limit
  BEFORE INSERT OR UPDATE ON public.memory_images
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_memory_image_limit();

CREATE POLICY "read_memory_images_by_parent_visibility"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'memory-images'
    AND array_length(storage.foldername(name), 1) = 1
    AND EXISTS (
      SELECT 1
      FROM public.memories AS m
      WHERE m.id::text = (storage.foldername(name))[1]
        AND (m.is_public = true OR m.user_id = auth.uid())
    )
  );

CREATE POLICY "upload_memory_images_to_owned_memory"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'memory-images'
    AND array_length(storage.foldername(name), 1) = 1
    AND EXISTS (
      SELECT 1
      FROM public.memories AS m
      WHERE m.id::text = (storage.foldername(name))[1]
        AND m.user_id = auth.uid()
    )
  );