-- Add business_info column to profiles table for PRO users
-- This stores business information that can be auto-filled on invoice creation

alter table public.profiles
add column if not exists business_info jsonb default null;

-- Add comment
comment on column public.profiles.business_info is 'Business information for PRO users (business name, address, phone, email, etc.)';
