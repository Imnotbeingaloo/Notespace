-- Revoke broad execute on trigger helpers (only triggers need them)
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- get_shared_note must remain callable by anonymous visitors via share links.
-- Restrict to anon only (signed-in users viewing share links are also fine via anon role on PostgREST when using RPC unauthenticated; authenticated users don't need it).
REVOKE ALL ON FUNCTION public.get_shared_note(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_note(text) TO anon, authenticated;