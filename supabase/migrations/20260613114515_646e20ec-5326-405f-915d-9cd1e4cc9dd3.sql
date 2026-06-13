ALTER TABLE public.notes ALTER COLUMN notebook_id DROP NOT NULL;

ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS emoji text DEFAULT '📝';

UPDATE public.notes AS n
SET notebook_id = NULL
FROM public.notebooks AS nb
WHERE n.notebook_id = nb.id
  AND nb.user_id = n.user_id
  AND nb.emoji = '📝'
  AND nb.name IN ('Notes', 'Simple Notes');

UPDATE public.notebooks
SET name = 'Legacy Notes'
WHERE emoji = '📝'
  AND name IN ('Notes', 'Simple Notes');