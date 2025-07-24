
-- Step 1: Drop the unused user_subscriptions table
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;

-- Step 2: Enhance user_credits table to handle all credit types
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS waitlist_bonus_granted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS waitlist_bonus_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS waitlist_bonus_expires_at TIMESTAMPTZ;

-- Step 3: Migrate data from waitlist_credits to user_credits
INSERT INTO public.user_credits (
  user_id, 
  credits_used, 
  credits_limit, 
  reset_date, 
  session_start_time,
  waitlist_bonus_granted,
  waitlist_bonus_used,
  waitlist_bonus_expires_at,
  created_at,
  updated_at
)
SELECT 
  wc.user_id,
  0, -- credits_used (daily credits)
  5, -- credits_limit (default daily limit)
  CURRENT_DATE, -- reset_date
  timezone('utc'::text, now()), -- session_start_time
  wc.bonus_credits_granted,
  wc.credits_used,
  wc.expires_at,
  wc.created_at,
  timezone('utc'::text, now())
FROM public.waitlist_credits wc
WHERE wc.user_id NOT IN (SELECT user_id FROM public.user_credits WHERE user_id IS NOT NULL)
ON CONFLICT (user_id, reset_date) DO UPDATE SET
  waitlist_bonus_granted = EXCLUDED.waitlist_bonus_granted,
  waitlist_bonus_used = EXCLUDED.waitlist_bonus_used,
  waitlist_bonus_expires_at = EXCLUDED.waitlist_bonus_expires_at,
  updated_at = timezone('utc'::text, now());

-- Step 4: Update existing user_credits records with waitlist data
UPDATE public.user_credits uc
SET 
  waitlist_bonus_granted = wc.bonus_credits_granted,
  waitlist_bonus_used = wc.credits_used,
  waitlist_bonus_expires_at = wc.expires_at,
  updated_at = timezone('utc'::text, now())
FROM public.waitlist_credits wc
WHERE uc.user_id = wc.user_id
  AND uc.reset_date = CURRENT_DATE;

-- Step 5: Drop the waitlist_credits table
DROP TABLE IF EXISTS public.waitlist_credits CASCADE;

-- Step 6: Update the get_user_credits_status function
CREATE OR REPLACE FUNCTION public.get_user_credits_status(user_uuid uuid)
RETURNS TABLE(credits_remaining integer, credits_limit integer, reset_time timestamp with time zone, is_premium boolean, waitlist_bonus_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
      (now() + interval '1 day') as reset_time,
      true as is_premium,
      0 as waitlist_bonus_remaining;
    RETURN;
  END IF;
  
  -- Get current day's credits usage and waitlist bonus
  SELECT 
    COALESCE(uc.credits_used, 0),
    COALESCE(uc.credits_limit, 5),
    COALESCE(uc.session_start_time + interval '24 hours', now() + interval '24 hours'),
    GREATEST(0, COALESCE(uc.waitlist_bonus_granted - uc.waitlist_bonus_used, 0))
  INTO current_credits_used, current_limit, reset_timestamp, waitlist_bonus
  FROM public.user_credits uc
  WHERE uc.user_id = user_uuid 
    AND DATE(uc.reset_date) = DATE(now())
    AND (uc.waitlist_bonus_expires_at IS NULL OR uc.waitlist_bonus_expires_at > now());
  
  -- If no record exists for today, user has full credits
  IF current_credits_used IS NULL THEN
    current_credits_used := 0;
    current_limit := 5;
    reset_timestamp := now() + interval '24 hours';
    waitlist_bonus := 0;
  END IF;
  
  RETURN QUERY SELECT 
    GREATEST(0, current_limit - current_credits_used) + COALESCE(waitlist_bonus, 0) as credits_remaining,
    current_limit as credits_limit,
    reset_timestamp as reset_time,
    false as is_premium,
    COALESCE(waitlist_bonus, 0) as waitlist_bonus_remaining;
END;
$$;

-- Step 7: Update the use_credit function
CREATE OR REPLACE FUNCTION public.use_credit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
  
  -- Try to use waitlist bonus credit first
  IF current_status.waitlist_bonus_remaining > 0 THEN
    INSERT INTO public.user_credits (user_id, credits_used, reset_date, session_start_time, waitlist_bonus_used)
    VALUES (user_uuid, 0, DATE(timezone('utc'::text, now())), timezone('utc'::text, now()), 1)
    ON CONFLICT (user_id, reset_date) 
    DO UPDATE SET 
      waitlist_bonus_used = user_credits.waitlist_bonus_used + 1,
      updated_at = timezone('utc'::text, now());
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

-- Step 8: Update the grant_waitlist_credits function
CREATE OR REPLACE FUNCTION public.grant_waitlist_credits(user_uuid uuid, user_email character varying)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user was on waitlist
  IF NOT EXISTS (
    SELECT 1 FROM public.waitlist 
    WHERE email = user_email
  ) THEN
    RETURN false;
  END IF;
  
  -- Grant bonus credits if not already granted
  INSERT INTO public.user_credits (
    user_id, 
    credits_used, 
    reset_date, 
    session_start_time,
    waitlist_bonus_granted,
    waitlist_bonus_used,
    waitlist_bonus_expires_at
  )
  VALUES (
    user_uuid, 
    0, 
    DATE(timezone('utc'::text, now())), 
    timezone('utc'::text, now()),
    5,
    0,
    timezone('utc'::text, now()) + interval '30 days'
  )
  ON CONFLICT (user_id, reset_date) DO UPDATE SET
    waitlist_bonus_granted = CASE 
      WHEN user_credits.waitlist_bonus_granted = 0 THEN 5 
      ELSE user_credits.waitlist_bonus_granted 
    END,
    waitlist_bonus_expires_at = CASE 
      WHEN user_credits.waitlist_bonus_expires_at IS NULL THEN timezone('utc'::text, now()) + interval '30 days'
      ELSE user_credits.waitlist_bonus_expires_at 
    END,
    updated_at = timezone('utc'::text, now());
  
  RETURN true;
END;
$$;
