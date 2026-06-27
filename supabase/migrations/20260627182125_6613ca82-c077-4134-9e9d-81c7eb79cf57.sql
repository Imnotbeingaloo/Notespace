
DROP POLICY IF EXISTS "Owners can create shares" ON public.shared_notes;
CREATE POLICY "Owners can create shares"
  ON public.shared_notes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.notes
      WHERE id = note_id
        AND user_id = auth.uid()
        AND deleted_at IS NULL
    )
  );

CREATE OR REPLACE FUNCTION public.get_shared_note(_token text)
 RETURNS TABLE(title text, content text, is_discoverable boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT n.title, n.content, s.is_discoverable
  FROM public.shared_notes s
  JOIN public.notes n ON n.id = s.note_id AND n.user_id = s.user_id
  WHERE s.share_token = _token
    AND s.is_public = true
    AND (s.expires_at IS NULL OR s.expires_at > now())
    AND n.deleted_at IS NULL
  LIMIT 1;
$function$;
