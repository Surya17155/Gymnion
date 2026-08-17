-- Add functions for payment reminders via cron/webhook
CREATE OR REPLACE FUNCTION public.check_due_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    member_record RECORD;
    tomorrow DATE := CURRENT_DATE + 1;
    today DATE := CURRENT_DATE;
BEGIN
    -- This would be called by a cron job
    -- For now we implement the logic that identifies the members
    
    -- 1. Payments due tomorrow
    FOR member_record IN 
        SELECT m.*, g.name as gym_name, g.owner_email
        FROM members m
        JOIN gyms g ON m.gym_id = g.id
        WHERE m.status = 'active'
        AND m.subscription_ends_at::date = tomorrow
    LOOP
        -- In production, trigger email via server function or edge function
        RAISE NOTICE 'Reminder: Payment due tomorrow for member % at %', member_record.full_name, member_record.gym_name;
    END LOOP;

    -- 2. Payments due today (billing cycle complete)
    FOR member_record IN 
        SELECT m.*, g.name as gym_name
        FROM members m
        JOIN gyms g ON m.gym_id = g.id
        WHERE m.subscription_ends_at::date = today
        AND NOT EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.member_id = m.id 
            AND p.payment_month = to_char(today, 'YYYY-MM')
            AND p.status = 'paid'
        )
    LOOP
        -- Logic to set status to overdue if not paid by end of day
        UPDATE members SET status = 'overdue' WHERE id = member_record.id;
        RAISE NOTICE 'Alert: Payment overdue for member % at %', member_record.full_name, member_record.gym_name;
    END LOOP;
END;
$$;
