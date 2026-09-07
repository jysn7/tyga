-- ============================================================
-- TYGA Platform — Admin: Venue Management
-- ============================================================

alter table venues add column if not exists latitude numeric(9,6);
alter table venues add column if not exists longitude numeric(9,6);

drop function if exists admin_get_venues();
drop function if exists admin_get_venue(int);
drop function if exists admin_create_venue(text, text, text, numeric, numeric);
drop function if exists admin_update_venue(int, text, text, text, numeric, numeric);
drop function if exists admin_delete_venue(int);

-- ---------- List / search venues ----------

create or replace function admin_get_venues(
  p_venue_id int default null,
  p_search text default null
)
returns table (
  id int,
  name text,
  address text,
  type text,
  latitude numeric,
  longitude numeric,
  programme_count bigint
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    v.id, v.name, v.address, v.type, v.latitude, v.longitude,
    coalesce((select count(*) from programmes p where p.venue_id = v.id), 0) as programme_count
  from venues v
  where (p_venue_id is null or v.id = p_venue_id)
    and (p_search is null or v.name ilike '%' || p_search || '%' or v.address ilike '%' || p_search || '%')
  order by v.name;
end;
$$;

-- ---------- Get a single venue ----------

create or replace function admin_get_venue(p_venue_id int)
returns table (
  id int,
  name text,
  address text,
  type text,
  latitude numeric,
  longitude numeric,
  programme_count bigint
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    v.id, v.name, v.address, v.type, v.latitude, v.longitude,
    coalesce((select count(*) from programmes p where p.venue_id = v.id), 0)
  from venues v
  where v.id = p_venue_id;
end;
$$;

-- ---------- Create venue ----------

create or replace function admin_create_venue(
  p_name text,
  p_address text,
  p_type text,
  p_latitude numeric default null,
  p_longitude numeric default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_venue_id int;
begin
  perform assert_is_admin();

  if p_type not in ('practice_ground', 'course', 'range', 'school') then
    raise exception 'Invalid type: %', p_type;
  end if;

  insert into venues (name, address, type, latitude, longitude)
  values (p_name, p_address, p_type, p_latitude, p_longitude)
  returning id into v_venue_id;

  return v_venue_id;
end;
$$;

-- ---------- Update venue ----------

create or replace function admin_update_venue(
  p_venue_id int,
  p_name text default null,
  p_address text default null,
  p_type text default null,
  p_latitude numeric default null,
  p_longitude numeric default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_type is not null and p_type not in ('practice_ground', 'course', 'range', 'school') then
    raise exception 'Invalid type: %', p_type;
  end if;

  update venues
  set
    name = coalesce(p_name, name),
    address = coalesce(p_address, address),
    type = coalesce(p_type, type),
    latitude = coalesce(p_latitude, latitude),
    longitude = coalesce(p_longitude, longitude)
  where id = p_venue_id;
end;
$$;

-- ---------- Delete venue ----------
-- Blocked if anything still references it — a venue is a foreign key
-- target for programmes, programme_sessions, appointments, bookings, and events.

create or replace function admin_delete_venue(p_venue_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if exists (select 1 from programmes where venue_id = p_venue_id) then
    raise exception 'Cannot delete venue: still assigned to one or more programmes';
  end if;
  if exists (select 1 from programme_sessions where venue_id = p_venue_id) then
    raise exception 'Cannot delete venue: still referenced by scheduled sessions';
  end if;
  if exists (select 1 from appointments where venue_id = p_venue_id) then
    raise exception 'Cannot delete venue: still referenced by appointments';
  end if;
  if exists (select 1 from bookings where venue_id = p_venue_id) then
    raise exception 'Cannot delete venue: still referenced by bookings';
  end if;
  if exists (select 1 from events where venue_id = p_venue_id) then
    raise exception 'Cannot delete venue: still referenced by events';
  end if;

  delete from venues where id = p_venue_id;
end;
$$;

grant execute on function admin_get_venues(int, text) to authenticated;
grant execute on function admin_get_venue(int) to authenticated;
grant execute on function admin_create_venue(text, text, text, numeric, numeric) to authenticated;
grant execute on function admin_update_venue(int, text, text, text, numeric, numeric) to authenticated;
grant execute on function admin_delete_venue(int) to authenticated;