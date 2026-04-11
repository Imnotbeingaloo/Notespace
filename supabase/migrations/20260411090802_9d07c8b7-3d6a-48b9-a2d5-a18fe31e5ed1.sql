-- Create shared_notes table
CREATE TABLE public.shared_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') UNIQUE,
  shared_with_email TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shares
CREATE POLICY "Owners can view own shares"
  ON public.shared_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can create shares"
  ON public.shared_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete shares"
  ON public.shared_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Anyone (including anon) can look up a share by token for public viewing
CREATE POLICY "Anyone can read public shares by token"
  ON public.shared_notes FOR SELECT
  TO anon
  USING (is_public = true);

-- Index for fast token lookups
CREATE INDEX idx_shared_notes_token ON public.shared_notes(share_token);
CREATE INDEX idx_shared_notes_note_id ON public.shared_notes(note_id);