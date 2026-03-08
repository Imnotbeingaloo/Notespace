UPDATE storage.buckets SET public = true WHERE id = 'note-attachments';

CREATE POLICY "Public read access for note-attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'note-attachments');
