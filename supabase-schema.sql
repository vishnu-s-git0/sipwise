-- ==============================================================================
-- Sipwise Specialty Coffee Platform — Supabase Database Schema
-- ==============================================================================
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Profiles (Public user metadata linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  city text default 'Bengaluru',
  favorite_brew text default 'Pour-Over (V60)',
  newsletter_subscribed boolean default true,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Automatically create a profile whenever a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, city, favorite_brew, newsletter_subscribed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Coffee Enthusiast'),
    coalesce(new.raw_user_meta_data->>'city', 'Bengaluru'),
    coalesce(new.raw_user_meta_data->>'favorite_brew', 'Pour-Over (V60)'),
    coalesce((new.raw_user_meta_data->>'newsletter_subscribed')::boolean, true)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new auth signups
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. Saved Recommendations / Bookmarks (Roasters, Beans, Gear)
create table if not exists public.saved_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_type text not null check (item_type in ('roaster', 'bean', 'gear', 'blog')),
  item_id text not null,
  item_title text not null,
  item_subtitle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, item_type, item_id)
);


-- 3. Community Reviews (Roasters & Beans)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  author_name text not null,
  target_type text not null check (target_type in ('roaster', 'bean')),
  target_id text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  brew_method text,
  title text not null,
  comment text not null,
  flavor_tags text[],
  helpful_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 4. Blog Posts (Optional remote storage for editorial articles)
create table if not exists public.blog_posts (
  id text primary key,
  title text not null,
  slug text unique not null,
  category text not null,
  author text not null,
  author_role text,
  read_time text not null,
  excerpt text not null,
  content text not null,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 5. Personal Tasting Journal & Cup Logger
create table if not exists public.brew_journal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  bag_id uuid references public.coffee_bags on delete set null,
  bean_name text not null,
  roaster_name text,
  gear_id text not null,
  gear_name text not null,
  dose_grams numeric(4,1) not null,
  water_grams numeric(5,1) not null,
  brew_time_seconds integer not null,
  grind_setting text,
  rating smallint not null check (rating >= 1 and rating <= 5),
  tasting_notes text,
  flavor_tags text[],
  extraction_result text default 'Sweet & Balanced',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. My Beans / Coffee Bags Inventory
create table if not exists public.coffee_bags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  coffee_id text,
  coffee_name text not null,
  roaster text not null,
  roast_date date not null,
  purchase_date date default current_date,
  initial_weight_grams numeric(6,1) default 250 not null,
  remaining_weight_grams numeric(6,1) default 250 not null,
  price_inr numeric(7,2),
  status text default 'active' check (status in ('active', 'finished', 'frozen')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. User Equipment Locker
create table if not exists public.user_equipment (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  equipment_type text not null check (equipment_type in ('grinder', 'brewer', 'scale', 'kettle')),
  name text not null,
  brand text,
  default_clicks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.saved_items enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.brew_journal enable row level security;
alter table public.coffee_bags enable row level security;
alter table public.user_equipment enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can update own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Saved Items Policies (Strictly private per user)
create policy "Users can view own saved items" 
  on public.saved_items for select using (auth.uid() = user_id);

create policy "Users can insert own saved items" 
  on public.saved_items for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved items" 
  on public.saved_items for delete using (auth.uid() = user_id);

-- Reviews Policies (Public read, authenticated write/edit)
create policy "Reviews are viewable by everyone" 
  on public.reviews for select using (true);

create policy "Authenticated users can submit reviews" 
  on public.reviews for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews" 
  on public.reviews for update using (auth.uid() = user_id);

create policy "Users can delete own reviews" 
  on public.reviews for delete using (auth.uid() = user_id);

-- Blog Posts Policies (Public read, admin write)
create policy "Blog posts are viewable by everyone" 
  on public.blog_posts for select using (true);

-- Brew Journal Policies (Strictly private per user)
create policy "Users can view own brew journal" 
  on public.brew_journal for select using (auth.uid() = user_id);

create policy "Users can insert into own brew journal" 
  on public.brew_journal for insert with check (auth.uid() = user_id);

create policy "Users can update own brew journal entries" 
  on public.brew_journal for update using (auth.uid() = user_id);

create policy "Users can delete own brew journal entries" 
  on public.brew_journal for delete using (auth.uid() = user_id);

-- Coffee Bags Policies (Strictly private per user)
create policy "Users can manage own coffee bags" 
  on public.coffee_bags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User Equipment Policies (Strictly private per user)
create policy "Users can manage own equipment" 
  on public.user_equipment for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
