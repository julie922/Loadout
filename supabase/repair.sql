-- ============================================================
-- Loadout DB repair — paste this entire file into:
--   Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ── 1. FAVORITES ────────────────────────────────────────────
-- The current favorites table has the wrong structure.
-- Drop it (favorites can be re-added by the user) and recreate.

DROP TABLE IF EXISTS public.favorites;

CREATE TABLE public.favorites (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users on delete cascade not null,
  game_id     integer not null,
  game_slug   text not null,
  game_name   text not null,
  game_cover  text,
  game_rating numeric(3,1),
  game_genres text[],
  created_at  timestamptz default now() not null,
  unique (user_id, game_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);


-- ── 2. PROFILES — add missing columns (data preserved) ──────

-- Rename created_at → member_since if the old column still exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'created_at'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN created_at TO member_since;
  END IF;
END $$;

-- Add member_since if it is still missing (first-time setup)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_since    timestamptz default now() not null;

-- Add all other new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name    text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio             text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url      text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_genres text[] default '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS platforms       text[] default '{}';


-- ── 3. Auto-create profile trigger (safe to re-run) ─────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── 4. Reload PostgREST schema cache ────────────────────────
SELECT pg_notify('pgrst', 'reload schema');
