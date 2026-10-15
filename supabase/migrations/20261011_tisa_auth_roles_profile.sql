-- The application supports only customer and admin accounts.
-- Promote legacy staff accounts to admin before the application stops
-- recognizing the legacy role.
update public.profiles
set role = 'admin',
    updated_at = now()
where role::text = 'staff';

alter table public.profiles
  add constraint profiles_role_application_values_check
  check (role::text in ('admin', 'customer'));

update public.profiles p
set avatar_url = coalesce(
  p.avatar_url,
  u.raw_user_meta_data ->> 'avatar_url',
  u.raw_user_meta_data ->> 'picture'
)
from auth.users u
where u.id = p.id
  and p.avatar_url is null
  and coalesce(
    u.raw_user_meta_data ->> 'avatar_url',
    u.raw_user_meta_data ->> 'picture'
  ) is not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    role
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    ),
    'customer'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(
      public.profiles.full_name,
      excluded.full_name
    ),
    avatar_url = coalesce(
      public.profiles.avatar_url,
      excluded.avatar_url
    ),
    updated_at = now();

  return new;
end;
$$;
