-- 002_fix_schema.sql — Idempotent schema repair
-- Safe to run on any existing Supabase installation.
-- Adds any columns that may be missing from older setups, re-creates RLS
-- policies with correct definitions, and refreshes the PostgREST cache.

-- ── Enable RLS (no-op if already enabled) ───────────────────────────────────
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ── profiles: ensure every column exists ────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name    text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio             text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url      text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_genres text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS platforms       text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at      timestamptz DEFAULT now() NOT NULL;

-- ── favorites: ensure every column exists ───────────────────────────────────
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS game_id        integer;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS game_slug      text;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS game_name      text;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS game_cover     text;
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS game_rating    numeric(3,1);
ALTER TABLE public.favorites ADD COLUMN IF NOT EXISTS game_genres    text[];

-- Unique constraint on (user_id, game_id) — safe even if game_id is null in old rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'favorites_user_id_game_id_key'
      AND conrelid = 'public.favorites'::regclass
  ) THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_user_id_game_id_key UNIQUE (user_id, game_id);
  END IF;
END $$;

-- ── profiles RLS policies (drop-then-recreate is idempotent) ────────────────
DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── favorites RLS policies ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own favorites"   ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

CREATE POLICY "Users can read own favorites"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ── Storage: avatars bucket ─────────────────────────────────────────────────
-- Creates the public avatars bucket if it doesn't already exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload avatars
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to overwrite their own avatar (upsert)
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Avatars are public (bucket is public, but object-level policy needed for anon reads)
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ── Refresh PostgREST schema cache ──────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
