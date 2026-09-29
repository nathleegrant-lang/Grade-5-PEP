-- G5-CUSTOMER-OPS-001-CORR-003 migration 5/5:
-- date-only Cash recording contract and retirement of the timestamp entry point.

create or replace function public.admin_record_grade5_cash_payment(
  p_parent_id uuid,
  p_plan_code text,
  p_actual_amount_jmd numeric,
  p_currency text,
  p_cash_business_date date,
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
  payment_id uuid := gen_random_uuid();
  existing_row public.payments%rowtype;
  plan_price numeric;
  reference_seq bigint;
  payment_reference text;
  activation_result jsonb;
  beneficiary_ids uuid[] := coalesce(p_student_ids, '{}'::uuid[]);
begin
  if p_idempotency_key is null then
    raise exception 'Cash operation identity is required' using errcode = '22000';
  end if;
  if p_cash_business_date is null then
    raise exception 'Cash business date is required' using errcode = '22000';
  end if;
  if upper(p_currency) <> 'JMD' then
    raise exception 'Offline Cash currency must be JMD' using errcode = '22000';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_administrator_id and p.role = 'admin'
  ) then
    raise exception 'Administrator authorization is required' using errcode = '42501';
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
       or existing_row.cash_business_date is distinct from p_cash_business_date
       or coalesce(existing_row.student_ids, '{}'::uuid[]) is distinct from beneficiary_ids
       or coalesce(existing_row.note, '') is distinct from coalesce(p_note, '') then
      raise exception 'Cash operation payload conflict' using errcode = '22000';
    end if;
    activation_result := app_private.activate_grade5_payment(existing_row.id, p_administrator_id);
    return activation_result || jsonb_build_object(
      'paymentReference', existing_row.offline_reference,
      'cashBusinessDate', existing_row.cash_business_date
    );
  end if;

  select price_jmd into plan_price
  from public.grade5_plan_configuration
  where code = p_plan_code;

  if plan_price is null then raise exception 'Unsupported Grade 5 plan'; end if;
  if p_actual_amount_jmd is distinct from plan_price then
    raise exception 'Actual amount does not match authoritative plan price';
  end if;
  if cardinality(beneficiary_ids) >
     (select max_students from public.grade5_plan_configuration where code = p_plan_code) then
    raise exception 'Student audit exceeds plan entitlement';
  end if;
  if exists (
    select 1 from unnest(beneficiary_ids) selected_id
    where not exists (
      select 1 from public.students
      where id = selected_id and parent_id = p_parent_id and grade_level = 5
    )
  ) then
    raise exception 'Student audit does not belong to parent';
  end if;

  loop
    reference_seq := nextval('public.grade5_cash_reference_seq'::regclass);
    payment_reference := 'CASH-' || to_char(p_cash_business_date, 'YYYYMMDD') || '-' ||
      lpad(reference_seq::text, 6, '0');
    begin
      insert into public.grade5_cash_reference_registry
        (reference_key, reference_value, source_type, source_id)
      values (lower(payment_reference), payment_reference, 'payment', payment_id);
      exit;
    exception when unique_violation then
      -- Cross-namespace collision: consume another sequence value and retry.
    end;
  end loop;

  insert into public.payments (
    id, parent_id, grade, plan_code, amount_jmd, method, reference_code, offline_reference,
    offline_idempotency_key, note, status, currency, cash_business_date,
    expected_amount_jmd, actual_amount_jmd, verified_by, student_ids
  ) values (
    payment_id, p_parent_id, 'grade5', p_plan_code, plan_price, 'cash', payment_reference,
    payment_reference, p_idempotency_key, p_note, 'pending', upper(p_currency),
    p_cash_business_date, plan_price, p_actual_amount_jmd, p_administrator_id, beneficiary_ids
  );

  insert into public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  values (
    p_administrator_id, 'offline_cash_recorded', 'payment', payment_id,
    jsonb_build_object(
      'reference', payment_reference,
      'cashBusinessDate', p_cash_business_date,
      'currency', upper(p_currency),
      'actualAmountJmd', p_actual_amount_jmd,
      'studentIds', beneficiary_ids
    )
  );

  activation_result := app_private.activate_grade5_payment(payment_id, p_administrator_id);
  return activation_result || jsonb_build_object(
    'paymentReference', payment_reference,
    'cashBusinessDate', p_cash_business_date
  );

exception when unique_violation then
  select * into existing_row
  from public.payments
  where offline_idempotency_key = p_idempotency_key;
  if not found then raise; end if;

  if existing_row.method is distinct from 'cash'
     or existing_row.parent_id is distinct from p_parent_id
     or existing_row.plan_code is distinct from p_plan_code
     or coalesce(existing_row.actual_amount_jmd, existing_row.amount_jmd) is distinct from p_actual_amount_jmd
     or existing_row.currency is distinct from upper(p_currency)
     or existing_row.cash_business_date is distinct from p_cash_business_date
     or coalesce(existing_row.student_ids, '{}'::uuid[]) is distinct from beneficiary_ids
     or coalesce(existing_row.note, '') is distinct from coalesce(p_note, '') then
    raise exception 'Cash operation payload conflict' using errcode = '22000';
  end if;

  activation_result := app_private.activate_grade5_payment(existing_row.id, p_administrator_id);
  return activation_result || jsonb_build_object(
    'paymentReference', existing_row.offline_reference,
    'cashBusinessDate', existing_row.cash_business_date
  );
end;
$$;

alter function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, date, uuid, uuid, text, uuid[]
) owner to postgres;

revoke all on function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, date, uuid, uuid, text, uuid[]
) from public, anon, authenticated;
grant execute on function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, date, uuid, uuid, text, uuid[]
) to service_role;

-- Retire the ambiguous timestamp-oriented production entry point.
revoke all on function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, timestamptz, uuid, uuid, text, uuid[]
) from public, anon, authenticated, service_role;
drop function public.admin_record_grade5_cash_payment(
  uuid, text, numeric, text, timestamptz, uuid, uuid, text, uuid[]
);
