-- 017_ai_logs.sql
-- AI 调用日志表

CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service TEXT NOT NULL,  -- 'coze' | 'agnes' | 'moderation'
  action TEXT NOT NULL,   -- 'analyze_post' | 'generate_tags' | 'moderate' | 'generate_digest' | 'generate_topic'
  latency_ms INT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_service ON ai_logs(service);
CREATE INDEX IF NOT EXISTS idx_ai_logs_action ON ai_logs(action);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_logs(created_at DESC);

-- RLS
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- 管理员可以查看所有日志
CREATE POLICY "System can insert logs" ON ai_logs
  FOR INSERT WITH CHECK (true);

-- 用户只能查看自己的日志
CREATE POLICY "Users can view own logs" ON ai_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 统计视图（用于仪表盘）
CREATE OR REPLACE VIEW ai_logs_stats AS
SELECT
  service,
  action,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE success = true) as success_count,
  COUNT(*) FILTER (WHERE success = false) as error_count,
  AVG(latency_ms) as avg_latency_ms,
  MAX(latency_ms) as max_latency_ms,
  DATE(created_at) as call_date
FROM ai_logs
GROUP BY service, action, DATE(created_at)
ORDER BY call_date DESC, total_calls DESC;
