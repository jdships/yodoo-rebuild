-- Add subscription-related fields to the users table
-- Run this SQL in your Supabase SQL editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS polar_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'pro', 'unlimited')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_polar_customer_id ON users(polar_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update existing users to have default subscription values
UPDATE users 
SET subscription_type = 'free', subscription_status = 'inactive' 
WHERE subscription_type IS NULL OR subscription_status IS NULL;
