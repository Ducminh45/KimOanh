-- Users and auth-related tables
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verification_tokens_user ON email_verification_tokens(user_id, token_hash);

-- Profile and metrics
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('male','female','other')),
  birth_date DATE,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  goal TEXT CHECK (goal IN ('lose','maintain','gain')),
  activity_level TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  dietary_preferences JSONB,
  allergies JSONB,
  language TEXT,
  unit_system TEXT CHECK (unit_system IN ('metric','imperial')),
  notifications JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food database
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY,
  name_vi TEXT NOT NULL,
  name_en TEXT,
  category TEXT,
  serving_size_g NUMERIC(6,2),
  calories NUMERIC(6,2),
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  fiber_g NUMERIC(6,2)
);

CREATE INDEX IF NOT EXISTS idx_foods_name_vi ON foods(LOWER(name_vi));
CREATE INDEX IF NOT EXISTS idx_foods_name_en ON foods(LOWER(name_en));
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, food_id)
);

-- Food logs
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  quantity NUMERIC(8,2) DEFAULT 1,
  serving_size_g NUMERIC(6,2),
  calories NUMERIC(8,2),
  protein_g NUMERIC(8,2),
  carbs_g NUMERIC(8,2),
  fat_g NUMERIC(8,2),
  fiber_g NUMERIC(8,2),
  image_url TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_at DESC);

-- Water logs
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, logged_at DESC);

-- Exercise logs
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  duration_min INTEGER,
  intensity TEXT CHECK (intensity IN ('low','medium','high')),
  calories_burned NUMERIC(8,2),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON exercise_logs(user_id, logged_at DESC);

-- Weight logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, logged_at DESC);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user','assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_date ON chat_messages(user_id, created_at DESC);

-- Subscription (premium)
CREATE TABLE IF NOT EXISTS subscriptions (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('free','premium_monthly','premium_yearly')) DEFAULT 'free',
  renewed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Scan logs for enforcing free-tier limits
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_logs_user_date ON scan_logs(user_id, created_at DESC);

-- Social features
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_date ON posts(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id)
);

-- Challenges & Gamification
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  period TEXT CHECK (period IN ('weekly','monthly')) NOT NULL,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  goal_type TEXT,
  goal_value NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_challenges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress_value NUMERIC(10,2) DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, challenge_id)
);
