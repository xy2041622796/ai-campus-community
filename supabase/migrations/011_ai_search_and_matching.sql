-- 011_ai_search_and_matching.sql
-- Semantic search using pgvector

-- Semantic search function (uses post_embeddings table via vector cosine similarity)
CREATE OR REPLACE FUNCTION search_posts_semantic(
  query_embedding vector(384),
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  images TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ,
  similarity REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.images,
    p.tags,
    p.created_at,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM post_embeddings pe
  JOIN posts p ON p.id = pe.post_id
  WHERE pe.embedding IS NOT NULL
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to check if user is alumni (same college)
CREATE OR REPLACE FUNCTION get_alumni(
  current_user_id UUID,
  match_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  avatar_url TEXT,
  college TEXT,
  grade TEXT,
  bio TEXT,
  interest_tags TEXT[],
  same_college BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_college TEXT;
BEGIN
  SELECT p.college INTO user_college FROM profiles p WHERE p.id = current_user_id;

  RETURN QUERY
  SELECT
    p.id, p.nickname, p.avatar_url, p.college, p.grade, p.bio, p.interest_tags,
    (p.college = user_college) AS same_college
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.college = user_college
    AND p.id NOT IN (
      SELECT following_id FROM follows WHERE follower_id = current_user_id
    )
  ORDER BY p.created_at DESC
  LIMIT match_limit;
END;
$$;

-- Weather-based activity suggestion function
CREATE OR REPLACE FUNCTION suggest_activities_by_season(
  current_month INT
)
RETURNS TABLE (
  suggestion_type TEXT,
  title TEXT,
  description TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Return season-appropriate activity suggestions
  IF current_month BETWEEN 3 AND 5 THEN
    RETURN QUERY VALUES
      ('outdoor', '春游踏青', '春天到了，组织一次校园春游吧！'),
      ('sports', '春季运动会', '春暖花开，适合运动的好季节'),
      ('study', '期中复习小组', '期中将至，组队复习效率更高');
  ELSIF current_month BETWEEN 6 AND 8 THEN
    RETURN QUERY VALUES
      ('outdoor', '夏日晚会', '在操场办一场夏日音乐晚会'),
      ('study', '期末复习打卡', '期末冲刺，一起自习互相督促'),
      ('social', '毕业季活动', '毕业季校友交流会，留下美好回忆');
  ELSIF current_month BETWEEN 9 AND 11 THEN
    RETURN QUERY VALUES
      ('club', '社团招新', '新学期社团招新季，寻找志同道合的伙伴'),
      ('study', '新生指南分享', '学长学姐分享校园生活经验'),
      ('sports', '秋季运动会', '秋高气爽，运动正当时');
  ELSE
    RETURN QUERY VALUES
      ('social', '元旦晚会', '跨年晚会，一起迎接新年'),
      ('study', '期末复习小组', '寒冬自习，组队冲刺期末'),
      ('outdoor', '冬日暖阳活动', '冬日户外拓展，暖身又暖心');
  END IF;
END;
$$;
