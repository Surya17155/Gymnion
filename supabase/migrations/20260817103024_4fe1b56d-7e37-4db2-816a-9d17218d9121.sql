CREATE TABLE public.razorpay_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    razorpay_account_id TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    status TEXT NOT NULL DEFAULT 'connected',
    connected_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(gym_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.razorpay_connections TO authenticated;
GRANT ALL ON public.razorpay_connections TO service_role;

ALTER TABLE public.razorpay_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gym's razorpay connection" 
ON public.razorpay_connections 
FOR SELECT 
TO authenticated 
USING (
  gym_id IN (
    SELECT gym_id FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);
