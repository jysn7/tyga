alter table accounts add column avatar_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatars (bucket is public, but RLS still gates
-- direct table access to storage.objects if someone queries it that way)
create policy "Avatar images are publicly viewable"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- A user can upload their own avatar, but only into a folder matching their own account_id
create policy "Users can upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- A user can replace/update their own avatar
create policy "Users can update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- A user can delete their own avatar
create policy "Users can delete their own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Drop and recreate: return shape changed (added avatar_url column)
drop function if exists get_my_account();

create function get_my_account()
returns table (
  id uuid,
  role text,
  full_name text,
  email text,
  phone text,
  address text,
  avatar_url text,
  active boolean,
  created_at timestamptz
)
language sql
security definer set search_path = public
stable
as $$
  select 
    id, role, full_name, email, phone, address, avatar_url, active, created_at
  from accounts 
  where id = auth.uid();
$$;

-- Drop and recreate: parameter list changed (added p_avatar_url)
drop function if exists update_my_account(text, text, text);

create function update_my_account(
  p_full_name text default null,
  p_phone text default null,
  p_address text default null,
  p_avatar_url text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update accounts
  set
    full_name = coalesce(p_full_name, full_name),
    phone = coalesce(p_phone, phone),
    address = coalesce(p_address, address),
    avatar_url = coalesce(p_avatar_url, avatar_url)
  where id = auth.uid();
end;
$$;

-- New function — create or replace is fine here, nothing to drop first
create or replace function set_my_avatar(p_avatar_url text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update accounts
  set avatar_url = p_avatar_url
  where id = auth.uid();
end;
$$;

grant execute on function get_my_account() to authenticated;
grant execute on function update_my_account(text, text, text, text) to authenticated;
grant execute on function set_my_avatar(text) to authenticated;