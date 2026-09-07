begin;

-- A payment may establish at most one subscription. This also protects the
-- one-time compatibility operation against concurrent or accidental replay.
create unique index if not exists subscriptions_payment_id_unique
  on public.subscriptions (payment_id)
  where payment_id is not null;

create or replace function app_private.backfill_legacy_grade5_entitlement(
  p_payment_id uuid,
  p_administrator_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, app_private, extensions
as $$
declare
  target_payment_id constant uuid := 'd1e603ad-4b9c-4f4f-b213-1941bf228a1a'::uuid;
  target_reference_sha256 constant text := '79390986bbba18cf5c5377fce37cc1fa15f6c631e16a0d8ead4b70a4ae545efd';
  target_historical_subscription_id constant uuid := '91d75058-6640-4b29-99f0-4e7b4df4c2ee'::uuid;
  target_historical_payment_id constant uuid := '8422f298-e5a5-48e6-b710-e16a54d5c211'::uuid;
  target_historical_start constant timestamptz := '2026-04-29 03:09:37.248+00'::timestamptz;
  target_historical_expiry constant timestamptz := '2026-05-06 03:09:37.248+00'::timestamptz;
  preserved_start constant timestamptz := '2026-09-06 03:19:38.035+00'::timestamptz;
  preserved_expiry constant timestamptz := '2026-09-13 03:19:38.035+00'::timestamptz;
  payment_row public.payments%rowtype;
  historical_row public.subscriptions%rowtype;
  linked_row public.subscriptions%rowtype;
  subscription_id uuid;
  receipt text;
  inserted_status text;
  changed_rows integer;
begin
  if p_payment_id is distinct from target_payment_id then
    raise exception 'Unsupported legacy payment target';
  end if;

  if not exists (
    select 1
      from public.profiles
     where id = p_administrator_id
       and role = 'admin'
  ) then
    raise exception 'Administrator authorization required';
  end if;

  select *
    into payment_row
    from public.payments
   where id = target_payment_id
   for update;

  if not found then
    raise exception 'Target legacy payment not found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(payment_row.parent_id::text || ':grade5', 0));

  if encode(extensions.digest(coalesce(payment_row.reference_code, ''), 'sha256'), 'hex')
       is distinct from target_reference_sha256
     or payment_row.grade is distinct from 'grade5'
     or payment_row.plan_code is distinct from 'standard_weekly'
     or payment_row.amount_jmd is distinct from 1000.00::numeric
     or payment_row.method is distinct from 'bank_transfer'
     or payment_row.status is distinct from 'verified'
     or payment_row.verified_at is distinct from preserved_start then
    raise exception 'Legacy payment facts no longer match authorized evidence';
  end if;

  receipt := 'G5-' || upper(substr(replace(target_payment_id::text, '-', ''), 1, 16));

  select *
    into linked_row
    from public.subscriptions
   where payment_id = target_payment_id
   for update;

  if found then
    if linked_row.parent_id is distinct from payment_row.parent_id
       or linked_row.grade is distinct from 'grade5'
       or linked_row.plan_code is distinct from 'standard_weekly'
       or linked_row.starts_at is distinct from preserved_start
       or linked_row.expires_at is distinct from preserved_expiry
       or linked_row.max_students is distinct from 1
       or linked_row.status not in ('active', 'expired')
       or payment_row.activated_at is distinct from preserved_start
       or payment_row.expected_amount_jmd is distinct from 1000.00::numeric
       or payment_row.actual_amount_jmd is distinct from 1000.00::numeric
       or payment_row.currency is distinct from 'JMD'
       or payment_row.receipt_number is distinct from receipt then
      raise exception 'Conflicting subscription already linked to legacy payment';
    end if;

    return jsonb_build_object(
      'paymentId', target_payment_id,
      'subscriptionId', linked_row.id,
      'startsAt', linked_row.starts_at,
      'expiresAt', linked_row.expires_at,
      'maxStudents', linked_row.max_students,
      'idempotent', true,
      'entitlementExtended', false
    );
  end if;

  if payment_row.activated_at is not null
     or payment_row.receipt_number is not null
     or payment_row.expected_amount_jmd is not null
     or payment_row.actual_amount_jmd is not null
     or payment_row.currency is distinct from 'JMD' then
    raise exception 'Legacy payment activation state no longer matches authorized evidence';
  end if;

  if exists (
    select 1
      from public.subscriptions
     where parent_id = payment_row.parent_id
       and grade = 'grade5'
       and status = 'active'
       and coalesce(starts_at, '-infinity'::timestamptz) <= clock_timestamp()
       and expires_at > clock_timestamp()
  ) then
    raise exception 'Another effective Grade 5 subscription already exists';
  end if;

  select *
    into historical_row
    from public.subscriptions
   where id = target_historical_subscription_id
   for update;

  if not found
     or historical_row.parent_id is distinct from payment_row.parent_id
     or historical_row.grade is distinct from 'grade5'
     or historical_row.plan_code is distinct from 'standard_weekly'
     or historical_row.status is distinct from 'active'
     or historical_row.starts_at is distinct from target_historical_start
     or historical_row.expires_at is distinct from target_historical_expiry
     or historical_row.max_students is distinct from 1
     or historical_row.payment_id is distinct from target_historical_payment_id then
    raise exception 'Historical subscription no longer matches authorized evidence';
  end if;

  update public.subscriptions
     set status = 'expired'
   where id = target_historical_subscription_id
     and status = 'active'
     and expires_at = target_historical_expiry;

  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then
    raise exception 'Historical subscription transition failed';
  end if;

  inserted_status := case
    when preserved_expiry > clock_timestamp() then 'active'
    else 'expired'
  end;

  insert into public.subscriptions
    (parent_id, grade, plan_code, status, starts_at, expires_at, max_students, payment_id)
  values
    (payment_row.parent_id, 'grade5', 'standard_weekly', inserted_status,
     preserved_start, preserved_expiry, 1, target_payment_id)
  returning id into subscription_id;

  update public.payments
     set currency = coalesce(currency, 'JMD'),
         expected_amount_jmd = 1000.00,
         actual_amount_jmd = 1000.00,
         activated_at = preserved_start,
         receipt_number = coalesce(receipt_number, receipt)
   where id = target_payment_id
     and status = 'verified'
     and verified_at = preserved_start;

  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then
    raise exception 'Legacy payment activation marker failed';
  end if;

  insert into public.admin_audit_log
    (admin_user_id, action_type, target_table, target_id, details)
  values
    (p_administrator_id, 'legacy_payment_subscription_backfilled', 'subscriptions', subscription_id,
     jsonb_build_object(
       'paymentId', target_payment_id,
       'referenceSha256', target_reference_sha256,
       'planCode', 'standard_weekly',
       'startsAt', preserved_start,
       'expiresAt', preserved_expiry,
       'maxStudents', 1,
       'historicalSubscriptionId', target_historical_subscription_id,
       'historicalStatusTransition', 'active_to_expired',
       'reason', 'legacy_verified_payment_missing_subscription',
       'entitlementExtended', false,
       'idempotencyKey', target_payment_id
     ));

  return jsonb_build_object(
    'paymentId', target_payment_id,
    'subscriptionId', subscription_id,
    'startsAt', preserved_start,
    'expiresAt', preserved_expiry,
    'maxStudents', 1,
    'idempotent', false,
    'entitlementExtended', false
  );
end;
$$;

revoke all on function app_private.backfill_legacy_grade5_entitlement(uuid, uuid)
  from public, anon, authenticated;
grant usage on schema app_private to service_role;
grant execute on function app_private.backfill_legacy_grade5_entitlement(uuid, uuid)
  to service_role;

commit;
