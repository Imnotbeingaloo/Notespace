REVOKE ALL ON FUNCTION public.get_shared_note(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_shared_note(text) FROM anon;
REVOKE ALL ON FUNCTION public.get_shared_note(text) FROM authenticated;