-- 016_social_graph.sql
-- AI 社交关系图谱：分析用户之间的关联

-- 用户关系表（存储关系类型和权重）
CREATE TABLE IF NOT EXISTS user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,  -- 'common_tags' | 'common_posts' | 'mutual_like' | 'same_college' | 'follower'
  strength REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b, relationship_type)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_rel_a ON user_relationships(user_a);
CREATE INDEX IF NOT EXISTS idx_user_rel_b ON user_relationships(user_b);
CREATE INDEX IF NOT EXISTS idx_user_rel_type ON user_relationships(relationship_type);

-- RLS
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view relationships" ON user_relationships
  FOR SELECT USING (true);
CREATE POLICY "System manages relationships" ON user_relationships
  FOR ALL USING (true);

-- 计算两个用户之间的关系
CREATE OR REPLACE FUNCTION analyze_user_relationship(
  user_a_id UUID,
  user_b_id UUID
) RETURNS TABLE (
  type TEXT,
  strength REAL,
  description TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  user_a_tags TEXT[];
  user_b_tags TEXT[];
  common_tags TEXT[];
  a_college TEXT;
  b_college TEXT;
  mutual_likes INT;
  follower_check BOOLEAN;
BEGIN
  -- 获取用户信息
  SELECT interest_tags, college INTO user_a_tags, a_college
  FROM profiles WHERE id = user_a_id;

  SELECT interest_tags, college INTO user_b_tags, b_college
  FROM profiles WHERE id = user_b_id;

  -- 1. 共同兴趣标签
  IF user_a_tags IS NOT NULL AND user_b_tags IS NOT NULL THEN
    SELECT ARRAY_AGG(DISTINCT tag) INTO common_tags
    FROM unnest(user_a_tags) AS tag
    WHERE tag = ANY(user_b_tags);

    IF common_tags IS NOT NULL AND array_length(common_tags, 1) > 0 THEN
      RETURN QUERY SELECT
        'common_tags',
        array_length(common_tags, 1) * 0.2,
        '共同兴趣：' || array_to_string(common_tags, '、');
    END IF;
  END IF;

  -- 2. 同一学院
  IF a_college IS NOT NULL AND b_college IS NOT NULL AND a_college = b_college THEN
    RETURN QUERY SELECT
      'same_college',
      0.3,
      '同学院：' || a_college;
  END IF;

  -- 3. 互相点赞过相同的帖子
  SELECT COUNT(*) INTO mutual_likes
  FROM (
    SELECT post_id FROM likes WHERE user_id = user_a_id
    INTERSECT
    SELECT post_id FROM likes WHERE user_id = user_b_id
  ) AS shared;

  IF mutual_likes > 0 THEN
    RETURN QUERY SELECT
      'mutual_like',
      LEAST(mutual_likes * 0.15, 0.5),
      '共同喜欢了 ' || mutual_likes || ' 篇帖子';
  END IF;

  -- 4. 关注关系
  IF EXISTS (
    SELECT 1 FROM follows
    WHERE follower_id = user_a_id AND following_id = user_b_id
  ) THEN
    RETURN QUERY SELECT
      'follower',
      0.4,
      'TA 关注了你';
  END IF;

  IF EXISTS (
    SELECT 1 FROM follows
    WHERE follower_id = user_b_id AND following_id = user_a_id
  ) THEN
    RETURN QUERY SELECT
      'mutual_follow',
      0.6,
      '你们互相关注';
  END IF;
END;
$$;

-- 获取用户的社交图谱（推荐详情）
CREATE OR REPLACE FUNCTION get_social_graph(
  target_user_id UUID,
  candidate_user_id UUID,
  limit_count INT DEFAULT 5
) RETURNS TABLE (
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  college TEXT,
  grade TEXT,
  bio TEXT,
  interest_tags TEXT[],
  relationships TEXT[],
  total_strength REAL
) LANGUAGE plpgsql AS $$
DECLARE
  rel RECORD;
  rel_types TEXT[] := '{}';
  total REAL := 0;
  user_info RECORD;
BEGIN
  SELECT * INTO user_info FROM profiles WHERE id = candidate_user_id;

  FOR rel IN
    SELECT * FROM analyze_user_relationship(target_user_id, candidate_user_id)
    ORDER BY strength DESC
    LIMIT limit_count
  LOOP
    rel_types := rel_types || ARRAY[rel.type];
    total := total + rel.strength;
  END LOOP;

  RETURN QUERY SELECT
    user_info.id,
    user_info.nickname,
    user_info.avatar_url,
    user_info.college,
    user_info.grade,
    user_info.bio,
    user_info.interest_tags,
    rel_types,
    total;
END;
$$;



-- 批量分析多个用户的关系（用于推荐列表一次性查询）
CREATE OR REPLACE FUNCTION batch_analyze_relationships(
  target_user_id UUID,
  candidate_ids UUID[]
) RETURNS TABLE (
  user_id UUID,
  relationships TEXT[],
  total_strength REAL
) LANGUAGE plpgsql AS $$
DECLARE
  rel RECORD;
  rel_types TEXT[];
  total REAL;
  cand_id UUID;
BEGIN
  FOREACH cand_id IN ARRAY candidate_ids
  LOOP
    rel_types := '{}';
    total := 0;

    FOR rel IN
      SELECT * FROM analyze_user_relationship(target_user_id, cand_id)
      ORDER BY strength DESC
    LOOP
      rel_types := rel_types || ARRAY[rel.type];
      total := total + rel.strength;
    END LOOP;

    RETURN QUERY SELECT cand_id, rel_types, total;
  END LOOP;
END;
$$;
