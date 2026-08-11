-- Add DOB and Address to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';