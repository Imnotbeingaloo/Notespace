-- Allow anon users to read notes that have active public shares
CREATE POLICY "Anon can read publicly shared notes"
  ON public.notes FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_notes sn
      WHERE sn.note_id = notes.id
        AND sn.is_public = true
        AND (sn.expires_at IS NULL OR sn.expires_at > now())
    )
  );