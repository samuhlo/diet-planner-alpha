-- Migration: Add activity fields to user_profiles table
-- These fields are essential for the app's functionality (analysis, calculations, etc.)

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS steps INTEGER DEFAULT 15000,
ADD COLUMN IF NOT EXISTS does_strength_training BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS strength_training_days INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.steps IS 'Daily steps average for activity calculation';
COMMENT ON COLUMN user_profiles.does_strength_training IS 'Whether user does strength training';
COMMENT ON COLUMN user_profiles.strength_training_days IS 'Number of strength training days per week (0-4)';

-- Update existing rows to have default values if they have NULL
UPDATE user_profiles 
SET 
  steps = COALESCE(steps, 15000),
  does_strength_training = COALESCE(does_strength_training, FALSE),
  strength_training_days = COALESCE(strength_training_days, 0)
WHERE steps IS NULL OR does_strength_training IS NULL OR strength_training_days IS NULL; 