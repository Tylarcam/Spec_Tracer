-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email varchar(255) NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'accepted', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  referral_code varchar(50),
  source varchar(100),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on repeated migrations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waitlist' AND policyname = 'Allow public insert on waitlist'
  ) THEN
    EXECUTE 'DROP POLICY "Allow public insert on waitlist" ON public.waitlist';
  END IF;
END $$;

-- Allow public insert on waitlist
CREATE POLICY "Allow public insert on waitlist" ON public.waitlist
  FOR INSERT TO public
  WITH CHECK (true);

-- Allow users to view their own waitlist entry
CREATE POLICY "Allow users to view own waitlist entry" ON public.waitlist
  FOR SELECT TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to get waitlist position
CREATE OR REPLACE FUNCTION public.get_waitlist_position(user_email varchar)
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 