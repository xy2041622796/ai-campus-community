-- 010_buddy_matching.sql
-- Find buddies by interest category

CREATE OR REPLACE FUNCTION find_buddies_by_tag(
  tag TEXT,
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
  interest_tags TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nickname, p.avatar_url, p.college, p.grade, p.bio, p.interest_tags
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.interest_tags IS NOT NULL
    AND tag = ANY(p.interest_tags)
    AND p.id NOT IN (
      SELECT following_id FROM follows WHERE follower_id = current_user_id
    )
  ORDER BY p.created_at DESC
  LIMIT match_limit;
END;
$$;

-- Get all unique interest tags across users
CREATE OR REPLACE FUNCTION get_all_interest_tags()
RETURNS TABLE (tag TEXT, user_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT unnest(p.interest_tags) AS tag, COUNT(DISTINCT p.id)::BIGINT AS user_count
  FROM profiles p
  WHERE p.interest_tags IS NOT NULL
  GROUP BY tag
  ORDER BY user_count DESC;
END;
$$;
