-- ============================================================
-- Admin: Events
-- ============================================================

create or replace function admin_get_events(p_event_id int default null)
returns table (
  id int,
  name text,
  type text,
  min_age int,
  max_age int,
  venue_id int,
  venue_name text,
  event_date date,
  entry_fee decimal(10,2),
  capacity int,
  registration_count bigint,
  archived_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    e.id, e.name, e.type, e.min_age, e.max_age,
    e.venue_id, v.name as venue_name,
    e.event_date, e.entry_fee, e.capacity,
    coalesce((
      select count(*) from event_registrations er
      where er.event_id = e.id and er.status = 'registered'
    ), 0) as registration_count,
    e.archived_at
  from events e
  join venues v on v.id = e.venue_id
  where p_event_id is null or e.id = p_event_id
  order by e.event_date desc nulls last;
end;
$$;

create or replace function admin_create_event(
  p_name text,
  p_venue_id int,
  p_type text default null,
  p_min_age int default null,
  p_max_age int default null,
  p_event_date date default null,
  p_entry_fee decimal(10,2) default 0,
  p_capacity int default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_event_id int;
begin
  perform assert_is_admin();

  if p_type is not null and p_type not in
    ('tournament', 'clinic', 'assessment', 'corporate', 'fun_tournament', 'parent_workshop') then
    raise exception 'Invalid event type: %', p_type;
  end if;

  if not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found: %', p_venue_id;
  end if;

  insert into events (name, type, min_age, max_age, venue_id, event_date, entry_fee, capacity)
  values (p_name, p_type, p_min_age, p_max_age, p_venue_id, p_event_date, p_entry_fee, p_capacity)
  returning id into v_event_id;

  return v_event_id;
end;
$$;

create or replace function admin_update_event(
  p_event_id int,
  p_name text default null,
  p_type text default null,
  p_min_age int default null,
  p_max_age int default null,
  p_venue_id int default null,
  p_event_date date default null,
  p_entry_fee decimal(10,2) default null,
  p_capacity int default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_type is not null and p_type not in
    ('tournament', 'clinic', 'assessment', 'corporate', 'fun_tournament', 'parent_workshop') then
    raise exception 'Invalid event type: %', p_type;
  end if;

  if p_venue_id is not null and not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found: %', p_venue_id;
  end if;

  update events
  set
    name = coalesce(p_name, name),
    type = coalesce(p_type, type),
    min_age = coalesce(p_min_age, min_age),
    max_age = coalesce(p_max_age, max_age),
    venue_id = coalesce(p_venue_id, venue_id),
    event_date = coalesce(p_event_date, event_date),
    entry_fee = coalesce(p_entry_fee, entry_fee),
    capacity = coalesce(p_capacity, capacity)
  where id = p_event_id;
end;
$$;

create or replace function admin_archive_event(p_event_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update events set archived_at = now() where id = p_event_id;
end;
$$;

create or replace function admin_unarchive_event(p_event_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update events set archived_at = null where id = p_event_id;
end;
$$;

-- True delete only if nobody has ever registered — same principle as
-- programmes/enrollments: an event with real registration history
-- should be archived, not erased.
create or replace function admin_delete_event(p_event_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if not can_delete('event_registrations', 'event_id', p_event_id) then
    raise exception 'Cannot delete event: registrations exist for it';
  end if;

  delete from events where id = p_event_id;
end;
$$;

-- Cross-family view of who's registered/waitlisted for a given event.
create or replace function admin_get_event_registrations(p_event_id int)
returns table (
  id int,
  member_id int,
  member_full_name text,
  status text,
  paid boolean
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select er.id, er.member_id, m.full_name, er.status, er.paid
  from event_registrations er
  join members m on m.id = er.member_id
  where er.event_id = p_event_id
  order by er.status, m.full_name;
end;
$$;


-- ============================================================
-- Grants
-- ============================================================

grant execute on function admin_get_events(int) to authenticated;
grant execute on function admin_create_event(text, int, text, int, int, date, decimal, int) to authenticated;
grant execute on function admin_update_event(int, text, text, int, int, int, date, decimal, int) to authenticated;
grant execute on function admin_archive_event(int) to authenticated;
grant execute on function admin_unarchive_event(int) to authenticated;
grant execute on function admin_delete_event(int) to authenticated;
grant execute on function admin_get_event_registrations(int) to authenticated;