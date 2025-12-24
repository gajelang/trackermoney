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
