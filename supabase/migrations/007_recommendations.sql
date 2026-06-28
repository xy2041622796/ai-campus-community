-- 007_recommendations.sql
-- Find similar users based on interest tags and college

CREATE OR REPLACE FUNCTION get_recommended_users(
  current_user_id UUID,
  match_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  avatar_url TEXT,
  college TEXT,
  grade TEXT,
  bio TEXT,
  interest_tags TEXT[],
  common_tags INT,
  same_college BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_college TEXT;
  user_tags TEXT[];
BEGIN
  -- Get current user's info
  SELECT p.college, p.interest_tags INTO user_college, user_tags
  FROM profiles p WHERE p.id = current_user_id;

  RETURN QUERY
  SELECT
    p.id,
    p.nickname,
    p.avatar_url,
    p.college,
    p.grade,
    p.bio,
    p.interest_tags,
    COALESCE(
      (SELECT COUNT(*) FROM unnest(p.interest_tags) AS t
       WHERE t = ANY(COALESCE(user_tags, ARRAY[]::TEXT[]))),
      0
    )::INT AS common_tags,
    (p.college = user_college) AS same_college
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.id NOT IN (
      SELECT following_id FROM follows WHERE follower_id = current_user_id
    )
  ORDER BY
    same_college DESC,
    common_tags DESC,
    p.created_at DESC
  LIMIT match_limit;
END;
$$;
