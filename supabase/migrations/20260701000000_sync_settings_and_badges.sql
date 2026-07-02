-- Migration to add columns for sync settings and completed challenges to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS completed_challenges JSONB NOT NULL DEFAULT '[]'::jsonb;
