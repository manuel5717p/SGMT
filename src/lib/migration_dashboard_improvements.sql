-- Migration for Dashboard Improvements
-- Run this in Supabase SQL Editor

-- 1. Add source column to track appointment origin
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'web';

-- 2. Add client_name for walk-in clients (who don't have a profile/user_id)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS client_name text;

-- 3. Add internal_notes for cancellation reasons or admin notes
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS internal_notes text;

-- 4. Ensure client_id is nullable (it might already be foreign key, we need to allow NULL)
ALTER TABLE appointments 
ALTER COLUMN client_id DROP NOT NULL;

-- 5. Add check constraint for source (optional but good practice)
-- ALTER TABLE appointments ADD CONSTRAINT check_source CHECK (source IN ('web', 'walk_in'));
