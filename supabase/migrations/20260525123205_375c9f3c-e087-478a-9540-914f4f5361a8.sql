CREATE UNIQUE INDEX IF NOT EXISTS notebooks_unique_active_name_per_user
ON public.notebooks (user_id, lower(trim(name)))
WHERE deleted_at IS NULL;