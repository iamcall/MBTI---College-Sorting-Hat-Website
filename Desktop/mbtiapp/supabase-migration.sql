-- Migration: Create or verify responses table structure
-- This script is idempotent - it only creates what doesn't exist
-- Safe to run multiple times without affecting existing data

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  school TEXT NOT NULL,
  enrolled BOOLEAN NOT NULL,
  mbti TEXT NOT NULL,
  college TEXT,
  fit BOOLEAN,
  would_switch BOOLEAN
);

-- Add any missing columns (if table exists but is missing columns)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='id') THEN
    ALTER TABLE responses ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='timestamp') THEN
    ALTER TABLE responses ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='school') THEN
    ALTER TABLE responses ADD COLUMN school TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='enrolled') THEN
    ALTER TABLE responses ADD COLUMN enrolled BOOLEAN NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='mbti') THEN
    ALTER TABLE responses ADD COLUMN mbti TEXT NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='college') THEN
    ALTER TABLE responses ADD COLUMN college TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='fit') THEN
    ALTER TABLE responses ADD COLUMN fit BOOLEAN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='responses' AND column_name='would_switch') THEN
    ALTER TABLE responses ADD COLUMN would_switch BOOLEAN;
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to update them)
DROP POLICY IF EXISTS "Allow public insert" ON responses;
DROP POLICY IF EXISTS "Allow public read" ON responses;

-- Create policies for public access
CREATE POLICY "Allow public insert" ON responses
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read" ON responses
  FOR SELECT
  TO public
  USING (true);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_mbti ON responses(mbti);
CREATE INDEX IF NOT EXISTS idx_college ON responses(college);
CREATE INDEX IF NOT EXISTS idx_enrolled ON responses(enrolled);
CREATE INDEX IF NOT EXISTS idx_mbti_college ON responses(mbti, college);

-- Verify table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'responses'
ORDER BY ordinal_position;
