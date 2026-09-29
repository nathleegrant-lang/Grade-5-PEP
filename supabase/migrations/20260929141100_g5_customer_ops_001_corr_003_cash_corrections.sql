-- G5-CUSTOMER-OPS-001-CORR-003 migration 2/5:
-- append-only Cash identity supersession and cross-namespace reference registry.

create table public.grade5_cash_reference_registry (
  reference_key text primary key,
  reference_value text not null,
  source_type text not null check (source_type in ('payment', 'correction')),
  source_id uuid not null,
  created_at timestamptz not null default clock_timestamp(),
  unique (source_type, source_id),
  check (reference_key = lower(reference_value))
);

alter table public.grade5_cash_reference_registry enable row level security;
revoke all on public.grade5_cash_reference_registry from public, anon, authenticated, service_role;

insert into public.grade5_cash_reference_registry
  (reference_key, reference_value, source_type, source_id, created_at)
select
  lower(p.offline_reference), p.offline_reference, 'payment', p.id,
  coalesce(p.activated_at, p.verified_at, p.submitted_at, clock_timestamp())
from public.payments p
where p.grade = 'grade5'
  and p.method = 'cash'
  and p.offline_reference is not null
on conflict (reference_key) do nothing;

create or replace function app_private.register_grade5_cash_payment_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.grade = 'grade5' and new.method = 'cash' and new.offline_reference is not null then
    insert into public.grade5_cash_reference_registry
      (reference_key, reference_value, source_type, source_id)
    values (lower(new.offline_reference), new.offline_reference, 'payment', new.id)
    on conflict (reference_key) do nothing;

    if not exists (
      select 1 from public.grade5_cash_reference_registry r
      where r.reference_key = lower(new.offline_reference)
        and r.source_type = 'payment'
        and r.source_id = new.id
    ) then
      raise exception 'Cash reference collision' using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;

alter function app_private.register_grade5_cash_payment_reference() owner to postgres;
revoke all on function app_private.register_grade5_cash_payment_reference() from public, anon, authenticated;

drop trigger if exists register_grade5_cash_payment_reference on public.payments;
create trigger register_grade5_cash_payment_reference
after insert or update of offline_reference on public.payments
for each row execute function app_private.register_grade5_cash_payment_reference();

create table public.grade5_cash_payment_corrections (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete restrict,
  correction_type text not null default 'cash_business_date_reference_supersession'
    check (correction_type = 'cash_business_date_reference_supersession'),
  original_paid_at timestamptz,
  original_cash_business_date date,
  corrected_business_date date not null,
  original_reference text not null,
  corrected_reference text not null,
  reason text not null check (btrim(reason) <> ''),
  authorized_actor uuid not null references auth.users(id) on delete restrict,
  operation_key uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  unique (payment_id),
  unique (operation_key)
);

create unique index grade5_cash_payment_corrections_reference_unique
  on public.grade5_cash_payment_corrections (lower(corrected_reference));

alter table public.grade5_cash_payment_corrections enable row level security;
revoke all on public.grade5_cash_payment_corrections from public, anon, authenticated, service_role;
grant select on public.grade5_cash_payment_corrections to service_role;

create or replace function app_private.protect_grade5_append_only_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Grade 5 audit evidence is append-only' using errcode = '22000';
end;
$$;

alter function app_private.protect_grade5_append_only_audit() owner to postgres;
revoke all on function app_private.protect_grade5_append_only_audit() from public, anon, authenticated;

create trigger protect_grade5_cash_payment_corrections
before update or delete on public.grade5_cash_payment_corrections
for each row execute function app_private.protect_grade5_append_only_audit();

create or replace function app_private.register_grade5_cash_correction_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.grade5_cash_reference_registry
    (reference_key, reference_value, source_type, source_id)
  values (lower(new.corrected_reference), new.corrected_reference, 'correction', new.id)
  on conflict (reference_key) do nothing;

  if not exists (
    select 1 from public.grade5_cash_reference_registry r
    where r.reference_key = lower(new.corrected_reference)
      and r.source_type = 'correction'
      and r.source_id = new.id
  ) then
    raise exception 'Cash reference collision' using errcode = '23505';
  end if;
  return new;
end;
$$;

alter function app_private.register_grade5_cash_correction_reference() owner to postgres;
revoke all on function app_private.register_grade5_cash_correction_reference() from public, anon, authenticated;

create trigger register_grade5_cash_correction_reference
after insert on public.grade5_cash_payment_corrections
for each row execute function app_private.register_grade5_cash_correction_reference();

create or replace view public.grade5_payment_accounting_identity
with (security_invoker = true)
as
select
  p.*,
  coalesce(c.corrected_business_date, p.cash_business_date) as authoritative_business_date,
  coalesce(c.corrected_reference, p.offline_reference, p.reference_code) as authoritative_reference,
  case
    when c.id is not null then 'corrected'::text
    when p.method = 'cash' and p.cash_business_date is not null then 'new_date_contract'::text
    else 'legacy'::text
  end as identity_source,
  case when c.id is not null then c.original_reference else null end as historical_reference,
  c.created_at as correction_created_at
from public.payments p
left join public.grade5_cash_payment_corrections c on c.payment_id = p.id;

revoke all on public.grade5_payment_accounting_identity from public, anon, authenticated;
grant select on public.grade5_payment_accounting_identity to service_role;
