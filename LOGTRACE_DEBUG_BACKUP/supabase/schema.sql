
-- Create user_credits table for tracking AI usage
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_limit INTEGER NOT NULL DEFAULT 5,
  reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, reset_date)
);

-- Enable RLS on user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policy for user_credits
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create user_subscriptions table for premium features
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status VARCHAR DEFAULT 'inactive',
  plan_type VARCHAR DEFAULT 'free',
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for user_subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.user_subscriptions 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to get user credits status
CREATE OR REPLACE FUNCTION public.get_user_credits_status(user_uuid uuid)
RETURNS TABLE(
  credits_remaining integer, 
  credits_limit integer, 
  reset_time timestamp with time zone, 
  is_premium boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits_used integer := 0;
  current_limit integer := 5;
  reset_timestamp timestamp with time zone;
  premium_status boolean := false;
BEGIN
  -- Check if user has active subscription
  SELECT 
    CASE WHEN subscription_status = 'active' THEN true ELSE false END
  INTO premium_status
  FROM public.user_subscriptions 
  WHERE user_id = user_uuid;
  
  -- If premium user, return unlimited credits
  IF premium_status THEN
    RETURN QUERY SELECT 
      999999 as credits_remaining,
      999999 as credits_limit,
      (timezone('utc'::text, now()) + interval '1 day') as reset_time,
      true as is_premium;
    RETURN;
  END IF;
  
  -- Get current day's credits usage
  SELECT 
    COALESCE(uc.credits_used, 0),
    COALESCE(uc.credits_limit, 5),
    COALESCE(uc.session_start_time + interval '24 hours', timezone('utc'::text, now()) + interval '24 hours')
  INTO current_credits_used, current_limit, reset_timestamp
  FROM public.user_credits uc
  WHERE uc.user_id = user_uuid 
    AND DATE(uc.reset_date) = DATE(timezone('utc'::text, now()));
  
  -- If no record exists for today, user has full credits
  IF current_credits_used IS NULL THEN
    current_credits_used := 0;
    current_limit := 5;
    reset_timestamp := timezone('utc'::text, now()) + interval '24 hours';
  END IF;
  
  RETURN QUERY SELECT 
    GREATEST(0, current_limit - current_credits_used) as credits_remaining,
    current_limit as credits_limit,
    reset_timestamp as reset_time,
    false as is_premium;
END;
$$;

-- Create function to use a credit
CREATE OR REPLACE FUNCTION public.use_credit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status record;
BEGIN
  -- Get current status
  SELECT * FROM public.get_user_credits_status(user_uuid) INTO current_status;
  
  -- Check if user has credits available
  IF current_status.credits_remaining <= 0 THEN
    RETURN false;
  END IF;
  
  -- If premium user, always allow
  IF current_status.is_premium THEN
    RETURN true;
  END IF;
  
  -- Use regular daily credit
  INSERT INTO public.user_credits (user_id, credits_used, reset_date, session_start_time)
  VALUES (user_uuid, 1, DATE(timezone('utc'::text, now())), timezone('utc'::text, now()))
  ON CONFLICT (user_id, reset_date) 
  DO UPDATE SET 
    credits_used = user_credits.credits_used + 1,
    updated_at = timezone('utc'::text, now());
  
  RETURN true;
END;
$$;
