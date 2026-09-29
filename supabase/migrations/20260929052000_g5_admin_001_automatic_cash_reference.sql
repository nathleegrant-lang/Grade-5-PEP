-- G5-ADMIN-001: authoritative automatic Cash payment reference.
-- Forward-only. Keeps human-readable payment identity separate from operation idempotency.

create sequence if not exists public.grade5_cash_reference_seq;

alter table public.payments
  add column if not exists offline_idempotency_key uuid;

create unique index if not exists payments_offline_idempotency_key_unique
  on public.payments (offline_idempotency_key)
  where offline_idempotency_key is not null;

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
  ) then
    raise exception 'Cash payment identity is immutable' using errcode = '22000';
  end if;
  return new;
end;
$$;

alter function app_private.protect_grade5_cash_payment_identity() owner to postgres;
revoke all on function app_private.protect_grade5_cash_payment_identity() from public, anon, authenticated;

drop trigger if exists protect_grade5_cash_payment_identity on public.payments;
create trigger protect_grade5_cash_payment_identity
before update on public.payments
for each row execute function app_private.protect_grade5_cash_payment_identity();

drop function if exists public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, timestamptz, text, uuid, text, uuid[]
);

create or replace function public.admin_record_grade5_cash_payment(
  p_parent_id uuid,
  p_plan_code text,
  p_actual_amount_jmd numeric,
  p_currency text,
  p_paid_at timestamptz,
  p_idempotency_key uuid,
  p_administrator_id uuid,
  p_note text default null,
  p_student_ids uuid[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog', 'public', 'app_private'
as $$
declare
  payment_id uuid;
  existing_row public.payments%rowtype;
  plan_price numeric;
  reference_seq bigint;
  payment_reference text;
  activation_result jsonb;
begin
  if p_idempotency_key is null then
    raise exception 'Cash operation identity is required';
  end if;
  if upper(p_currency) <> 'JMD' then
    raise exception 'Offline Cash currency must be JMD';
  end if;

  select * into existing_row
  from public.payments
  where offline_idempotency_key = p_idempotency_key;

  if found then
    if existing_row.method is distinct from 'cash'
       or existing_row.parent_id is distinct from p_parent_id
       or existing_row.plan_code is distinct from p_plan_code
       or coalesce(existing_row.actual_amount_jmd, existing_row.amount_jmd) is distinct from p_actual_amount_jmd
       or existing_row.currency is distinct from upper(p_currency)
       or existing_row.paid_at is distinct from p_paid_at
       or coalesce(existing_row.student_ids, '{}'::uuid[]) is distinct from coalesce(p_student_ids, '{}'::uuid[])
       or coalesce(existing_row.note, '') is distinct from coalesce(p_note, '') then
      raise exception 'Cash operation payload conflict' using errcode = '22000';
    end if;
    activation_result := app_private.activate_grade5_payment(existing_row.id, p_administrator_id);
    return activation_result || jsonb_build_object('paymentReference', existing_row.offline_reference);
  end if;

  select price_jmd into plan_price
  from public.grade5_plan_configuration
  where code = p_plan_code;

  if plan_price is null then
    raise exception 'Unsupported Grade 5 plan';
  end if;
  if p_actual_amount_jmd is distinct from plan_price then
    raise exception 'Actual amount does not match authoritative plan price';
  end if;
  if cardinality(coalesce(p_student_ids, '{}'::uuid[])) >
     (select max_students from public.grade5_plan_configuration where code = p_plan_code) then
    raise exception 'Student audit exceeds plan entitlement';
  end if;
  if exists (
    select 1
    from unnest(coalesce(p_student_ids, '{}'::uuid[])) selected_id
    where not exists (
      select 1 from public.students
      where id = selected_id and parent_id = p_parent_id and grade_level = 5
    )
  ) then
    raise exception 'Student audit does not belong to parent';
  end if;

  reference_seq := nextval('public.grade5_cash_reference_seq'::regclass);
  payment_reference :=
    'CASH-' || to_char(p_paid_at at time zone 'UTC', 'YYYYMMDD') || '-' ||
    lpad(reference_seq::text, 6, '0');

  insert into public.payments
    (parent_id, grade, plan_code, amount_jmd, method, reference_code, offline_reference,
     offline_idempotency_key, note, status, currency, paid_at, expected_amount_jmd,
     actual_amount_jmd, verified_by, student_ids)
  values
    (p_parent_id, 'grade5', p_plan_code, plan_price, 'cash', payment_reference, payment_reference,
     p_idempotency_key, p_note, 'pending', upper(p_currency), p_paid_at, plan_price,
     p_actual_amount_jmd, p_administrator_id, p_student_ids)
  returning id into payment_id;

  insert into public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  values (
    p_administrator_id, 'offline_cash_recorded', 'payment', payment_id,
    jsonb_build_object(
      'reference', payment_reference,
      'paidAt', p_paid_at,
      'currency', upper(p_currency),
      'actualAmountJmd', p_actual_amount_jmd,
      'studentIds', p_student_ids
    )
  );

  activation_result := app_private.activate_grade5_payment(payment_id, p_administrator_id);
  return activation_result || jsonb_build_object('paymentReference', payment_reference);

exception when unique_violation then
  select * into existing_row
  from public.payments
  where offline_idempotency_key = p_idempotency_key;

  if not found then
    raise;
  end if;
  if existing_row.method is distinct from 'cash'
     or existing_row.parent_id is distinct from p_parent_id
     or existing_row.plan_code is distinct from p_plan_code
     or coalesce(existing_row.actual_amount_jmd, existing_row.amount_jmd) is distinct from p_actual_amount_jmd
     or existing_row.currency is distinct from upper(p_currency)
     or existing_row.paid_at is distinct from p_paid_at
     or coalesce(existing_row.student_ids, '{}'::uuid[]) is distinct from coalesce(p_student_ids, '{}'::uuid[])
     or coalesce(existing_row.note, '') is distinct from coalesce(p_note, '') then
    raise exception 'Cash operation payload conflict' using errcode = '22000';
  end if;

  activation_result := app_private.activate_grade5_payment(existing_row.id, p_administrator_id);
  return activation_result || jsonb_build_object('paymentReference', existing_row.offline_reference);
end;
$$;

alter function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, timestamptz, uuid, uuid, text, uuid[]
) owner to postgres;

revoke all on function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, timestamptz, uuid, uuid, text, uuid[]
) from public, anon, authenticated;

grant execute on function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, timestamptz, uuid, uuid, text, uuid[]
) to service_role;
