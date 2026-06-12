-- ============================================================
-- FirstBridge — Auth Schema
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT,
  phone               TEXT UNIQUE,
  email               TEXT,
  avatar_url          TEXT,
  role                TEXT NOT NULL DEFAULT 'visitor'
                        CHECK (role IN ('student','scholar','mentor','staff','alumni','donor','parent','school_rep','visitor')),
  verification_status TEXT NOT NULL DEFAULT 'unverified'
                        CHECK (verification_status IN ('unverified','pending','verified','rejected')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  auth_provider       TEXT NOT NULL DEFAULT 'phone'
                        CHECK (auth_provider IN ('phone','google','both')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profiles"  ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile"  ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"  ON public.profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
