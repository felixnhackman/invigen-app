-- Fix invoice_usage table: Add missing columns and fix structure
-- This handles the case where the table was created incorrectly

do $$
begin
    -- Check if table exists
    if exists (
        select 1 from information_schema.tables 
        where table_schema = 'public' 
        and table_name = 'invoice_usage'
    ) then
        -- Add month column if missing
        if not exists (
            select 1 from information_schema.columns 
            where table_schema = 'public' 
            and table_name = 'invoice_usage' 
            and column_name = 'month'
        ) then
            alter table public.invoice_usage
            add column month integer;
            
            -- Set default to current month for existing rows
            update public.invoice_usage
            set month = extract(month from now())
            where month is null;
            
            -- Make it not null
            alter table public.invoice_usage
            alter column month set not null;
        end if;
        
        -- Add year column if missing
        if not exists (
            select 1 from information_schema.columns 
            where table_schema = 'public' 
            and table_name = 'invoice_usage' 
            and column_name = 'year'
        ) then
            alter table public.invoice_usage
            add column year integer;
            
            -- Set default to current year for existing rows
            update public.invoice_usage
            set year = extract(year from now())
            where year is null;
            
            -- Make it not null
            alter table public.invoice_usage
            alter column year set not null;
        end if;
        
        -- Add user_id column if missing
        if not exists (
            select 1 from information_schema.columns 
            where table_schema = 'public' 
            and table_name = 'invoice_usage' 
            and column_name = 'user_id'
        ) then
            alter table public.invoice_usage
            add column user_id uuid;
            
            -- Add foreign key constraint
            alter table public.invoice_usage
            add constraint invoice_usage_user_id_fkey 
            foreign key (user_id) references auth.users(id) on delete cascade;
            
            -- Note: If you have existing rows without user_id, you'll need to delete them
            -- or assign them to a user. For now, we'll delete orphaned rows.
            delete from public.invoice_usage where user_id is null;
            
            -- Make it not null after cleaning up
            alter table public.invoice_usage
            alter column user_id set not null;
        end if;
        
        -- Drop existing unique constraints that might conflict
        alter table public.invoice_usage
        drop constraint if exists invoice_usage_month_year_key;
        
        alter table public.invoice_usage
        drop constraint if exists invoice_usage_user_id_month_year_key;
        
        -- Add correct unique constraint
        if not exists (
            select 1 from pg_constraint 
            where conname = 'invoice_usage_user_id_month_year_key'
        ) then
            alter table public.invoice_usage
            add constraint invoice_usage_user_id_month_year_key unique(user_id, month, year);
        end if;
        
        -- Add indexes if they don't exist
        create index if not exists invoice_usage_user_id_idx on public.invoice_usage(user_id);
        create index if not exists invoice_usage_month_year_idx on public.invoice_usage(month, year);
    end if;
end $$;

-- If table doesn't exist at all, create it properly
create table if not exists public.invoice_usage (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    count integer not null default 0,
    limit_value integer,
    month integer not null,
    year integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, month, year)
);

-- Add indexes
create index if not exists invoice_usage_user_id_idx on public.invoice_usage(user_id);
create index if not exists invoice_usage_month_year_idx on public.invoice_usage(month, year);

-- Enable RLS
alter table public.invoice_usage enable row level security;

-- Drop and recreate policy to ensure it's correct
drop policy if exists "Users can view own invoice usage" on public.invoice_usage;

create policy "Users can view own invoice usage"
    on public.invoice_usage for select
    using (auth.uid() = user_id);
