ALTER TABLE public.members ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Update existing members to have a subscription end date based on their join_date (1 month trial/period)
UPDATE public.members 
SET subscription_ends_at = (join_date::timestamptz + interval '1 month')
WHERE join_date IS NOT NULL AND subscription_ends_at IS NULL;