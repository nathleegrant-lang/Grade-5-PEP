-- G5-CUSTOMER-OPS-001-CORR-003 migration 4/5:
-- immutable, audited, exactly-seven-day Grade 5 subscription extension.

create table public.grade5_subscription_extensions (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  extension_days integer not null check (extension_days = 7),
  reason text not null check (btrim(reason) <> ''),
  prior_expiry timestamptz not null,
  resulting_expiry timestamptz not null,
  authorized_actor uuid not null references auth.users(id) on delete restrict,
  operation_key uuid not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  check (resulting_expiry = prior_expiry + interval '7 days')
);

alter table public.grade5_subscription_extensions enable row level security;
revoke all on public.grade5_subscription_extensions from public, anon, authenticated, service_role;

create trigger protect_grade5_subscription_extensions
before update or delete on public.grade5_subscription_extensions
for each row execute function app_private.protect_grade5_append_only_audit();

create or replace function public.admin_extend_grade5_subscription(
  p_subscription_id uuid,
  p_extension_days integer,
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
  subscription_row public.subscriptions%rowtype;
  extension_row public.grade5_subscription_extensions%rowtype;
  canonical_reason text := btrim(p_reason);
  resulting_expiry timestamptz;
begin
  if p_operation_key is null then
    raise exception 'Subscription extension operation identity is required' using errcode = '22000';
  end if;
  if p_extension_days is distinct from 7 then
    raise exception 'Grade 5 courtesy extension must be exactly seven days' using errcode = '22000';
  end if;
  if canonical_reason is null or canonical_reason = '' then
    raise exception 'Subscription extension reason is required' using errcode = '22000';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_administrator_id and p.role = 'admin'
  ) then
    raise exception 'Administrator authorization is required' using errcode = '42501';
  end if;

  select * into extension_row
  from public.grade5_subscription_extensions
  where operation_key = p_operation_key;
  if found then
    if extension_row.subscription_id is distinct from p_subscription_id
       or extension_row.extension_days is distinct from p_extension_days
       or extension_row.reason is distinct from canonical_reason then
      raise exception 'Subscription extension operation payload conflict' using errcode = '22000';
    end if;
    return jsonb_build_object(
      'extensionId', extension_row.id,
      'subscriptionId', extension_row.subscription_id,
      'priorExpiry', extension_row.prior_expiry,
      'resultingExpiry', extension_row.resulting_expiry,
      'idempotent', true
    );
  end if;

  select * into subscription_row
  from public.subscriptions where id = p_subscription_id for update;
  if not found then raise exception 'Grade 5 subscription not found' using errcode = '22000'; end if;

  select * into extension_row
  from public.grade5_subscription_extensions
  where operation_key = p_operation_key;
  if found then
    if extension_row.subscription_id is distinct from p_subscription_id
       or extension_row.extension_days is distinct from p_extension_days
       or extension_row.reason is distinct from canonical_reason then
      raise exception 'Subscription extension operation payload conflict' using errcode = '22000';
    end if;
    return jsonb_build_object(
      'extensionId', extension_row.id,
      'subscriptionId', extension_row.subscription_id,
      'priorExpiry', extension_row.prior_expiry,
      'resultingExpiry', extension_row.resulting_expiry,
      'idempotent', true
    );
  end if;

  if subscription_row.grade is distinct from 'grade5'
     or subscription_row.status is distinct from 'active'
     or subscription_row.expires_at is null then
    raise exception 'Subscription is not eligible for a Grade 5 courtesy extension' using errcode = '22000';
  end if;

  resulting_expiry := subscription_row.expires_at + make_interval(days => p_extension_days);

  insert into public.grade5_subscription_extensions (
    subscription_id, extension_days, reason, prior_expiry, resulting_expiry,
    authorized_actor, operation_key
  ) values (
    subscription_row.id, p_extension_days, canonical_reason,
    subscription_row.expires_at, resulting_expiry, p_administrator_id, p_operation_key
  ) returning * into extension_row;

  update public.subscriptions
  set expires_at = resulting_expiry
  where id = subscription_row.id;

  insert into public.admin_audit_log (admin_user_id, action_type, target_table, target_id, details)
  values (
    p_administrator_id, 'grade5_subscription_extended', 'subscription', subscription_row.id,
    jsonb_build_object(
      'extensionId', extension_row.id,
      'extensionDays', extension_row.extension_days,
      'priorExpiry', extension_row.prior_expiry,
      'resultingExpiry', extension_row.resulting_expiry,
      'reason', extension_row.reason
    )
  );

  return jsonb_build_object(
    'extensionId', extension_row.id,
    'subscriptionId', extension_row.subscription_id,
    'priorExpiry', extension_row.prior_expiry,
    'resultingExpiry', extension_row.resulting_expiry,
    'idempotent', false
  );
end;
$$;

alter function public.admin_extend_grade5_subscription(uuid, integer, text, uuid, uuid) owner to postgres;
revoke all on function public.admin_extend_grade5_subscription(uuid, integer, text, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.admin_extend_grade5_subscription(uuid, integer, text, uuid, uuid)
  to service_role;
