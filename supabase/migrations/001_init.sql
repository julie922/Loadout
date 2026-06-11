-- Enable RLS
alter table if exists public.profiles enable row level security;
alter table if exists public.favorites enable row level security;

-- Profiles table (one row per auth user)
create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  username        text not null,
  display_name    text,
  bio             text,
  avatar_url      text,
  favorite_genres text[] default '{}',
  platforms       text[] default '{}',
  member_since    timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Add missing columns to existing installations (idempotent)
alter table public.profiles add column if not exists display_name    text;
alter table public.profiles add column if not exists bio             text;
alter table public.profiles add column if not exists avatar_url      text;
alter table public.profiles add column if not exists favorite_genres text[] default '{}';
alter table public.profiles add column if not exists platforms       text[] default '{}';

-- Rename created_at → member_since if the old name still exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'profiles'
      and column_name  = 'created_at'
  ) then
    alter table public.profiles rename column created_at to member_since;
  end if;
end $$;

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Favorites table
create table if not exists public.favorites (
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

-- Add game_genres to existing installations (idempotent)
alter table public.favorites add column if not exists game_genres text[];

-- RLS policies
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can read own favorites"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);
