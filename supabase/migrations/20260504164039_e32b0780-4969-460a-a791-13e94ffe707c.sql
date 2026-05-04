-- Remove overly broad anon SELECT policies
DROP POLICY IF EXISTS "Anyone can read public shares by token" ON public.shared_notes;
DROP POLICY IF EXISTS "Anon can read publicly shared notes" ON public.notes;

-- Secure token-gated lookup function
CREATE OR REPLACE FUNCTION public.get_shared_note(_token text)
RETURNS TABLE (title text, content text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT n.title, n.content
  FROM public.shared_notes s
  JOIN public.notes n ON n.id = s.note_id
  WHERE s.share_token = _token
    AND s.is_public = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
    AND n.deleted_at IS NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_note(text) TO anon, authenticated;