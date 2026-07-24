-- Run this whole file in Supabase Dashboard → SQL Editor → New query → Run.

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('demo','live')),
  balance numeric default 0,
  created_at timestamptz default now()
);

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('long','short')),
  entry numeric not null,
  exit numeric not null,
  qty numeric not null,
  pnl numeric not null,
  trade_date date not null,
  created_at timestamptz default now()
);

create table if not exists guard_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  loss_streak_limit int default 3,
  max_trades_per_day int default 10,
  daily_loss_limit numeric default 200,
  daily_profit_target numeric default 500,
  scanner_provider text default 'demo',
  provider_api_key text,
  ibkr_gateway_url text,
  updated_at timestamptz default now()
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table accounts enable row level security;
alter table trades enable row level security;
alter table guard_settings enable row level security;
alter table push_subscriptions enable row level security;

create policy "own accounts" on accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trades" on trades for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own guard settings" on guard_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own push subs" on push_subscriptions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
