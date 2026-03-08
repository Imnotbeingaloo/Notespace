
ALTER TABLE public.notebooks ADD COLUMN deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.notes ADD COLUMN deleted_at timestamptz DEFAULT NULL;
