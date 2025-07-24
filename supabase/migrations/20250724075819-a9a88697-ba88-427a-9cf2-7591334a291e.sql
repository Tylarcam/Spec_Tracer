
-- Make Tylarcam@gmail.com a premium subscriber
INSERT INTO public.subscribers (email, user_id, subscribed, subscription_tier, subscription_end, stripe_customer_id, updated_at, created_at)
VALUES (
  'Tylarcam@gmail.com',
  (SELECT id FROM auth.users WHERE email = 'Tylarcam@gmail.com'),
  true,
  'Premium',
  '2025-12-31 23:59:59+00',
  'test_customer_premium',
  now(),
  now()
)
ON CONFLICT (email) 
DO UPDATE SET 
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_end = '2025-12-31 23:59:59+00',
  stripe_customer_id = 'test_customer_premium',
  updated_at = now();
