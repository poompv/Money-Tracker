-- Money Tracker schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses `create table if not exists` / `drop ... if exists` guards.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  icon text,
  color text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  type text not null check (type in ('expense', 'income')),
  amount numeric(12, 2) not null check (amount > 0),
  occurred_on date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  month date not null,
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

create index if not exists transactions_user_day_idx
  on public.transactions (user_id, occurred_on);
create index if not exists transactions_user_category_idx
  on public.transactions (user_id, category_id);
create index if not exists budgets_user_month_idx
  on public.budgets (user_id, month);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);
drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);
drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id);
drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own" on public.budgets
  for select using (auth.uid() = user_id);
drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own" on public.budgets
  for insert with check (auth.uid() = user_id);
drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own" on public.budgets
  for update using (auth.uid() = user_id);
drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own" on public.budgets
  for delete using (auth.uid() = user_id);

-- ============================================================
-- New user seeding: profile row + default Thai categories
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);

  insert into public.categories (user_id, name, type, icon, sort_order, is_default)
  values
    (new.id, 'อาหาร', 'expense', '🍔', 1, true),
    (new.id, 'เดินทาง', 'expense', '🚗', 2, true),
    (new.id, 'ที่พัก/บ้าน', 'expense', '🏠', 3, true),
    (new.id, 'ช้อปปิ้ง', 'expense', '🛍️', 4, true),
    (new.id, 'บันเทิง', 'expense', '🎬', 5, true),
    (new.id, 'สุขภาพ', 'expense', '💊', 6, true),
    (new.id, 'การศึกษา', 'expense', '📚', 7, true),
    (new.id, 'สาธารณูปโภค', 'expense', '💡', 8, true),
    (new.id, 'อื่นๆ', 'expense', '📦', 9, true),
    (new.id, 'เงินเดือน', 'income', '💰', 1, true),
    (new.id, 'รายได้พิเศษ', 'income', '💵', 2, true),
    (new.id, 'การลงทุน', 'income', '📈', 3, true),
    (new.id, 'อื่นๆ', 'income', '📦', 4, true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RPC: sum of expense transactions per category for a given month
-- ============================================================

create or replace function public.get_category_spend(p_month date)
returns table (category_id uuid, spent numeric)
language sql
security invoker
stable
as $$
  select t.category_id, sum(t.amount) as spent
  from public.transactions t
  where t.user_id = auth.uid()
    and t.type = 'expense'
    and t.category_id is not null
    and t.occurred_on >= date_trunc('month', p_month)::date
    and t.occurred_on < (date_trunc('month', p_month) + interval '1 month')::date
  group by t.category_id;
$$;
