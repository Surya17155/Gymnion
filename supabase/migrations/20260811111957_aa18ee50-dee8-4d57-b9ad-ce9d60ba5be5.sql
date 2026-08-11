ALTER TABLE public.members ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 1;

-- Seed existing members with their join date day if available, otherwise default to 1
UPDATE public.members 
SET billing_day = EXTRACT(DAY FROM join_date)::INTEGER 
WHERE join_date IS NOT NULL;

-- Specifically update Surya Kant as requested
UPDATE public.members 
SET billing_day = 11 
WHERE full_name ILIKE '%Surya Kant%';