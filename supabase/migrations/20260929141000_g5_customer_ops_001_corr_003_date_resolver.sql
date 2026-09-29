-- G5-CUSTOMER-OPS-001-CORR-003 migration 1/5:
-- authoritative date-only Cash identity and accounting resolver foundation.

alter table public.payments
  add column if not exists cash_business_date date;

comment on column public.payments.cash_business_date is
  'Authoritative date the Cash was physically received. NULL means no date-only Cash contract was recorded.';

create or replace function app_private.protect_grade5_cash_payment_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.method = 'cash' and (
    new.offline_reference is distinct from old.offline_reference
    or new.reference_code is distinct from old.reference_code
    or new.offline_idempotency_key is distinct from old.offline_idempotency_key
    or new.cash_business_date is distinct from old.cash_business_date
  ) then
    raise exception 'Cash payment identity is immutable' using errcode = '22000';
  end if;
  return new;
end;
$$;

alter function app_private.protect_grade5_cash_payment_identity() owner to postgres;
revoke all on function app_private.protect_grade5_cash_payment_identity() from public, anon, authenticated;

-- Parent-created bank-transfer submissions may not assert a Cash business date.
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
    and cash_business_date is null
  );

create or replace view public.grade5_payment_accounting_identity
with (security_invoker = true)
as
select
  p.*,
  p.cash_business_date as authoritative_business_date,
  coalesce(p.offline_reference, p.reference_code) as authoritative_reference,
  case
    when p.method = 'cash' and p.cash_business_date is not null then 'new_date_contract'::text
    else 'legacy'::text
  end as identity_source,
  null::text as historical_reference,
  null::timestamptz as correction_created_at
from public.payments p;

revoke all on public.grade5_payment_accounting_identity from public, anon, authenticated;
grant select on public.grade5_payment_accounting_identity to service_role;
