begin;

create table if not exists public.grade5_plan_configuration (
  code text primary key,
  price_jmd numeric(12,2) not null check (price_jmd >= 0),
  duration_months integer not null default 0 check (duration_months >= 0),
  duration_days integer not null default 0 check (duration_days >= 0),
  max_students integer not null check (max_students between 1 and 4),
  is_public boolean not null default true,
  check ((duration_months = 0) <> (duration_days = 0) or code = 'free')
);

alter table public.grade5_plan_configuration enable row level security;

insert into public.grade5_plan_configuration
  (code, price_jmd, duration_months, duration_days, max_students, is_public)
values
  ('free', 0, 0, 0, 1, true),
  ('standard_weekly', 1000, 0, 7, 1, true),
  ('standard_monthly', 3000, 1, 0, 1, true),
  ('standard_yearly', 30000, 12, 0, 1, true),
  ('premium_family_monthly', 10000, 1, 0, 4, true),
  ('premium_family_yearly', 100000, 12, 0, 4, true)
on conflict (code) do update set
  price_jmd = excluded.price_jmd,
  duration_months = excluded.duration_months,
  duration_days = excluded.duration_days,
  max_students = excluded.max_students,
  is_public = excluded.is_public;

alter table public.payments
  add column if not exists currency text not null default 'JMD',
  add column if not exists paid_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id),
  add column if not exists expected_amount_jmd numeric(12,2),
  add column if not exists actual_amount_jmd numeric(12,2),
  add column if not exists offline_reference text,
  add column if not exists receipt_number text,
  add column if not exists activated_at timestamptz,
  add column if not exists student_ids uuid[];

create unique index if not exists payments_offline_reference_unique
  on public.payments (lower(offline_reference))
  where offline_reference is not null;
create unique index if not exists payments_receipt_number_unique
  on public.payments (receipt_number)
  where receipt_number is not null;

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  administrator_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;

do $$
declare constraint_row record;
begin
  for constraint_row in
    select conrelid::regclass as table_name, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('public.payments'::regclass, 'public.subscriptions'::regclass, 'public.pricing_plans'::regclass)
      and (
        pg_get_constraintdef(oid) ilike '%plan_code%'
        or (conrelid = 'public.pricing_plans'::regclass and pg_get_constraintdef(oid) ilike '%code%')
      )
  loop
    execute format('alter table %s drop constraint %I', constraint_row.table_name, constraint_row.conname);
  end loop;
end $$;

alter table public.payments add constraint payments_plan_code_valid check (
  plan_code in ('free','standard_weekly','standard_monthly','standard_yearly','premium_family_monthly','premium_family_yearly')
);
alter table public.subscriptions add constraint subscriptions_plan_code_valid check (
  plan_code in ('free','standard_weekly','standard_monthly','standard_yearly','premium_family_monthly','premium_family_yearly')
);
alter table public.pricing_plans add constraint pricing_plans_code_valid check (
  code in ('free','standard_weekly','standard_monthly','standard_yearly','premium_family_monthly','premium_family_yearly')
);

revoke update on public.payments from anon, authenticated;
revoke delete on public.payments from anon, authenticated;
drop policy if exists "payments_update_own" on public.payments;
drop policy if exists "Users can update own payments" on public.payments;
drop policy if exists "payments_insert_own" on public.payments;
drop policy if exists "Users can insert own payments" on public.payments;
create policy "payments_insert_own" on public.payments
  for insert to authenticated
  with check (
    (select auth.uid()) = parent_id
    and method = 'bank_transfer'
    and status = 'pending'
    and verified_at is null
    and verified_by is null
    and activated_at is null
    and offline_reference is null
    and receipt_number is null
    and expected_amount_jmd is null
    and actual_amount_jmd is null
    and paid_at is null
  );

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.activate_grade5_payment(
  p_payment_id uuid,
  p_administrator_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, app_private
as $$
declare
  payment_row public.payments%rowtype;
  plan_row public.grade5_plan_configuration%rowtype;
  base_at timestamptz;
  expiry_at timestamptz;
  subscription_id uuid;
  receipt text;
begin
  select * into payment_row from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Payment not found'; end if;

  if payment_row.activated_at is not null then
    return jsonb_build_object('paymentId', payment_row.id, 'receiptNumber', payment_row.receipt_number, 'idempotent', true);
  end if;

  perform pg_advisory_xact_lock(hashtextextended(payment_row.parent_id::text || ':grade5', 0));

  select * into plan_row from public.grade5_plan_configuration where code = payment_row.plan_code;
  if not found or payment_row.grade <> 'grade5' then raise exception 'Unsupported Grade 5 plan'; end if;

  if coalesce(payment_row.actual_amount_jmd, payment_row.amount_jmd) <> plan_row.price_jmd then
    raise exception 'Actual amount does not match authoritative plan price';
  end if;

  select greatest(clock_timestamp(), coalesce(max(expires_at), clock_timestamp()))
    into base_at
    from public.subscriptions
   where parent_id = payment_row.parent_id
     and grade = 'grade5'
     and status = 'active'
     and expires_at > clock_timestamp();

  expiry_at := base_at
    + make_interval(months => plan_row.duration_months)
    + make_interval(days => plan_row.duration_days);
  receipt := 'G5-' || upper(substr(replace(payment_row.id::text, '-', ''), 1, 16));

  insert into public.subscriptions
    (parent_id, grade, plan_code, status, starts_at, expires_at, max_students, payment_id)
  values
    (payment_row.parent_id, 'grade5', payment_row.plan_code, 'active', base_at, expiry_at, plan_row.max_students, payment_row.id)
  returning id into subscription_id;

  update public.payments set
    status = 'verified',
    verified_at = coalesce(verified_at, clock_timestamp()),
    verified_by = p_administrator_id,
    expected_amount_jmd = plan_row.price_jmd,
    actual_amount_jmd = coalesce(actual_amount_jmd, amount_jmd),
    currency = coalesce(currency, 'JMD'),
    activated_at = clock_timestamp(),
    receipt_number = receipt,
    rejection_reason = null
  where id = payment_row.id;

  insert into public.admin_audit_log (administrator_id, action, entity_type, entity_id, details)
  values (p_administrator_id, 'payment_activated', 'payment', payment_row.id,
    jsonb_build_object('subscriptionId', subscription_id, 'planCode', payment_row.plan_code,
      'startsAt', base_at, 'expiresAt', expiry_at, 'receiptNumber', receipt));

  return jsonb_build_object('paymentId', payment_row.id, 'subscriptionId', subscription_id,
    'startsAt', base_at, 'expiresAt', expiry_at, 'receiptNumber', receipt, 'idempotent', false);
end;
$$;

create or replace function public.admin_activate_grade5_payment(p_payment_id uuid, p_administrator_id uuid)
returns jsonb language sql security definer set search_path = pg_catalog, public, app_private
as $$ select app_private.activate_grade5_payment(p_payment_id, p_administrator_id) $$;

create or replace function public.admin_record_grade5_cash_payment(
  p_parent_id uuid,
  p_plan_code text,
  p_actual_amount_jmd numeric,
  p_currency text,
  p_paid_at timestamptz,
  p_offline_reference text,
  p_administrator_id uuid,
  p_note text default null,
  p_student_ids uuid[] default null
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public, app_private
as $$
declare payment_id uuid; existing_id uuid; plan_price numeric;
begin
  if nullif(btrim(p_offline_reference), '') is null then raise exception 'Offline reference is required'; end if;
  if upper(p_currency) <> 'JMD' then raise exception 'Offline Cash currency must be JMD'; end if;
  select id into existing_id from public.payments where lower(offline_reference) = lower(btrim(p_offline_reference));
  if existing_id is not null then return app_private.activate_grade5_payment(existing_id, p_administrator_id); end if;

  select price_jmd into plan_price from public.grade5_plan_configuration where code = p_plan_code;
  if plan_price is null then raise exception 'Unsupported Grade 5 plan'; end if;
  if cardinality(coalesce(p_student_ids, '{}'::uuid[])) >
     (select max_students from public.grade5_plan_configuration where code = p_plan_code) then
    raise exception 'Student audit exceeds plan entitlement';
  end if;
  if exists (
    select 1 from unnest(coalesce(p_student_ids, '{}'::uuid[])) selected_id
    where not exists (
      select 1 from public.students
      where id = selected_id and parent_id = p_parent_id and grade_level = 5
    )
  ) then raise exception 'Student audit does not belong to parent'; end if;

  insert into public.payments
    (parent_id, grade, plan_code, amount_jmd, method, reference_code, offline_reference,
     note, status, currency, paid_at, expected_amount_jmd, actual_amount_jmd, verified_by, student_ids)
  values
    (p_parent_id, 'grade5', p_plan_code, plan_price, 'cash', btrim(p_offline_reference), btrim(p_offline_reference),
     p_note, 'pending', upper(p_currency), p_paid_at, plan_price, p_actual_amount_jmd, p_administrator_id, p_student_ids)
  returning id into payment_id;

  insert into public.admin_audit_log (administrator_id, action, entity_type, entity_id, details)
  values (p_administrator_id, 'offline_cash_recorded', 'payment', payment_id,
    jsonb_build_object('reference', btrim(p_offline_reference), 'paidAt', p_paid_at,
      'currency', upper(p_currency), 'actualAmountJmd', p_actual_amount_jmd, 'studentIds', p_student_ids));

  return app_private.activate_grade5_payment(payment_id, p_administrator_id);
exception when unique_violation then
  select id into existing_id from public.payments where lower(offline_reference) = lower(btrim(p_offline_reference));
  return app_private.activate_grade5_payment(existing_id, p_administrator_id);
end;
$$;

revoke all on function public.admin_activate_grade5_payment(uuid, uuid) from public, anon, authenticated;
revoke all on function public.admin_record_grade5_cash_payment(uuid, text, numeric, text, timestamptz, text, uuid, text, uuid[]) from public, anon, authenticated;
grant execute on function public.admin_activate_grade5_payment(uuid, uuid) to service_role;
grant execute on function public.admin_record_grade5_cash_payment(uuid, text, numeric, text, timestamptz, text, uuid, text, uuid[]) to service_role;

insert into public.pricing_plans
  (code, grade, name, price_jmd, period, description, features, max_students, badge_text, popular, is_active)
values
  ('standard_yearly', 'grade5', 'Standard Yearly', 30000, 'per 12 months',
   'Full Grade 5 access for one student for 12 calendar months.',
   '["Full Grade 5 access","12 calendar months, prepaid","No automatic renewal","One student included"]'::jsonb,
   1, 'Yearly Value', false, true),
  ('premium_family_yearly', 'grade5', 'Premium Family Yearly', 100000, 'per 12 months',
   'Full Grade 5 access for up to 4 students for 12 calendar months.',
   '["Full Grade 5 access for up to 4 students","12 calendar months, prepaid","No automatic renewal","All premium resources included"]'::jsonb,
   4, null, false, true)
on conflict do nothing;

update public.pricing_plans target set
  name = source.name,
  price_jmd = source.price_jmd,
  period = source.period,
  description = source.description,
  features = source.features,
  max_students = source.max_students,
  badge_text = source.badge_text,
  popular = source.popular,
  is_active = source.is_active
from (values
  ('standard_yearly', 'grade5', 'Standard Yearly', 30000::numeric, 'per 12 months',
   'Full Grade 5 access for one student for 12 calendar months.',
   '["Full Grade 5 access","12 calendar months, prepaid","No automatic renewal","One student included"]'::jsonb,
   1, 'Yearly Value', false, true),
  ('premium_family_yearly', 'grade5', 'Premium Family Yearly', 100000::numeric, 'per 12 months',
   'Full Grade 5 access for up to 4 students for 12 calendar months.',
   '["Full Grade 5 access for up to 4 students","12 calendar months, prepaid","No automatic renewal","All premium resources included"]'::jsonb,
   4, null, false, true)
) as source(code, grade, name, price_jmd, period, description, features, max_students, badge_text, popular, is_active)
where target.code = source.code and target.grade = source.grade;

commit;
