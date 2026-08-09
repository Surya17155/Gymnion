-- Fix SECURITY DEFINER execution permissions for handle_new_user and has_role
-- Revoke all to ensure a clean slate, then grant only to the roles that need it (usually postgres/service_role for triggers)

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
-- handle_new_user is a trigger, it runs as the user who performs the DML or as the owner if SECURITY DEFINER.
-- Usually, we want it to be executable only by the system.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
