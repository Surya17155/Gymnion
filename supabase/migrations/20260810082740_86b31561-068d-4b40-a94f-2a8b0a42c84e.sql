REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO service_role;
-- Note: Policies using has_role work even without direct GRANT because they run within the query engine context, 
-- but we restrict direct execution to be safe.
