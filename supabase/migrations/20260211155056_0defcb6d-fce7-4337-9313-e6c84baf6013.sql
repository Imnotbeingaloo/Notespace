
-- Create storage bucket for note attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('note-attachments', 'note-attachments', true);

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload own attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own attachments
CREATE POLICY "Users can view own attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own attachments
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'note-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add attachments column to notes table
ALTER TABLE public.notes ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
