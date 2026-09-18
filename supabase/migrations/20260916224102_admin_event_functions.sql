-- ============================================================
-- Admin: Event Management
-- ============================================================

-- ---------- Migrations ----------

-- Events: add description, start time, header image, and status
alter table events add column if not exists description text;
alter table events add column if not exists start_time time;
alter table events add column if not exists image_url text;
alter table events add column if not exists status text
  check (status in ('draft', 'active', 'cancelled', 'completed'))
  default 'active';

-- Registrations: add ticket fields now, even though redemption UI comes later —
-- doing it now means every registration (however it gets created) already
-- has a ticket, instead of retrofitting this after registrations exist.
alter table event_registrations add column if not exists ticket_code text unique;
alter table event_registrations add column if not exists checked_in_at timestamptz;
alter table event_registrations add column if not exists checked_in_by int references coaches(id);

-- Auto-generate a short, unique ticket code on every new registration —
-- so ticket generation isn't something admin (or anyone) has to trigger manually.
create or replace function generate_ticket_code()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_code is null then
    new.ticket_code := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_generate_ticket_code on event_registrations;
create trigger trg_generate_ticket_code
before insert on event_registrations
for each row execute function generate_ticket_code();

-- ---------- Storage Bucket ----------

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "Admins can upload event images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'event-images' and (select role from accounts where id = auth.uid()) = 'admin');

create policy "Admins can update event images"
on storage.objects for update
to authenticated
using (bucket_id = 'event-images' and (select role from accounts where id = auth.uid()) = 'admin');

create policy "Anyone can view event images"
on storage.objects for select
to public
using (bucket_id = 'event-images');

-- ---------- Admin Functions ----------

drop function if exists admin_get_events(int, text, boolean);
drop function if exists admin_get_events(int, text, boolean, text);
drop function if exists admin_get_event(int);
drop function if exists admin_create_event(text, text, int, date, time, numeric, int, int, int, text, text);
drop function if exists admin_create_event(text, int, date, text, time, numeric, int, int, int, text, text, text);
drop function if exists admin_update_event(int, text, text, int, date, time, numeric, int, int, int, text, text);
drop function if exists admin_update_event(int, text, text, int, date, time, numeric, int, int, int, text, text, text);
drop function if exists admin_delete_event(int);
drop function if exists admin_get_event_registrations(int);

-- 1. Get All Events (with filters)
create or replace function admin_get_events(
  p_event_id int default null,
  p_search text default null,
  p_upcoming boolean default null,
  p_status text default null
)
returns table (
  id int, name text, type text, description text, image_url text,
  venue_id int, venue_name text, event_date date, start_time time,
  entry_fee numeric, capacity int, min_age int, max_age int,
  status text, registered_count bigint
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    e.id, e.name, e.type, e.description, e.image_url,
    e.venue_id, v.name, e.event_date, e.start_time,
    e.entry_fee, e.capacity, e.min_age, e.max_age,
    e.status,
    coalesce((select count(*) from event_registrations er
      where er.event_id = e.id and er.status = 'registered'), 0)
  from events e
  left join venues v on v.id = e.venue_id
  where (p_event_id is null or e.id = p_event_id)
    and (p_search is null or e.name ilike '%' || p_search || '%')
    and (p_status is null or e.status = p_status)
    and (p_upcoming is null
         or (p_upcoming = true and e.event_date >= current_date)
         or (p_upcoming = false and e.event_date < current_date))
  order by e.event_date desc nulls last;
end;
$$;

-- 2. Get Single Event
create or replace function admin_get_event(p_event_id int)
returns table (
  id int, name text, type text, description text, image_url text,
  venue_id int, venue_name text, event_date date, start_time time,
  entry_fee numeric, capacity int, min_age int, max_age int,
  status text, registered_count bigint
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query select * from admin_get_events(p_event_id => p_event_id);
end;
$$;

-- 3. Create Event
create or replace function admin_create_event(
  p_name text,
  p_venue_id int,
  p_event_date date,
  p_type text default 'tournament',
  p_start_time time default null,
  p_entry_fee numeric default 0,
  p_capacity int default null,
  p_min_age int default null,
  p_max_age int default null,
  p_description text default null,
  p_image_url text default null,
  p_status text default 'active'
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_event_id int;
begin
  perform assert_is_admin();

  if p_type not in ('tournament', 'clinic', 'assessment', 'corporate', 'fun_tournament', 'parent_workshop') then
    raise exception 'Invalid type: %', p_type;
  end if;
  if p_status not in ('draft', 'active', 'cancelled', 'completed') then
    raise exception 'Invalid status: %', p_status;
  end if;
  if not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found: %', p_venue_id;
  end if;

  insert into events (
    name, type, venue_id, event_date, start_time, entry_fee,
    capacity, min_age, max_age, description, image_url, status
  )
  values (
    p_name, p_type, p_venue_id, p_event_date, p_start_time, p_entry_fee,
    p_capacity, p_min_age, p_max_age, p_description, p_image_url, p_status
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

-- 4. Update Event
create or replace function admin_update_event(
  p_event_id int,
  p_name text default null,
  p_type text default null,
  p_venue_id int default null,
  p_event_date date default null,
  p_start_time time default null,
  p_entry_fee numeric default null,
  p_capacity int default null,
  p_min_age int default null,
  p_max_age int default null,
  p_description text default null,
  p_image_url text default null,
  p_status text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_type is not null and p_type not in ('tournament', 'clinic', 'assessment', 'corporate', 'fun_tournament', 'parent_workshop') then
    raise exception 'Invalid type: %', p_type;
  end if;
  if p_status is not null and p_status not in ('draft', 'active', 'cancelled', 'completed') then
    raise exception 'Invalid status: %', p_status;
  end if;

  update events
  set
    name = coalesce(p_name, name),
    type = coalesce(p_type, type),
    venue_id = coalesce(p_venue_id, venue_id),
    event_date = coalesce(p_event_date, event_date),
    start_time = coalesce(p_start_time, start_time),
    entry_fee = coalesce(p_entry_fee, entry_fee),
    capacity = coalesce(p_capacity, capacity),
    min_age = coalesce(p_min_age, min_age),
    max_age = coalesce(p_max_age, max_age),
    description = coalesce(p_description, description),
    image_url = coalesce(p_image_url, image_url),
    status = coalesce(p_status, status)
  where id = p_event_id;
end;
$$;

-- 5. Delete Event
create or replace function admin_delete_event(p_event_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if exists (select 1 from event_registrations where event_id = p_event_id) then
    raise exception 'Cannot delete event: registrations already exist';
  end if;

  delete from events where id = p_event_id;
end;
$$;

-- 6. Get Event Registrations
create or replace function admin_get_event_registrations(p_event_id int)
returns table (
  registration_id int, member_id int, member_name text,
  status text, paid boolean, ticket_code text, checked_in_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select er.id, m.id, m.full_name, er.status, er.paid, er.ticket_code, er.checked_in_at
  from event_registrations er
  join members m on m.id = er.member_id
  where er.event_id = p_event_id
  order by m.full_name;
end;
$$;

-- ---------- Grants ----------

grant execute on function admin_get_events(int, text, boolean, text) to authenticated;
grant execute on function admin_get_event(int) to authenticated;
grant execute on function admin_create_event(text, int, date, text, time, numeric, int, int, int, text, text, text) to authenticated;
grant execute on function admin_update_event(int, text, text, int, date, time, numeric, int, int, int, text, text, text) to authenticated;
grant execute on function admin_delete_event(int) to authenticated;
grant execute on function admin_get_event_registrations(int) to authenticated;