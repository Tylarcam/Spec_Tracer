-- Create user credits system for freemium model
-- 5 daily credits that reset at same time user started their session (24hr cycle)

-- User credits table - tracks daily credit usage
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_used integer DEFAULT 0 NOT NULL CHECK (credits_used >= 0),
  credits_limit integer DEFAULT 5 NOT NULL CHECK (credits_limit > 0),
  reset_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  session_start_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, reset_date)
);

-- User subscriptions table - tracks paid memberships
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  subscription_status varchar(50) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  plan_type varchar(50) DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Waitlist credits table - tracks bonus credits for waitlist users
CREATE TABLE IF NOT EXISTS public.waitlist_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email varchar(255) NOT NULL,
  bonus_credits_granted integer DEFAULT 5 NOT NULL,
  credits_used integer DEFAULT 0 NOT NULL CHECK (credits_used >= 0),
  granted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_reset_date ON public.user_credits(reset_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_credits_user_id ON public.waitlist_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_credits_email ON public.waitlist_credits(email);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits" ON public.user_credits
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_subscriptions  
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for waitlist_credits
CREATE POLICY "Users can view their own waitlist credits" ON public.waitlist_credits
  FOR ALL USING (auth.uid() = user_id);

-- Update triggers for updated_at timestamps
CREATE TRIGGER user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to get user's current credits status
CREATE OR REPLACE FUNCTION public.get_user_credits_status(user_uuid uuid)
RETURNS TABLE (
  credits_remaining integer,
  credits_limit integer,
  reset_time timestamp with time zone,
  is_premium boolean,
  waitlist_bonus_remaining integer
) AS $$
DECLARE
  current_credits_used integer := 0;
  current_limit integer := 5;
  reset_timestamp timestamp with time zone;
  premium_status boolean := false;
  waitlist_bonus integer := 0;
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
      true as is_premium,
      0 as waitlist_bonus_remaining;
    RETURN;
  END IF;
  
  -- Get waitlist bonus credits
  SELECT COALESCE(bonus_credits_granted - credits_used, 0)
  INTO waitlist_bonus
  FROM public.waitlist_credits 
  WHERE user_id = user_uuid 
    AND expires_at > timezone('utc'::text, now());
  
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
    GREATEST(0, current_limit - current_credits_used) + COALESCE(waitlist_bonus, 0) as credits_remaining,
    current_limit as credits_limit,
    reset_timestamp as reset_time,
    false as is_premium,
    COALESCE(waitlist_bonus, 0) as waitlist_bonus_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use a credit (decrements available credits)
CREATE OR REPLACE FUNCTION public.use_credit(user_uuid uuid)
RETURNS boolean AS $$
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
  
  -- Try to use waitlist bonus credit first
  IF current_status.waitlist_bonus_remaining > 0 THEN
    UPDATE public.waitlist_credits 
    SET credits_used = credits_used + 1
    WHERE user_id = user_uuid 
      AND expires_at > timezone('utc'::text, now());
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant waitlist bonus credits
CREATE OR REPLACE FUNCTION public.grant_waitlist_credits(user_uuid uuid, user_email varchar)
RETURNS boolean AS $$
BEGIN
  -- Check if user was on waitlist
  IF NOT EXISTS (
    SELECT 1 FROM public.waitlist 
    WHERE email = user_email
  ) THEN
    RETURN false;
  END IF;
  
  -- Grant bonus credits if not already granted
  INSERT INTO public.waitlist_credits (user_id, email, bonus_credits_granted)
  VALUES (user_uuid, user_email, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 