CREATE TABLE public.temporary_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Temporary Note',
  content text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.temporary_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own temporary notes"
ON public.temporary_notes FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own temporary notes"
ON public.temporary_notes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own temporary notes"
ON public.temporary_notes FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own temporary notes"
ON public.temporary_notes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_temporary_notes_updated_at
BEFORE UPDATE ON public.temporary_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_temporary_notes_expires_at ON public.temporary_notes (expires_at);
CREATE INDEX idx_temporary_notes_user_id ON public.temporary_notes (user_id);