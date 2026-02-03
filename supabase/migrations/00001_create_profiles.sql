-- Profiles table: one row per auth user
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Helper: check if id exists in auth.users (SECURITY DEFINER so policy can use it without direct access to auth.users)
create or replace function public.auth_user_exists(profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from auth.users u where u.id = profile_id);
$$;

-- Allow insert: own profile (auth.uid() = id) OR trigger context (auth.uid() null, id exists in auth.users)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (
    auth.uid() = id
    or (auth.uid() is null and public.auth_user_exists(id))
  );

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
