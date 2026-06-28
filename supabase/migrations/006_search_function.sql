-- 006_search_function.sql
-- 使用 PostgreSQL 内置全文搜索，无需外部 embedding API

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- 搜索函数
CREATE OR REPLACE FUNCTION search_posts_text(
  search_query TEXT,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  images TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ,
  rank REAL
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
    ts_rank(to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.content, '')), plainto_tsquery('simple', search_query))::REAL AS rank
  FROM posts p
  WHERE to_tsvector('simple', coalesce(p.title, '') || ' ' || coalesce(p.content, '')) @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
