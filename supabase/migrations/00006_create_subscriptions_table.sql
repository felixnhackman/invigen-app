-- Create subscriptions table for backend storage
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    plan text not null default 'free' check (plan in ('free', 'pro')),
    paystack_reference text,
    paystack_customer_code text,
    activated_at timestamptz,
    expires_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id)
);

-- Add index for faster queries
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_plan_idx on public.subscriptions(plan);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policy: Users can only see their own subscription
create policy "Users can view own subscription"
    on public.subscriptions for select
    using (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for backend)
-- Note: Backend uses service role key, so it bypasses RLS
-- But we still need a policy for direct user access

-- Create invoice_usage table for tracking invoice counts
create table if not exists public.invoice_usage (
    id uuid primary key default gen_random_uuid(),
    count integer not null default 0,
    limit_value integer,
    month integer not null,
    year integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add user_id column if it doesn't exist (for existing tables)
do $$
begin
    if not exists (
        select 1 from information_schema.columns 
        where table_schema = 'public' 
        and table_name = 'invoice_usage' 
        and column_name = 'user_id'
    ) then
        alter table public.invoice_usage
        add column user_id uuid references auth.users(id) on delete cascade;
        
        -- Make it not null after adding
        alter table public.invoice_usage
        alter column user_id set not null;
    end if;
end $$;

-- Add unique constraint if it doesn't exist
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'invoice_usage_user_id_month_year_key'
    ) then
        alter table public.invoice_usage
        add constraint invoice_usage_user_id_month_year_key unique(user_id, month, year);
    end if;
end $$;

-- Add index for faster queries
create index if not exists invoice_usage_user_id_idx on public.invoice_usage(user_id);
create index if not exists invoice_usage_month_year_idx on public.invoice_usage(month, year);

-- Enable RLS
alter table public.invoice_usage enable row level security;

-- Policy: Users can only see their own invoice usage
create policy "Users can view own invoice usage"
    on public.invoice_usage for select
    using (auth.uid() = user_id);
