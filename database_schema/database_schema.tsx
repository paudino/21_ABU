
export const databaseSchema = `
-- ============================================================================
-- ⚠️ ESEGUI QUESTO SCRIPT NEL 'SQL EDITOR' DI SUPABASE ⚠️
-- Ripristina la compatibilità con l'applicazione.
-- ============================================================================

-- 1. UTENTI
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ARTICOLI
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  category TEXT,
  title TEXT,
  summary TEXT,
  source TEXT,
  published_date TEXT,
  image_url TEXT,
  audio_base64 TEXT, -- Nome colonna standard senza underscore extra
  sentiment_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATEGORIE
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PREFERITI
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, article_id)
);

-- 5. COMMENTI & LIKES
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  username TEXT,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS dislikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, article_id)
);

-- 6. ISPIRAZIONE
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT UNIQUE NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS deeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- POLICIES (RLS) - Accesso garantito per test
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public users" ON users;
CREATE POLICY "Public users" ON users FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public articles" ON articles;
CREATE POLICY "Public articles" ON articles FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public favorites" ON favorites;
CREATE POLICY "Public favorites" ON favorites FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public categories" ON categories;
CREATE POLICY "Public categories" ON categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public comments" ON comments;
CREATE POLICY "Public comments" ON comments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public likes" ON likes;
CREATE POLICY "Public likes" ON likes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE dislikes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public dislikes" ON dislikes;
CREATE POLICY "Public dislikes" ON dislikes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public quotes" ON quotes;
CREATE POLICY "Public quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE deeds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public deeds" ON deeds;
CREATE POLICY "Public deeds" ON deeds FOR ALL USING (true) WITH CHECK (true);

SELECT 'Schema ripristinato correttamente.' as status;
`;
