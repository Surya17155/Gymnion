-- Add the 'gym_admin' value to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gym_admin';
