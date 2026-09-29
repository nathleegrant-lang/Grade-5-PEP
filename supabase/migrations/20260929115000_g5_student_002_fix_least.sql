begin;

-- G5-STUDENT-002: PostgreSQL resolves least() as a special SQL expression.
-- Preserve the certified RPC
-- contract while correcting only that executable expression.
create or replace function public.add_grade5_student(
  p_full_name text,
  p_idempotency_key uuid
)
returns public.students
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid := (select auth.uid());
  v_student_name text := pg_catalog.btrim(p_full_name);
  v_subscription_id uuid;
  v_allowance integer;
  v_student_count integer;
  v_existing public.students%rowtype;
  v_created public.students%rowtype;
begin
  if v_caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not exists (
    select 1
      from public.profiles p
     where p.id = v_caller_id
       and p.role = 'parent'
  ) then
    raise exception 'Parent account required' using errcode = '42501';
  end if;

  if p_idempotency_key is null then
    raise exception 'Student operation identity required' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_caller_id::text || ':grade5:students', 0)
  );

  -- Only the caller-scoped operation key identifies a retry. Names are not
  -- identities: a fresh operation key may intentionally create a namesake.
  select s.*
    into v_existing
    from public.students s
   where s.parent_id = v_caller_id
     and s.creation_idempotency_key = p_idempotency_key;

  if found then
    if v_existing.full_name is distinct from v_student_name then
      raise exception 'Student operation payload conflict' using errcode = '22000';
    end if;
    return v_existing;
  end if;

  if v_student_name is null or v_student_name = '' then
    raise exception 'Student name required' using errcode = '22023';
  end if;

  select s.id, least(s.max_students, c.max_students)
    into v_subscription_id, v_allowance
    from public.subscriptions s
    join public.grade5_plan_configuration c on c.code = s.plan_code
   where s.parent_id = v_caller_id
     and s.grade = 'grade5'
     and s.status = 'active'
     and (s.starts_at is null or s.starts_at <= pg_catalog.clock_timestamp())
     and s.expires_at > pg_catalog.clock_timestamp()
   order by s.starts_at desc nulls last, s.expires_at desc, s.id
   limit 1;

  if v_subscription_id is null then
    select c.max_students
      into v_allowance
      from public.grade5_plan_configuration c
     where c.code = 'free';
    v_allowance := pg_catalog.coalesce(v_allowance, 1);
  end if;

  select pg_catalog.count(*)::integer
    into v_student_count
    from public.students s
   where s.parent_id = v_caller_id
     and s.grade_level = 5;

  if v_student_count >= v_allowance then
    raise exception 'Student capacity reached' using errcode = 'P0001';
  end if;

  insert into public.students
    (parent_id, subscription_id, full_name, grade_level, creation_idempotency_key)
  values
    (v_caller_id, v_subscription_id, v_student_name, 5, p_idempotency_key)
  returning * into v_created;

  return v_created;
end;
$$;

alter function public.add_grade5_student(text, uuid) owner to postgres;
revoke all on function public.add_grade5_student(text, uuid)
  from public, anon, authenticated;
grant execute on function public.add_grade5_student(text, uuid)
  to authenticated;

commit;
