CREATE OR REPLACE FUNCTION public.enforce_notebook_one_level()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
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

REVOKE EXECUTE ON FUNCTION public.enforce_notebook_one_level() FROM PUBLIC, anon, authenticated;