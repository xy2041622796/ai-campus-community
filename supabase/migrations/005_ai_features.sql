-- 005_ai_features.sql
-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Post embeddings for semantic search
CREATE TABLE IF NOT EXISTS post_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE UNIQUE,
  embedding vector(384),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User embeddings for matching
CREATE TABLE IF NOT EXISTS user_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  embedding vector(384),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated tags for posts
CREATE TABLE IF NOT EXISTS post_ai_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  confidence REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, tag)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_post_embeddings_post ON post_embeddings(post_id);
CREATE INDEX IF NOT EXISTS idx_user_embeddings_user ON user_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_post_ai_tags_post ON post_ai_tags(post_id);

-- RLS
ALTER TABLE post_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;  
ALTER TABLE post_ai_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post embeddings viewable by everyone" ON post_embeddings FOR SELECT USING (true);
CREATE POLICY "System manage embeddings" ON post_embeddings FOR ALL USING (true);
CREATE POLICY "User embeddings viewable by everyone" ON user_embeddings FOR SELECT USING (true);
CREATE POLICY "System manage user embeddings" ON user_embeddings FOR ALL USING (true);
CREATE POLICY "AI tags viewable by everyone" ON post_ai_tags FOR SELECT USING (true);
CREATE POLICY "System manage AI tags" ON post_ai_tags FOR ALL USING (true);
