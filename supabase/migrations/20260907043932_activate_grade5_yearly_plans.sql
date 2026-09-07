begin;

do $$
declare
  configuration_count integer;
  pricing_count integer;
begin
  select count(*)
    into configuration_count
    from public.grade5_plan_configuration
   where (code = 'standard_yearly'
          and price_jmd = 30000
          and duration_months = 12
          and duration_days = 0
          and max_students = 1
          and is_public = false)
      or (code = 'premium_family_yearly'
          and price_jmd = 100000
          and duration_months = 12
          and duration_days = 0
          and max_students = 4
          and is_public = false);

  if configuration_count <> 2 then
    raise exception 'Grade 5 Yearly plan configuration does not match the certified dormant state';
  end if;

  select count(*)
    into pricing_count
    from public.pricing_plans
   where grade = 'grade5'
     and ((code = 'standard_yearly'
           and price_jmd = 30000
           and max_students = 1
           and is_active = false)
       or (code = 'premium_family_yearly'
           and price_jmd = 100000
           and max_students = 4
           and is_active = false));

  if pricing_count <> 2 then
    raise exception 'Grade 5 Yearly pricing rows do not match the certified dormant state';
  end if;
end
$$;

update public.grade5_plan_configuration
   set is_public = true
 where code in ('standard_yearly', 'premium_family_yearly')
   and is_public = false;

update public.pricing_plans
   set is_active = true
 where grade = 'grade5'
   and code in ('standard_yearly', 'premium_family_yearly')
   and is_active = false;

do $$
begin
  if (select count(*) from public.grade5_plan_configuration
       where code in ('standard_yearly', 'premium_family_yearly') and is_public = true) <> 2
     or (select count(*) from public.pricing_plans
          where grade = 'grade5'
            and code in ('standard_yearly', 'premium_family_yearly')
            and is_active = true) <> 2 then
    raise exception 'Grade 5 Yearly activation did not update exactly both visibility states';
  end if;
end
$$;

commit;
