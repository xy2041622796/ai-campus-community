-- pgvector search function
CREATE OR REPLACE FUNCTION search_posts(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  post_id UUID,
  similarity float,
  summary TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.post_id,
    1 - (pe.embedding <=> query_embedding) AS similarity,
    pe.summary
  FROM post_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
