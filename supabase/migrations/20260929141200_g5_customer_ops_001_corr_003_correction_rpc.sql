-- G5-CUSTOMER-OPS-001-CORR-003 migration 3/5:
-- narrow, privileged, idempotent Cash identity correction operation.

create or replace function public.admin_correct_grade5_cash_identity(
  p_payment_id uuid,
  p_corrected_business_date date,
  p_reason text,
  p_operation_key uuid,
  p_administrator_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = 'pg_catalog', 'public', 'app_private'
as $$
declare
  payment_row public.payments%rowtype;
  correction_row public.grade5_cash_payment_corrections%rowtype;
  correction_id uuid := gen_random_uuid();
  reference_seq bigint;
  corrected_reference text;
  canonical_reason text := btrim(p_reason);
begin
  if p_operation_key is null then
    raise exception 'Cash correction operation identity is required' using errcode = '22000';
  end if;
  if p_corrected_business_date is null then
    raise exception 'Corrected Cash business date is required' using errcode = '22000';
  end if;
  if canonical_reason is null or canonical_reason = '' then
    raise exception 'Cash correction reason is required' using errcode = '22000';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_administrator_id and p.role = 'admin'
  ) then
    raise exception 'Administrator authorization is required' using errcode = '42501';
  end if;

  select * into correction_row
  from public.grade5_cash_payment_corrections
  where operation_key = p_operation_key;

  if found then
    if correction_row.payment_id is distinct from p_payment_id
       or correction_row.corrected_business_date is distinct from p_corrected_business_date
       or correction_row.reason is distinct from canonical_reason then
      raise exception 'Cash correction operation payload conflict' using errcode = '22000';
    end if;
    return jsonb_build_object(
      'correctionId', correction_row.id,
      'paymentId', correction_row.payment_id,
      'businessDate', correction_row.corrected_business_date,
      'paymentReference', correction_row.corrected_reference,
      'historicalReference', correction_row.original_reference,
      'idempotent', true
    );
  end if;

  select * into payment_row from public.payments where id = p_payment_id for update;
  if not found then raise exception 'Cash payment not found' using errcode = '22000'; end if;

  -- Recheck after the payment lock closes concurrent same-payment races.
  select * into correction_row
  from public.grade5_cash_payment_corrections
  where operation_key = p_operation_key;
  if found then
    if correction_row.payment_id is distinct from p_payment_id
       or correction_row.corrected_business_date is distinct from p_corrected_business_date
       or correction_row.reason is distinct from canonical_reason then
      raise exception 'Cash correction operation payload conflict' using errcode = '22000';
    end if;
    return jsonb_build_object(
      'correctionId', correction_row.id,
      'paymentId', correction_row.payment_id,
      'businessDate', correction_row.corrected_business_date,
      'paymentReference', correction_row.corrected_reference,
      'historicalReference', correction_row.original_reference,
      'idempotent', true
    );
  end if;

  if exists (select 1 from public.grade5_cash_payment_corrections where payment_id = p_payment_id) then
    raise exception 'Cash payment already has an authoritative correction' using errcode = '22000';
  end if;
  if payment_row.grade is distinct from 'grade5'
     or payment_row.method is distinct from 'cash'
     or payment_row.status is distinct from 'verified'
     or payment_row.activated_at is null
     or coalesce(payment_row.offline_reference, payment_row.reference_code) is null then
    raise exception 'Cash payment is not eligible for identity correction' using errcode = '22000';
  end if;
  if not exists (
    select 1 from public.subscriptions s
    where s.payment_id = payment_row.id and s.grade = 'grade5'
  ) then
    raise exception 'Cash payment has no Grade 5 subscription linkage' using errcode = '22000';
  end if;

  loop
    reference_seq := nextval('public.grade5_cash_reference_seq'::regclass);
    corrected_reference := 'CASH-' || to_char(p_corrected_business_date, 'YYYYMMDD') || '-' ||
      lpad(reference_seq::text, 6, '0');
    begin
      insert into public.grade5_cash_reference_registry
        (reference_key, reference_value, source_type, source_id)
      values (lower(corrected_reference), corrected_reference, 'correction', correction_id);
      exit;
    exception when unique_violation then
      -- Cross-namespace collision: consume another sequence value and retry.
    end;
  end loop;

  insert into public.grade5_cash_payment_corrections (
    id, payment_id, original_paid_at, original_cash_business_date,
    corrected_business_date, original_reference, corrected_reference,
    reason, authorized_actor, operation_key
  ) values (
    correction_id, payment_row.id, payment_row.paid_at, payment_row.cash_business_date,
    p_corrected_business_date, coalesce(payment_row.offline_reference, payment_row.reference_code),
    corrected_reference, canonical_reason, p_administrator_id, p_operation_key
  ) returning * into correction_row;

  insert into public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  values (
    p_administrator_id, 'cash_identity_corrected', 'payment', payment_row.id,
    jsonb_build_object(
      'correctionId', correction_row.id,
      'historicalReference', correction_row.original_reference,
      'authoritativeReference', correction_row.corrected_reference,
      'authoritativeBusinessDate', correction_row.corrected_business_date,
      'reason', correction_row.reason
    )
  );

  return jsonb_build_object(
    'correctionId', correction_row.id,
    'paymentId', correction_row.payment_id,
    'businessDate', correction_row.corrected_business_date,
    'paymentReference', correction_row.corrected_reference,
    'historicalReference', correction_row.original_reference,
    'idempotent', false
  );
end;
$$;

alter function public.admin_correct_grade5_cash_identity(uuid, date, text, uuid, uuid) owner to postgres;
revoke all on function public.admin_correct_grade5_cash_identity(uuid, date, text, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_correct_grade5_cash_identity(uuid, date, text, uuid, uuid)
  to service_role;
