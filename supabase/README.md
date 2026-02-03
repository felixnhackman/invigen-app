# Supabase setup

## Run the profiles migration

1. Open your project in [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.
2. Copy the contents of `migrations/00001_create_profiles.sql` and run it.

Or, if you use the Supabase CLI:

```bash
supabase db push
```

## What the migration does

- **`public.profiles`** table: `id` (uuid, FK to `auth.users`), `full_name`, `avatar_url`, `phone`, `updated_at`, `created_at`.
- **RLS**: Users can only select/update/insert their own row.
- **Trigger**: When a new user signs up, a profile row is created with `full_name` and `avatar_url` from `user_metadata`.

## Storage bucket for profile photos (fixes "Bucket not found")

Create the bucket in the Supabase Dashboard; the app cannot create it for you.

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Storage** in the left sidebar.
3. Click **New bucket**.
4. **Name:** `avatars` (must be exactly this).
5. Turn **Public bucket** ON (so profile photos load without signed URLs).
6. Click **Create bucket**.
7. (Optional) Add a policy so only logged-in users can upload:
   - Click the `avatars` bucket → **Policies** → **New policy**.
   - Or use "For full customization": **Policy name** e.g. `Users can upload own avatar`, **Allowed operation** INSERT, **Target** All, **WITH CHECK expression**:  
     `(storage.foldername(name))[1] = auth.uid()::text`  
   - This restricts uploads to the path `{user_id}/...` so users only upload their own avatar.

After the bucket exists, **add Storage RLS policies** or you may get "new row violates row-level security policy" on upload:

- In **SQL Editor**, run the contents of `migrations/00003_storage_avatars_policies.sql`.  
  That allows authenticated users to upload/update/delete only under `avatars/{their_user_id}/...` and allows public read.

After the bucket exists and these policies are in place, profile photo upload will work.
