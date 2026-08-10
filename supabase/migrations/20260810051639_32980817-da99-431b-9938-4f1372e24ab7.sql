-- Clear test payment data and reset revenue stats
DELETE FROM public.payments WHERE amount = 150 OR notes ILIKE '%test%';
UPDATE public.gyms SET subscription_ends_at = NULL, settings = settings - 'payment_status' WHERE settings->>'payment_status' = 'paid';