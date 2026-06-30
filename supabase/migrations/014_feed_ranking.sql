-- 014_feed_ranking.sql (简化版)
-- AI Feed 重排序系统

-- 用户兴趣画像表
CREATE TABLE IF NOT EXISTS user_interest_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_intents TEXT[] DEFAULT '{}',
  preferred_emotions TEXT[] DEFAULT '{}',
  preferred_topics TEXT[] DEFAULT '{}',
  last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- 帖子排名分数缓存表
CREATE TABLE IF NOT EXISTS post_rank_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score REAL DEFAULT 0,
  matched_topics TEXT[],
  matched_intent BOOLEAN DEFAULT FALSE,
  matched_emotion BOOLEAN DEFAULT FALSE,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_interest_user ON user_interest_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_post_rank_post ON post_rank_score(post_id);
CREATE INDEX IF NOT EXISTS idx_post_rank_user ON post_rank_score(user_id);
CREATE INDEX IF NOT EXISTS idx_post_rank_score ON post_rank_score(score DESC);

-- RLS
ALTER TABLE user_interest_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_rank_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interest profile" ON user_interest_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage interest profile" ON user_interest_profile
  FOR ALL USING (true);

CREATE POLICY "Users can view own rank scores" ON post_rank_score
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage rank scores" ON post_rank_score
  FOR ALL USING (true);
