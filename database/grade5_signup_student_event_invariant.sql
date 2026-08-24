-- Assignment 036C: authoritative idempotency for the signup-derived first student.
-- Later legitimate students remain unrestricted because creation_source is NULL for normal add-student paths.

alter table public.students add column if not exists creation_source text;

create unique index if not exists uq_students_grade5_signup_parent
on public.students(parent_id)
where creation_source = 'grade5_signup';

create or replace function public.ensure_grade5_signup_student(p_full_name text)
returns public.students
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_parent_id uuid := auth.uid();
  v_student public.students;
begin
  if v_parent_id is null then
    raise exception 'authentication required';
  end if;

  if nullif(btrim(p_full_name), '') is null then
    raise exception 'student name required';
  end if;

  -- Preserve an existing first student, including legitimate legacy/backfilled rows.
  select * into v_student
  from public.students
  where parent_id = v_parent_id
  order by created_at asc
  limit 1;

  if found then
    return v_student;
  end if;

  -- The partial unique index is the authoritative concurrency boundary.
  -- ON CONFLICT waits on a concurrent signup insert and returns that one row.
  insert into public.students (parent_id, full_name, grade_level, creation_source)
  values (v_parent_id, btrim(p_full_name), 5, 'grade5_signup')
  on conflict (parent_id) where creation_source = 'grade5_signup'
  do update set full_name = public.students.full_name
  returning * into v_student;

  return v_student;
end;
$$;

revoke all on function public.ensure_grade5_signup_student(text) from public;
grant execute on function public.ensure_grade5_signup_student(text) to authenticated;
