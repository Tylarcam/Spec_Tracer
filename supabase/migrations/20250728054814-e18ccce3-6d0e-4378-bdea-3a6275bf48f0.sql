-- Fix database functions to include security definer path protection
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