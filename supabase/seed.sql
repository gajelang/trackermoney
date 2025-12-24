-- Seed data for the money tracker app.
-- NOTE: The app generates a random user id in localStorage.
-- To see this seed data, set localStorage "money-tracker-user-id"
-- to the user id below or update initializeUser to use it.

do $$
declare
  demo_user_id uuid := '11111111-1111-1111-1111-111111111111';
  personal_source_id uuid := '22222222-2222-2222-2222-222222222222';
  company_source_id uuid := '33333333-3333-3333-3333-333333333333';
  transfer_group_id uuid := '44444444-4444-4444-4444-444444444444';
  food_category_id uuid := '55555555-5555-5555-5555-555555555555';
  salary_category_id uuid := '66666666-6666-6666-6666-666666666666';
begin
  insert into users (id, email, created_at)
  values (demo_user_id, 'demo@moneytracker.app', extract(epoch from now())::bigint * 1000)
  on conflict (id) do nothing;

  insert into money_sources (id, user_id, name, owner_type, currency, initial_amount, created_at)
  values
    (personal_source_id, demo_user_id, 'Cash Wallet', 'personal', 'IDR', 250000, extract(epoch from now())::bigint * 1000),
    (company_source_id, demo_user_id, 'Company Account', 'company', 'IDR', 1000000, extract(epoch from now())::bigint * 1000)
  on conflict (id) do nothing;

  insert into categories (id, user_id, name, kind, created_at)
  values
    (food_category_id, demo_user_id, 'Food', 'expense', extract(epoch from now())::bigint * 1000),
    (salary_category_id, demo_user_id, 'Salary', 'income', extract(epoch from now())::bigint * 1000)
  on conflict (id) do nothing;

  insert into transfer_groups (id, user_id, created_at)
  values (transfer_group_id, demo_user_id, extract(epoch from now())::bigint * 1000)
  on conflict (id) do nothing;

  insert into transactions (id, user_id, source_id, category_id, transfer_group_id, kind, amount_signed, occurred_at, note, include_in_cashflow, created_at)
  values
    ('77777777-7777-7777-7777-777777777777', demo_user_id, personal_source_id, food_category_id, null, 'expense', -50000, extract(epoch from now())::bigint * 1000, 'Lunch', true, extract(epoch from now())::bigint * 1000),
    ('88888888-8888-8888-8888-888888888888', demo_user_id, company_source_id, salary_category_id, null, 'income', 2000000, extract(epoch from now())::bigint * 1000, 'Monthly income', true, extract(epoch from now())::bigint * 1000),
    ('99999999-9999-9999-9999-999999999999', demo_user_id, personal_source_id, null, transfer_group_id, 'transfer', -150000, extract(epoch from now())::bigint * 1000, 'Transfer to company', true, extract(epoch from now())::bigint * 1000),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', demo_user_id, company_source_id, null, transfer_group_id, 'transfer', 150000, extract(epoch from now())::bigint * 1000, 'Transfer from personal', true, extract(epoch from now())::bigint * 1000)
  on conflict (id) do nothing;

end $$;
