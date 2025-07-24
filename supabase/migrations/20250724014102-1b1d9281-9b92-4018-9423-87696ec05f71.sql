
-- Fix the get_user_credits_status function to return proper timestamp with time zone
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
      (now() + interval '1 day') as reset_time,
      true as is_premium,
      0 as waitlist_bonus_remaining;
    RETURN;
  END IF;
  
  -- Get waitlist bonus credits
  SELECT COALESCE(bonus_credits_granted - credits_used, 0)
  INTO waitlist_bonus
  FROM public.waitlist_credits 
  WHERE user_id = user_uuid 
    AND expires_at > now();
  
  -- Get current day's credits usage
  SELECT 
    COALESCE(uc.credits_used, 0),
    COALESCE(uc.credits_limit, 5),
    COALESCE(uc.session_start_time + interval '24 hours', now() + interval '24 hours')
  INTO current_credits_used, current_limit, reset_timestamp
  FROM public.user_credits uc
  WHERE uc.user_id = user_uuid 
    AND DATE(uc.reset_date) = DATE(now());
  
  -- If no record exists for today, user has full credits
  IF current_credits_used IS NULL THEN
    current_credits_used := 0;
    current_limit := 5;
    reset_timestamp := now() + interval '24 hours';
  END IF;
  
  RETURN QUERY SELECT 
    GREATEST(0, current_limit - current_credits_used) + COALESCE(waitlist_bonus, 0) as credits_remaining,
    current_limit as credits_limit,
    reset_timestamp as reset_time,
    false as is_premium,
    COALESCE(waitlist_bonus, 0) as waitlist_bonus_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
