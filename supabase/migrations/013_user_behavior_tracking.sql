-- 013_user_behavior_tracking.sql
-- 用户行为追踪表（用于 AI 画像）

CREATE TABLE IF NOT EXISTS user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL DEFAULT 'post',  -- 'post' | 'user' | 'event'
  target_id UUID,
  action_type TEXT NOT NULL,  -- 'read' | 'like' | 'comment' | 'follow' | 'favorite'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_target ON user_behavior(target_type, target_id);

-- RLS
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own behavior" ON user_behavior
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own behavior" ON user_behavior
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage behavior" ON user_behavior
  FOR ALL USING (true);
