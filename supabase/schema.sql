-- Supabase Postgres schema for the money tracker app.
-- RLS is intentionally not enabled here. Enable it after adding Supabase Auth.

create table if not exists users (
  id uuid primary key,
  email text,
  created_at bigint not null
);

create table if not exists money_sources (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  owner_type text not null check (owner_type in ('personal', 'company')),
  currency text not null,
  color text not null default 'blue',
  initial_amount bigint not null,
  created_at bigint not null
);

create index if not exists money_sources_user_id_idx on money_sources(user_id);

create table if not exists categories (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  created_at bigint not null
);

create unique index if not exists categories_user_name_kind_idx on categories(user_id, name, kind);
create index if not exists categories_user_id_idx on categories(user_id);

create table if not exists transfer_groups (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  created_at bigint not null
);

create index if not exists transfer_groups_user_id_idx on transfer_groups(user_id);

create table if not exists transactions (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  source_id uuid not null references money_sources(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  transfer_group_id uuid references transfer_groups(id) on delete set null,
  kind text not null check (kind in ('income', 'expense', 'transfer', 'adjustment')),
  amount_signed bigint not null,
  occurred_at bigint not null,
  note text,
  include_in_cashflow boolean not null default true,
  created_at bigint not null
);

create index if not exists transactions_user_id_idx on transactions(user_id);
create index if not exists transactions_source_id_idx on transactions(source_id);
create index if not exists transactions_occurred_at_idx on transactions(occurred_at desc);

-- Enable RLS and policies for Supabase Auth.
alter table users enable row level security;
alter table money_sources enable row level security;
alter table categories enable row level security;
alter table transfer_groups enable row level security;
alter table transactions enable row level security;

create policy "users_select_own"
on users for select
using (id = auth.uid());

create policy "users_insert_own"
on users for insert
with check (id = auth.uid());

create policy "users_update_own"
on users for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "users_delete_own"
on users for delete
using (id = auth.uid());

create policy "money_sources_select_own"
on money_sources for select
using (user_id = auth.uid());

create policy "money_sources_insert_own"
on money_sources for insert
with check (user_id = auth.uid());

create policy "money_sources_update_own"
on money_sources for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "money_sources_delete_own"
on money_sources for delete
using (user_id = auth.uid());

create policy "categories_select_own"
on categories for select
using (user_id = auth.uid());

create policy "categories_insert_own"
on categories for insert
with check (user_id = auth.uid());

create policy "categories_update_own"
on categories for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "categories_delete_own"
on categories for delete
using (user_id = auth.uid());

create policy "transfer_groups_select_own"
on transfer_groups for select
using (user_id = auth.uid());

create policy "transfer_groups_insert_own"
on transfer_groups for insert
with check (user_id = auth.uid());

create policy "transfer_groups_update_own"
on transfer_groups for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "transfer_groups_delete_own"
on transfer_groups for delete
using (user_id = auth.uid());

create policy "transactions_select_own"
on transactions for select
using (user_id = auth.uid());

create policy "transactions_insert_own"
on transactions for insert
with check (user_id = auth.uid());

create policy "transactions_update_own"
on transactions for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "transactions_delete_own"
on transactions for delete
using (user_id = auth.uid());
