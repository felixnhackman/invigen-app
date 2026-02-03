-- Storage RLS: allow authenticated users to upload their own avatar (fixes "new row violates row-level security policy")
-- Run this in Supabase SQL Editor after creating the "avatars" bucket in Dashboard → Storage.

drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;

-- Allow authenticated users to INSERT into avatars bucket only under their own folder (path: {user_id}/...)
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read so profile photos can be displayed without signed URLs
create policy "Public read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- Allow authenticated users to UPDATE/DELETE their own file (replace or remove photo)
create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
