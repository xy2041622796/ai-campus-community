-- 012_post_semantic_structure.sql
-- 给 posts 表增加 AI 语义结构化字段

-- 添加新列到 posts 表
ALTER TABLE posts ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS emotion TEXT DEFAULT NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT NULL;

-- 更新 updated_at 触发器（已有）

-- 索引
CREATE INDEX IF NOT EXISTS idx_posts_intent ON posts(intent);
CREATE INDEX IF NOT EXISTS idx_posts_emotion ON posts(emotion);
CREATE INDEX IF NOT EXISTS idx_posts_topics ON posts USING GIN(topics);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- 已有 posts 的 RLS 策略，不需要额外添加

-- 创建函数：按意图筛选帖子
CREATE OR REPLACE FUNCTION filter_posts_by_intent(
  intent_type TEXT DEFAULT NULL,
  match_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  intent TEXT,
  emotion TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  author_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.content, p.intent, p.emotion, p.tags, p.created_at, p.author_id
  FROM posts p
  WHERE (intent_type IS NULL OR p.intent = intent_type)
  ORDER BY p.created_at DESC
  LIMIT match_limit;
END;
$$;

-- 创建函数：按情绪筛选帖子
CREATE OR REPLACE FUNCTION filter_posts_by_emotion(
  emotion_type TEXT DEFAULT NULL,
  match_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  intent TEXT,
  emotion TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  author_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.content, p.intent, p.emotion, p.tags, p.created_at, p.author_id
  FROM posts p
  WHERE (emotion_type IS NULL OR p.emotion = emotion_type)
  ORDER BY p.created_at DESC
  LIMIT match_limit;
END;
$$;
