-- 1. Add first_name and last_name to members
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Add first_name and last_name to gyms (for admin/owner names)
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_first_name TEXT;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_last_name TEXT;

-- 3. Populate existing data (Split full_name by space)
UPDATE public.members 
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1) ELSE '' END
WHERE first_name IS NULL;

UPDATE public.gyms 
SET 
  owner_first_name = split_part(owner_name, ' ', 1),
  owner_last_name = CASE WHEN position(' ' in owner_name) > 0 THEN substring(owner_name from position(' ' in owner_name) + 1) ELSE '' END
WHERE owner_first_name IS NULL;

-- 4. Set RLS or Grants if needed (already managed by table-level RLS usually)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gyms TO authenticated;
GRANT ALL ON public.members TO service_role;
GRANT ALL ON public.gyms TO service_role;
