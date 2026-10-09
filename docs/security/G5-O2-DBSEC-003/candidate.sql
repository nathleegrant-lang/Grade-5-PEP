-- REVIEW CANDIDATE ONLY. Never applied to lhsefavnwjzxfpojsipn.
-- PostgreSQL 17; metadata baseline in database-metadata.json.
-- No legacy row inspection, UPDATE, backfill, validation, or reassignment.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- A: table UPDATE would override a column-only revoke.
revoke update on public.profiles from public, anon, authenticated;
revoke update (id, role, created_at) on public.profiles from public, anon, authenticated;
grant update (full_name, email, phone) on public.profiles to authenticated;

create function public.g5_dbsec_guard_profile_role()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_auth_admin') then
    if (tg_op = 'INSERT' and new.role is distinct from 'parent')
       or (tg_op = 'UPDATE' and new.role is distinct from old.role) then
      raise exception 'Trusted role administration required' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.g5_dbsec_guard_profile_role() from public, anon, authenticated;
create trigger g5_dbsec_guard_profile_role before insert or update on public.profiles
for each row execute function public.g5_dbsec_guard_profile_role();

-- B/C: independent PKs cannot establish composite ownership.
alter table public.students add constraint g5_dbsec_students_owner_key unique (id, parent_id);
alter table public.student_test_results add constraint g5_dbsec_results_owner_key unique (id, student_id, parent_id);
alter table public.student_test_results add constraint g5_dbsec_result_student_owner
foreign key (student_id, parent_id) references public.students (id, parent_id)
on update no action on delete no action deferrable initially immediate not valid;

-- D: MATCH SIMPLE alone accepts NULL components. New/changed identities
-- require all references; unchanged historical null identities remain unresolved.
create function public.g5_dbsec_guard_result_identity()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.student_id is null then
      raise exception 'Explicit student required' using errcode = '23502';
    end if;
  elsif row(new.student_id, new.parent_id) is distinct from row(old.student_id, old.parent_id) then
    if new.student_id is null then
      raise exception 'Student identity cannot be cleared' using errcode = '23502';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.g5_dbsec_guard_result_identity() from public, anon, authenticated;
create trigger g5_dbsec_guard_result_identity before insert or update on public.student_test_results
for each row execute function public.g5_dbsec_guard_result_identity();

create function public.g5_dbsec_guard_certificate_identity()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.student_id is null or new.test_result_id is null then
      raise exception 'Explicit student and issued result required' using errcode = '23502';
    end if;
  elsif row(new.student_id, new.test_result_id, new.parent_id)
        is distinct from row(old.student_id, old.test_result_id, old.parent_id) then
    if new.student_id is null or new.test_result_id is null then
      raise exception 'Certificate identity cannot be cleared' using errcode = '23502';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.g5_dbsec_guard_certificate_identity() from public, anon, authenticated;
create trigger g5_dbsec_guard_certificate_identity before insert or update on public.certificates
for each row execute function public.g5_dbsec_guard_certificate_identity();

-- Replace SET NULL explicitly. Deleting referenced children/results now requires
-- explicit dependent-record handling; NOT an authorized production deletion policy.
-- Parent auth.users CASCADE paths must be tested at statement/transaction boundary.
alter table public.student_test_results drop constraint student_test_results_student_id_fkey;
alter table public.student_test_results add constraint student_test_results_student_id_fkey
foreign key (student_id) references public.students(id) on delete no action
deferrable initially immediate not valid;
alter table public.certificates drop constraint certificates_student_id_fkey;
alter table public.certificates add constraint certificates_student_id_fkey
foreign key (student_id) references public.students(id) on delete no action
deferrable initially immediate not valid;
alter table public.certificates drop constraint certificates_test_result_id_fkey;
alter table public.certificates add constraint certificates_test_result_id_fkey
foreign key (test_result_id) references public.student_test_results(id) on delete no action
deferrable initially immediate not valid;
alter table public.certificates add constraint g5_dbsec_certificate_student_owner
foreign key (student_id, parent_id) references public.students(id, parent_id)
on update no action on delete no action deferrable initially immediate not valid;
alter table public.certificates add constraint g5_dbsec_certificate_result_owner
foreign key (test_result_id, student_id, parent_id)
references public.student_test_results(id, student_id, parent_id)
on update no action on delete no action deferrable initially immediate not valid;

-- E: designated signup event only; never earliest child or name-only identity.
-- Invoker wrapper preserves existing capacity RPC and its authorization contract.
create or replace function public.ensure_grade5_signup_student(p_full_name text)
returns public.students language plpgsql security invoker set search_path = '' as $$
declare
  v_parent uuid := (select auth.uid());
  v_name text := pg_catalog.btrim(p_full_name);
  v_student public.students;
  v_operation uuid;
begin
  if v_parent is null or not exists (
    select 1 from public.profiles where id = v_parent and role = 'parent'
  ) then
    raise exception 'Parent authentication required' using errcode = '42501';
  end if;
  if v_name is null or v_name = '' then
    raise exception 'Student name required' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_parent::text || ':grade5:students', 0));
  select * into v_student from public.students
   where parent_id = v_parent and grade_level = 5 and creation_source = 'grade5_signup';
  if found then
    if v_student.full_name is distinct from v_name then
      raise exception 'Signup event payload conflict' using errcode = '22000';
    end if;
    return v_student;
  end if;
  if exists (select 1 from public.students where parent_id = v_parent and grade_level = 5) then
    raise exception 'Explicit learner operation required; signup recovery ambiguous'
      using errcode = '22023';
  end if;
  -- Stable per-parent event key; no learner selection by name.
  v_operation := pg_catalog.md5('G5-DBSEC-signup:' || v_parent::text)::uuid;
  v_student := public.add_grade5_student(v_name, v_operation);
  update public.students set creation_source = 'grade5_signup'
   where id = v_student.id and parent_id = v_parent returning * into v_student;
  if not found then
    raise exception 'Signup ownership write failed' using errcode = '42501';
  end if;
  return v_student;
end;
$$;
revoke all on function public.ensure_grade5_signup_student(text) from public, anon, authenticated;
grant execute on function public.ensure_grade5_signup_student(text) to authenticated, service_role;

-- F: retain all SELECT policies verbatim; replace only current INSERT checks.
alter policy "Parents can insert their own student test results" on public.student_test_results
to authenticated with check (
  (select auth.uid()) = parent_id and student_id is not null
  and exists (select 1 from public.students s where s.id = student_test_results.student_id
    and s.parent_id = student_test_results.parent_id and s.grade_level = 5)
);
alter policy "Parents can create their own certificates" on public.certificates
to authenticated with check (
  (select auth.uid()) = parent_id and student_id is not null and test_result_id is not null
  and exists (select 1 from public.student_test_results r
    join public.students s on s.id = r.student_id and s.parent_id = r.parent_id
    where r.id = certificates.test_result_id and r.student_id = certificates.student_id
      and r.parent_id = certificates.parent_id and s.grade_level = 5)
);
-- No validation scan. Future VALIDATE CONSTRAINT requires separate legacy-data authority.
commit;
