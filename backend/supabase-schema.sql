-- =============================================
-- RETENTION APP - SUPABASE DATABASE SCHEMA
-- =============================================
-- Free Tier: 500MB storage, unlimited API requests
-- Enough for 5+ years of data easily!
-- 
-- To set up:
-- 1. Go to https://supabase.com and create a FREE account
-- 2. Create a new project
-- 3. Go to SQL Editor and run this entire script
-- 4. Copy your project URL and anon key to server.js
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'Learner',
  email TEXT,
  settings JSONB DEFAULT '{"theme": "dark", "notifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast device lookup
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);

-- =============================================
-- TOPICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT DEFAULT '',
  created_at DATE DEFAULT CURRENT_DATE,
  current_stage INTEGER DEFAULT 0 CHECK (current_stage >= 0 AND current_stage <= 3),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON topics(created_at);
CREATE INDEX IF NOT EXISTS idx_topics_completed ON topics(completed);

-- =============================================
-- REVIEWS TABLE (1-4-7 Schedule)
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  review_day INTEGER NOT NULL CHECK (review_day IN (1, 4, 7)),
  scheduled_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  UNIQUE(topic_id, review_day)
);

-- Indexes for review queries
CREATE INDEX IF NOT EXISTS idx_reviews_topic_id ON reviews(topic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_scheduled_date ON reviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_reviews_completed ON reviews(completed);

-- =============================================
-- STREAKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- =============================================
-- ACTIVITY LOG TABLE (for analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for efficient storage (optional for large scale)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for topics table
DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
-- For the anon key, we allow all operations (auth is done via device_id)
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON topics FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON streaks FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON activity_log FOR ALL USING (true);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
-- Uncomment to insert test data

/*
-- Insert test user
INSERT INTO users (device_id, name) 
VALUES ('test-device-123', 'Test User')
ON CONFLICT (device_id) DO NOTHING;

-- Get user ID for test data
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE device_id = 'test-device-123';
  
  -- Insert test topics
  INSERT INTO topics (id, user_id, title, category, priority, created_at)
  VALUES 
    (uuid_generate_v4(), test_user_id, 'React Hooks', 'tech', 'high', CURRENT_DATE),
    (uuid_generate_v4(), test_user_id, 'Spanish Vocabulary', 'language', 'medium', CURRENT_DATE - 1),
    (uuid_generate_v4(), test_user_id, 'Machine Learning Basics', 'study', 'high', CURRENT_DATE - 3);
END $$;
*/

-- =============================================
-- VIEWS (For easier queries)
-- =============================================

-- View: Today's reviews
CREATE OR REPLACE VIEW todays_reviews AS
SELECT 
  t.id as topic_id,
  t.title,
  t.category,
  t.priority,
  t.user_id,
  r.review_day,
  r.scheduled_date,
  r.completed
FROM topics t
JOIN reviews r ON t.id = r.topic_id
WHERE r.scheduled_date = CURRENT_DATE
  AND r.completed = FALSE
  AND t.completed = FALSE;

-- View: Overdue reviews
CREATE OR REPLACE VIEW overdue_reviews AS
SELECT 
  t.id as topic_id,
  t.title,
  t.category,
  t.priority,
  t.user_id,
  r.review_day,
  r.scheduled_date,
  CURRENT_DATE - r.scheduled_date as days_overdue
FROM topics t
JOIN reviews r ON t.id = r.topic_id
WHERE r.scheduled_date < CURRENT_DATE
  AND r.completed = FALSE
  AND t.completed = FALSE
ORDER BY r.scheduled_date ASC;

-- View: User stats
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id as user_id,
  u.device_id,
  COUNT(DISTINCT t.id) as total_topics,
  COUNT(DISTINCT CASE WHEN t.completed THEN t.id END) as mastered_topics,
  COALESCE(s.current_streak, 0) as current_streak,
  COALESCE(s.longest_streak, 0) as longest_streak
FROM users u
LEFT JOIN topics t ON u.id = t.user_id
LEFT JOIN streaks s ON u.id = s.user_id
GROUP BY u.id, u.device_id, s.current_streak, s.longest_streak;

-- =============================================
-- DATA RETENTION POLICY
-- =============================================
-- For 5+ years of data, the free tier is more than enough!
-- 
-- Estimated storage per user per year:
-- - ~100 topics × ~500 bytes = 50 KB
-- - ~300 reviews × ~200 bytes = 60 KB  
-- - ~1000 activity logs × ~300 bytes = 300 KB
-- Total: ~410 KB per user per year
-- 
-- 500 MB free tier = 1200+ user-years of data!
-- 
-- Optional: Clean up old activity logs after 1 year
-- CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM activity_log 
--   WHERE created_at < NOW() - INTERVAL '1 year';
-- END;
-- $$ LANGUAGE plpgsql;

-- =============================================
-- DONE! Your database is ready.
-- =============================================
-- Next steps:
-- 1. Copy your Supabase URL from Settings > API
-- 2. Copy your anon/public key from Settings > API
-- 3. Paste them in backend/server.js
-- 4. Run: npm install && npm start
-- =============================================
