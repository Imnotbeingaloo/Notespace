-- Add missing UPDATE policy for note-attachments storage bucket
CREATE POLICY "Authenticated users can update own attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'note-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'note-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);