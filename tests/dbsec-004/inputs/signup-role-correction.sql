-- SEPARATE PROPOSAL ONLY: no implementation or application authorized.
-- Exactly one provisioning expression changes; frozen DBSEC-003 remains untouched.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone',
    'parent'::text
  )
  on conflict (id) do nothing;

  return new;
end;
$function$
;
