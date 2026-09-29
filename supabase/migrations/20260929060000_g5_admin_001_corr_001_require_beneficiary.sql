-- G5-ADMIN-001-CORR-001: require at least one Grade 5 Cash beneficiary.
-- The parent G5-ADMIN-001 migration is unreleased, but this forward correction preserves
-- auditable candidate history and leaves production migrations untouched.

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
  beneficiary_ids uuid[] := coalesce(p_student_ids, '{}'::uuid[]);
begin
  if p_idempotency_key is null then
    raise exception 'Cash operation identity is required';
  end if;
  if upper(p_currency) <> 'JMD' then
    raise exception 'Offline Cash currency must be JMD';
  end if;

  if cardinality(beneficiary_ids) = 0 then
    raise exception 'At least one Grade 5 student beneficiary is required' using errcode = '22000';
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
       or coalesce(existing_row.student_ids, '{}'::uuid[]) is distinct from beneficiary_ids
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
  if cardinality(beneficiary_ids) >
     (select max_students from public.grade5_plan_configuration where code = p_plan_code) then
    raise exception 'Student audit exceeds plan entitlement';
  end if;
  if exists (
    select 1
    from unnest(beneficiary_ids) selected_id
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
     p_actual_amount_jmd, p_administrator_id, beneficiary_ids)
  returning id into payment_id;

  insert into public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  values (
    p_administrator_id, 'offline_cash_recorded', 'payment', payment_id,
    jsonb_build_object(
      'reference', payment_reference,
      'paidAt', p_paid_at,
      'currency', upper(p_currency),
      'actualAmountJmd', p_actual_amount_jmd,
      'studentIds', beneficiary_ids
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
     or coalesce(existing_row.student_ids, '{}'::uuid[]) is distinct from beneficiary_ids
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
