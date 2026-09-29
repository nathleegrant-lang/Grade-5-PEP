begin;

alter table public.students
  add column if not exists creation_source text,
  add column if not exists creation_idempotency_key uuid;

create unique index if not exists uq_students_parent_creation_operation
  on public.students (parent_id, creation_idempotency_key)
  where creation_idempotency_key is not null;

create unique index if not exists uq_students_grade5_signup_parent
  on public.students (parent_id)
  where creation_source = 'grade5_signup';

-- G5-STUDENT-001: keep the existing trigger's narrow signup classification,
-- but execute its auth.users lookup across a locked privileged boundary.
create or replace function public.enforce_grade5_signup_student_source()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller_id uuid := (select auth.uid());
  v_signup_child text;
begin
  if v_caller_id is null or new.parent_id is distinct from v_caller_id then
    raise exception 'Student ownership verification failed' using errcode = '42501';
  end if;

  if new.grade_level = 5 and new.creation_source is null then
    select nullif(pg_catalog.btrim(u.raw_user_meta_data ->> 'child_name'), '')
      into v_signup_child
      from auth.users u
     where u.id = v_caller_id
       and u.id = new.parent_id
       and u.email_confirmed_at is not null;

    if v_signup_child is not null
       and pg_catalog.lower(pg_catalog.btrim(new.full_name)) = pg_catalog.lower(v_signup_child)
       and not exists (
         select 1
           from public.students s
          where s.parent_id = new.parent_id
            and s.creation_source = 'grade5_signup'
       ) then
      new.creation_source := 'grade5_signup';
    end if;
  end if;

  return new;
end;
$$;

alter function public.enforce_grade5_signup_student_source() owner to postgres;
revoke all on function public.enforce_grade5_signup_student_source()
  from public, anon, authenticated;

drop trigger if exists enforce_grade5_signup_student_source on public.students;
create trigger enforce_grade5_signup_student_source
before insert on public.students
for each row
execute function public.enforce_grade5_signup_student_source();

create or replace function public.protect_student_creation_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.creation_idempotency_key is distinct from old.creation_idempotency_key then
    raise exception 'Student creation identity is immutable' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.protect_student_creation_identity()
  from public, anon, authenticated;

drop trigger if exists protect_student_creation_identity on public.students;
create trigger protect_student_creation_identity
before update on public.students
for each row
execute function public.protect_student_creation_identity();

-- This is the sole authenticated persistence boundary for new Grade 5
-- students. It serializes each Parent's inserts before counting capacity.
drop function if exists public.add_grade5_student(text);
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
    return v_existing;
  end if;

  if v_student_name is null or v_student_name = '' then
    raise exception 'Student name required' using errcode = '22023';
  end if;

  select s.id, pg_catalog.least(s.max_students, c.max_students)
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

-- Keep RLS and its ownership policies intact, but close the direct browser
-- INSERT path so capacity cannot be bypassed outside the RPC.
alter table public.students enable row level security;
revoke insert on table public.students from anon, authenticated;

commit;
