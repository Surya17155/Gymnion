-- Drop default if it exists to allow type change
ALTER TABLE public.global_plans ALTER COLUMN features DROP DEFAULT;

-- Change features to JSONB to support object structure {name, enabled}
ALTER TABLE public.global_plans 
  ALTER COLUMN features TYPE jsonb USING to_jsonb(features);

-- Set new default as empty jsonb array
ALTER TABLE public.global_plans ALTER COLUMN features SET DEFAULT '[]'::jsonb;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_plans TO authenticated;
GRANT ALL ON public.global_plans TO service_role;
GRANT SELECT ON public.global_plans TO anon;