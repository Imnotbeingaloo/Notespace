ALTER TABLE public.shared_notes
  ADD COLUMN IF NOT EXISTS is_discoverable boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_shared_notes_discoverable
  ON public.shared_notes(is_discoverable)
  WHERE is_discoverable = true;

DROP FUNCTION IF EXISTS public.get_shared_note(text);

CREATE FUNCTION public.get_shared_note(_token text)
RETURNS TABLE (title text, content text, is_discoverable boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT n.title, n.content, s.is_discoverable
  FROM public.shared_notes s
  JOIN public.notes n ON n.id = s.note_id
  WHERE s.share_token = _token
    AND s.is_public = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
    AND n.deleted_at IS NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_note(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_note(text) TO anon, authenticated;