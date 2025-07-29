-- Fix database function security by setting proper search paths and security definer
-- This addresses WARN 1: Function Search Path Mutable

-- Update is_valid_email function
CREATE OR REPLACE FUNCTION public.is_valid_email(email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
 IMMUTABLE
AS $function$
BEGIN
  RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$function$;

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;

-- Update check_tylarcam_premium function
CREATE OR REPLACE FUNCTION public.check_tylarcam_premium()
 RETURNS TABLE(is_premium boolean, api_access boolean, remaining_calls integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_email CONSTANT TEXT := 'tylarcam@gmail.com';
BEGIN
  RETURN QUERY
  SELECT 
    public.is_premium_user(user_email) AS is_premium,
    (SELECT is_allowed FROM public.validate_api_access(user_email, 'test_endpoint')) AS api_access,
    (SELECT remaining_calls FROM public.validate_api_access(user_email, 'test_endpoint')) AS remaining_calls;
END;
$function$;

-- Update get_waitlist_position function
CREATE OR REPLACE FUNCTION public.get_waitlist_position(user_email character varying)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update grant_waitlist_credits function
CREATE OR REPLACE FUNCTION public.grant_waitlist_credits(user_uuid uuid, user_email character varying)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update create_referral function
CREATE OR REPLACE FUNCTION public.create_referral(referrer_uuid uuid, referred_email_param text, referral_code_param text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  referral_id UUID;
  referrer_email_var TEXT;
  existing_referral_count INTEGER;
BEGIN
  -- Validate email format
  IF NOT public.is_valid_email(referred_email_param) THEN
    RAISE EXCEPTION 'Invalid email format: %', referred_email_param;
  END IF;

  -- Check for existing referral to prevent duplicates
  SELECT COUNT(*) INTO existing_referral_count
  FROM public.referrals
  WHERE referrer_user_id = referrer_uuid 
    AND referred_email = referred_email_param 
    AND status IN ('pending', 'completed');

  IF existing_referral_count > 0 THEN
    RAISE EXCEPTION 'Referral already exists for this email';
  END IF;

  -- Get referrer email
  SELECT email INTO referrer_email_var
  FROM auth.users
  WHERE id = referrer_uuid;

  -- Generate unique referral code if not provided
  IF referral_code_param IS NULL THEN
    referral_code_param := LOWER(
      SUBSTRING(MD5(referrer_uuid::text || referred_email_param || NOW()::text) FROM 1 FOR 8)
    );
  END IF;

  -- Insert referral record
  INSERT INTO public.referrals (
    referrer_user_id,
    referrer_email,
    referred_email,
    referral_code,
    status
  ) VALUES (
    referrer_uuid,
    referrer_email_var,
    referred_email_param,
    referral_code_param,
    'pending'
  ) RETURNING id INTO referral_id;

  RETURN referral_id;
END;
$function$;

-- Update log_credit_change function
CREATE OR REPLACE FUNCTION public.log_credit_change(user_uuid uuid, change_amount integer, change_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.credit_change_logs (
    user_id,
    change_amount,
    change_reason,
    changed_at
  ) VALUES (
    user_uuid,
    change_amount,
    change_reason,
    NOW()
  );
END;
$function$;

-- Update comprehensive_user_verification function
CREATE OR REPLACE FUNCTION public.comprehensive_user_verification(input_email text DEFAULT auth.email())
 RETURNS TABLE(auth_user_id uuid, auth_email text, auth_role text, auth_last_sign_in timestamp with time zone, is_subscriber boolean, subscription_tier text, subscription_start timestamp with time zone, subscription_end timestamp with time zone, stripe_customer_id text, has_premium_access boolean, access_validation_timestamp timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  WITH 
  auth_details AS (
    SELECT 
      id AS user_id, 
      email, 
      role, 
      last_sign_in_at
    FROM auth.users
    WHERE email = input_email
  ),
  subscriber_details AS (
    SELECT 
      s.*,
      CASE 
        WHEN s.subscribed 
             AND s.subscription_end > NOW() 
        THEN true 
        ELSE false 
      END AS active_subscription
    FROM public.subscribers s
    WHERE s.email = input_email
  )
  SELECT 
    -- Authentication Details
    ad.user_id AS auth_user_id,
    ad.email AS auth_email,
    ad.role AS auth_role,
    ad.last_sign_in_at AS auth_last_sign_in,
    
    -- Subscriber Details
    COALESCE(sd.subscribed, false) AS is_subscriber,
    COALESCE(sd.subscription_tier, 'No Tier') AS subscription_tier,
    sd.created_at AS subscription_start,
    sd.subscription_end,
    
    -- Stripe Integration
    sd.stripe_customer_id,
    
    -- Access Validation
    COALESCE(sd.active_subscription, false) AS has_premium_access,
    NOW() AS access_validation_timestamp
  FROM auth_details ad
  LEFT JOIN subscriber_details sd ON ad.user_id IS NOT NULL;
END;
$function$;

-- Update get_user_credits_status function
CREATE OR REPLACE FUNCTION public.get_user_credits_status(user_uuid uuid)
 RETURNS TABLE(credits_remaining integer, credits_limit integer, reset_time timestamp with time zone, is_premium boolean, waitlist_bonus_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update use_credit function
CREATE OR REPLACE FUNCTION public.use_credit(user_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- Update verify_premium_user function
CREATE OR REPLACE FUNCTION public.verify_premium_user(check_email text)
 RETURNS TABLE(auth_user_exists boolean, subscriber_record_exists boolean, is_subscribed boolean, subscription_tier text, subscription_end timestamp with time zone, user_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM auth.users WHERE email = check_email) AS auth_user_exists,
    EXISTS(SELECT 1 FROM public.subscribers WHERE email = check_email) AS subscriber_record_exists,
    COALESCE(s.subscribed, false) AS is_subscribed,
    COALESCE(s.subscription_tier, 'No Tier') AS subscription_tier,
    s.subscription_end,
    u.id AS user_id
  FROM auth.users u
  LEFT JOIN public.subscribers s ON u.email = s.email
  WHERE u.email = check_email;
END;
$function$;

-- Improve RLS policies for credit_change_logs
-- Add system-only insert policy for credit_change_logs
CREATE POLICY "System can insert credit logs" ON public.credit_change_logs
FOR INSERT WITH CHECK (false); -- Only functions can insert

-- Add system-only update/delete policies
CREATE POLICY "No updates allowed on credit logs" ON public.credit_change_logs
FOR UPDATE USING (false);

CREATE POLICY "No deletes allowed on credit logs" ON public.credit_change_logs
FOR DELETE USING (false);