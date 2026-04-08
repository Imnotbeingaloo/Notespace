
-- Drop existing public-role policies
DROP POLICY IF EXISTS "Users can delete own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own attachments" ON storage.objects;

-- Recreate with authenticated role
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'note-attachments' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'note-attachments' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'note-attachments' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Drop the duplicate authenticated SELECT policy
DROP POLICY IF EXISTS "Users can view own note attachments" ON storage.objects;
