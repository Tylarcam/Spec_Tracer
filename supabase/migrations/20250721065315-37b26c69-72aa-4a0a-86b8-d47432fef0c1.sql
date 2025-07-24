
-- Fix database function search paths to prevent SQL injection
-- This is a critical security fix that prevents search path manipulation attacks

-- 1. Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Fix get_waitlist_position function
CREATE OR REPLACE FUNCTION public.get_waitlist_position(user_email character varying)
RETURNS integer AS $$
DECLARE
  position integer;
  user_created_at timestamp with time zone;
BEGIN
  -- Get the created_at timestamp for the given email
  SELECT created_at INTO user_created_at FROM public.waitlist WHERE email = user_email;
  -- If the email does not exist, return 0
  IF user_created_at IS NULL THEN
    RETURN 0;
  END IF;
  -- Count the number of entries with created_at less than user's and status 'pending'
  SELECT COUNT(*) + 1 INTO position
  FROM public.waitlist
  WHERE created_at < user_created_at
    AND status = 'pending';
  RETURN COALESCE(position, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Fix get_user_credits_status function
CREATE OR REPLACE FUNCTION public.get_user_credits_status(user_uuid uuid)
RETURNS TABLE(credits_remaining integer, credits_limit integer, reset_time timestamp with time zone, is_premium boolean, waitlist_bonus_remaining integer)
AS $$
DECLARE
  current_credits_used integer := 0;
  current_limit integer := 5;
  reset_timestamp timestamp with time zone;
  premium_status boolean := false;
  waitlist_bonus integer := 0;
BEGIN
  -- Check if user has active subscription
  SELECT 
    CASE WHEN subscribed = true THEN true ELSE false END
  INTO premium_status
  FROM public.subscribers 
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 4. Fix use_credit function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 5. Fix grant_waitlist_credits function
CREATE OR REPLACE FUNCTION public.grant_waitlist_credits(user_uuid uuid, user_email character varying)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. Tighten RLS policies for better security
-- Update waitlist SELECT policy to be more restrictive
DROP POLICY IF EXISTS "Allow users to view own waitlist entry" ON public.waitlist;
CREATE POLICY "Allow users to view own waitlist entry" ON public.waitlist
  FOR SELECT TO authenticated
  USING (email = auth.email());

-- Update subscribers policy to be more restrictive for updates
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
CREATE POLICY "update_own_subscription" ON public.subscribers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR email = auth.email())
  WITH CHECK (user_id = auth.uid() OR email = auth.email());
