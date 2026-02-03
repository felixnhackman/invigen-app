-- Fix: "permission denied for table users" - policy must not query auth.users directly.
-- Use a SECURITY DEFINER function so the check runs with elevated privileges.

create or replace function public.auth_user_exists(profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from auth.users u where u.id = profile_id);
$$;

drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (
    auth.uid() = id
    or (auth.uid() is null and public.auth_user_exists(id))
  );
