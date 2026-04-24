-- Create payments table to track all transactions
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paypal_order_id text not null unique,
  paypal_capture_id text,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount numeric(10,2) not null,
  currency text default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payer_email text,
  payer_name text,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.payments enable row level security;

-- Drop existing policies if they exist
drop policy if exists "payments_select_own" on public.payments;
drop policy if exists "payments_insert_own" on public.payments;

-- Create RLS policies (users can only view their own payments)
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_paypal_order_id_idx on public.payments(paypal_order_id);
