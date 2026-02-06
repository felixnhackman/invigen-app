-- Add products table for product catalog
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    name text not null,
    description text,
    price decimal(10, 2) not null default 0,
    currency text default 'GHS',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add foreign key constraint if it doesn't exist
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'products_user_id_fkey'
    ) then
        alter table public.products
        add constraint products_user_id_fkey 
        foreign key (user_id) references auth.users(id) on delete cascade;
    end if;
end $$;

-- Add index for faster queries
create index if not exists products_user_id_idx on public.products(user_id);

-- Enable RLS
alter table public.products enable row level security;

-- Drop existing policies if they exist (to allow re-running migration)
drop policy if exists "Users can view own products" on public.products;
drop policy if exists "Users can insert own products" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;

-- Policy: Users can only see their own products
create policy "Users can view own products"
    on public.products for select
    using (auth.uid() = user_id);

-- Policy: Users can insert their own products
create policy "Users can insert own products"
    on public.products for insert
    with check (auth.uid() = user_id);

-- Policy: Users can update their own products
create policy "Users can update own products"
    on public.products for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy: Users can delete their own products
create policy "Users can delete own products"
    on public.products for delete
    using (auth.uid() = user_id);

-- Add WhatsApp message template to profiles
alter table public.profiles
add column if not exists whatsapp_message_template text default null;

-- Add comment
comment on column public.profiles.whatsapp_message_template is 'Custom WhatsApp message template for invoice sharing';
