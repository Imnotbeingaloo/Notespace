
-- Make the note-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'note-attachments';

-- Drop existing overly permissive SELECT policy if any
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for note-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view note attachments" ON storage.objects;

-- Create restricted SELECT policy: authenticated users can only access their own folder
CREATE POLICY "Users can view own note attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
