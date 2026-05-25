-- Add parent_id for sub-notebooks (one level deep, enforced by trigger)
ALTER TABLE public.notebooks
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.notebooks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notebooks_user_parent
  ON public.notebooks(user_id, parent_id);

-- Trigger: enforce one-level nesting and prevent self-parenting
CREATE OR REPLACE FUNCTION public.enforce_notebook_one_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NEW.parent_id = NEW.id THEN
      RAISE EXCEPTION 'A notebook cannot be its own parent';
    END IF;
    IF EXISTS (SELECT 1 FROM public.notebooks WHERE id = NEW.parent_id AND parent_id IS NOT NULL) THEN
      RAISE EXCEPTION 'Sub-notebooks cannot themselves be nested (one level only)';
    END IF;
    IF EXISTS (SELECT 1 FROM public.notebooks WHERE parent_id = NEW.id) THEN
      RAISE EXCEPTION 'A notebook that already has children cannot be nested';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_notebook_one_level_trigger ON public.notebooks;
CREATE TRIGGER enforce_notebook_one_level_trigger
  BEFORE INSERT OR UPDATE ON public.notebooks
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_notebook_one_level();