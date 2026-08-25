create or replace function public.enforce_grade5_signup_student_source()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_signup_child text;
begin
  if new.grade_level = 5 and new.creation_source is null then
    select nullif(btrim(u.raw_user_meta_data ->> 'child_name'), '')
      into v_signup_child
    from auth.users u
    where u.id = new.parent_id
      and u.email_confirmed_at is not null;

    if v_signup_child is not null
       and lower(btrim(new.full_name)) = lower(v_signup_child)
       and not exists (
         select 1 from public.students s
         where s.parent_id = new.parent_id
           and s.creation_source = 'grade5_signup'
       ) then
      new.creation_source := 'grade5_signup';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_grade5_signup_student_source on public.students;
create trigger enforce_grade5_signup_student_source
before insert on public.students
for each row execute function public.enforce_grade5_signup_student_source();
