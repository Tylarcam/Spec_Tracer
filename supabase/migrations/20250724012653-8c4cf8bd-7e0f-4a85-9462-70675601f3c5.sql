
-- Make the user tylarcam@gmail.com premium with unlimited credits
UPDATE public.subscribers 
SET 
  subscribed = true,
  subscription_tier = 'pro',
  subscription_end = '2025-12-31 23:59:59+00'::timestamp with time zone,
  updated_at = now()
WHERE email = 'tylarcam@gmail.com';

-- If the user doesn't exist in subscribers table, insert them as premium
INSERT INTO public.subscribers (
  user_id, 
  email, 
  subscribed, 
  subscription_tier, 
  subscription_end
) 
SELECT 
  '0a81d78e-0903-4647-9d96-258049ecca81'::uuid,
  'tylarcam@gmail.com',
  true,
  'pro',
  '2025-12-31 23:59:59+00'::timestamp with time zone
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscribers 
  WHERE email = 'tylarcam@gmail.com'
);
