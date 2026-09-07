-- ============================================================
-- TYGA Platform — Admin: Programme Management
-- Assumes admin-shared-functions.sql has been run first
-- ============================================================

-- ---------- Add archived_at column ----------
alter table programmes add column if not exists archived_at timestamptz;


-- ============================================================
-- 1. PROGRAMME CRUD
-- ============================================================

-- ---------- Get Programmes ----------

create or replace function admin_get_programmes(
  p_programme_id int default null,
  p_search text default null,
  p_level_id int default null,
  p_archived boolean default false
)
returns table (
  id int,
  name text,
  type text,
  level_id int,
  level_name text,
  venue_id int,
  venue_name text,
  min_age int,
  max_age int,
  gender_restriction text,
  recurrence_rule text,
  price numeric,
  capacity int,
  max_ratio int,
  enrolled_count bigint,
  archived_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    p.id, p.name, p.type, p.level_id, l.name as level_name,
    p.venue_id, v.name as venue_name, p.min_age, p.max_age,
    p.gender_restriction, p.recurrence_rule, p.price, p.capacity, p.max_ratio,
    coalesce((
      select count(*) from enrollments e
      where e.programme_id = p.id and e.status = 'active'
    ), 0) as enrolled_count,
    p.archived_at, p.created_at
  from programmes p
  left join levels l on l.id = p.level_id
  left join venues v on v.id = p.venue_id
  where
    (p_programme_id is null or p.id = p_programme_id)
    and (p_level_id is null or p.level_id = p_level_id)
    and (
      (p_archived = false and p.archived_at is null) or
      (p_archived = true and p.archived_at is not null)
    )
    and (p_search is null or p.name ilike '%' || p_search || '%')
  order by p.created_at desc;
end;
$$;

-- ---------- Get Single Programme ----------

create or replace function admin_get_programme(p_programme_id int)
returns table (
  id int,
  name text,
  type text,
  level_id int,
  level_name text,
  venue_id int,
  venue_name text,
  min_age int,
  max_age int,
  gender_restriction text,
  recurrence_rule text,
  price numeric,
  capacity int,
  max_ratio int,
  enrolled_count bigint,
  archived_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    p.id, p.name, p.type, p.level_id, l.name as level_name,
    p.venue_id, v.name as venue_name, p.min_age, p.max_age,
    p.gender_restriction, p.recurrence_rule, p.price, p.capacity, p.max_ratio,
    coalesce((
      select count(*) from enrollments e
      where e.programme_id = p.id and e.status = 'active'
    ), 0) as enrolled_count,
    p.archived_at, p.created_at
  from programmes p
  left join levels l on l.id = p.level_id
  left join venues v on v.id = p.venue_id
  where p.id = p_programme_id;
end;
$$;

-- ---------- Create Programme ----------

create or replace function admin_create_programme(
  p_name text,
  p_type text,
  p_venue_id int,
  p_level_id int default null,
  p_min_age int default null,
  p_max_age int default null,
  p_gender_restriction text default 'any',
  p_recurrence_rule text default null,
  p_price numeric default 0,
  p_capacity int default 0,
  p_max_ratio int default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_programme_id int;
  v_level levels%rowtype;
begin
  perform assert_is_admin();

  -- Validate type
  if p_type not in ('development', 'weekly_community', 'holiday_camp', 'clinic', 'corporate', 'league') then
    raise exception 'Invalid type: %', p_type;
  end if;
  if p_gender_restriction not in ('male', 'female', 'any') then
    raise exception 'Invalid gender_restriction: %', p_gender_restriction;
  end if;

  -- Get level defaults if level_id provided
  if p_level_id is not null then
    select * into v_level from levels where id = p_level_id;
    if not found then
      raise exception 'Level not found: %', p_level_id;
    end if;
  end if;

  -- Validate venue exists
  if not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found: %', p_venue_id;
  end if;

  insert into programmes (
    name, type, level_id, venue_id, min_age, max_age,
    gender_restriction, recurrence_rule, price, capacity, max_ratio
  )
  values (
    p_name, p_type, p_level_id, p_venue_id,
    coalesce(p_min_age, v_level.default_age_min),
    coalesce(p_max_age, v_level.default_age_max),
    p_gender_restriction, p_recurrence_rule, p_price, p_capacity,
    coalesce(p_max_ratio, v_level.default_ratio)
  )
  returning id into v_programme_id;

  return v_programme_id;
end;
$$;

-- ---------- Update Programme ----------

create or replace function admin_update_programme(
  p_programme_id int,
  p_name text default null,
  p_type text default null,
  p_level_id int default null,
  p_venue_id int default null,
  p_min_age int default null,
  p_max_age int default null,
  p_gender_restriction text default null,
  p_recurrence_rule text default null,
  p_term_start date default null,
  p_term_end date default null,
  p_price numeric default null,
  p_capacity int default null,
  p_max_ratio int default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_level levels%rowtype;
begin
  perform assert_is_admin();

  if p_type is not null and p_type not in ('development', 'weekly_community', 'holiday_camp', 'clinic', 'corporate', 'league') then
    raise exception 'Invalid type: %', p_type;
  end if;
  if p_gender_restriction is not null and p_gender_restriction not in ('male', 'female', 'any') then
    raise exception 'Invalid gender_restriction: %', p_gender_restriction;
  end if;

  if p_venue_id is not null and not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found: %', p_venue_id;
  end if;

  if p_level_id is not null then
    select * into v_level from levels where id = p_level_id;
    if not found then
      raise exception 'Level not found: %', p_level_id;
    end if;
  end if;

  update programmes
  set
    name = coalesce(p_name, name),
    type = coalesce(p_type, type),
    level_id = coalesce(p_level_id, level_id),
    venue_id = coalesce(p_venue_id, venue_id),
    min_age = coalesce(p_min_age, min_age),
    max_age = coalesce(p_max_age, max_age),
    gender_restriction = coalesce(p_gender_restriction, gender_restriction),
    recurrence_rule = coalesce(p_recurrence_rule, recurrence_rule),
    term_start = coalesce(p_term_start, term_start),
    term_end = coalesce(p_term_end, term_end),
    price = coalesce(p_price, price),
    capacity = coalesce(p_capacity, capacity),
    max_ratio = coalesce(p_max_ratio, 
      case when p_level_id is not null then v_level.default_ratio else max_ratio end
    )
  where id = p_programme_id;
end;
$$;


-- ---------- Archive / Unarchive / Delete ----------

create or replace function admin_archive_programme(p_programme_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  
  if not exists (select 1 from programmes where id = p_programme_id) then
    raise exception 'Programme not found: %', p_programme_id;
  end if;

  update programmes set archived_at = now() where id = p_programme_id;
end;
$$;

create or replace function admin_unarchive_programme(p_programme_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  
  if not exists (select 1 from programmes where id = p_programme_id) then
    raise exception 'Programme not found: %', p_programme_id;
  end if;

  update programmes set archived_at = null where id = p_programme_id;
end;
$$;

create or replace function admin_delete_programme(p_programme_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  
  if exists (select 1 from enrollments where programme_id = p_programme_id and status = 'active') then
    raise exception 'Cannot delete programme with active enrollments';
  end if;

  if exists (
    select 1 from attendance a
    join programme_sessions ps on ps.id = a.session_id
    where ps.programme_id = p_programme_id
  ) then
    raise exception 'Cannot delete programme with attendance history — archive it instead';
  end if;

  delete from programmes where id = p_programme_id;
end;
$$;


-- ============================================================
-- 2. DROPDOWN HELPERS
-- ============================================================

create or replace function admin_get_venues()
returns table (id int, name text)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query select v.id, v.name from venues v order by v.name;
end;
$$;

create or replace function admin_get_levels()
returns table (id int, name text)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query select l.id, l.name from levels l order by l.sort_order;
end;
$$;

create or replace function admin_get_coaches_for_programme()
returns table (id int, full_name text, email text)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  
  return query
  select c.id, a.full_name, a.email
  from coaches c
  join accounts a on a.id = c.account_id
  where a.active = true
  order by a.full_name;
end;
$$;


-- ============================================================
-- 3. PROGRAMME COACHES
-- ============================================================

create or replace function admin_get_programme_coaches(p_programme_id int)
returns table (
  coach_id int,
  full_name text,
  email text,
  role_in_programme text
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    c.id as coach_id,
    a.full_name,
    a.email,
    pc.role_in_programme
  from programme_coaches pc
  join coaches c on c.id = pc.coach_id
  join accounts a on a.id = c.account_id
  where pc.programme_id = p_programme_id
  order by a.full_name;
end;
$$;

create or replace function admin_assign_coach_to_programme(
  p_programme_id int,
  p_coach_id int,
  p_role_in_programme text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_role_in_programme not in ('lead', 'assistant', 'volunteer') then
    raise exception 'Invalid role: %', p_role_in_programme;
  end if;

  if not exists (select 1 from programmes where id = p_programme_id) then
    raise exception 'Programme not found: %', p_programme_id;
  end if;

  if not exists (select 1 from coaches where id = p_coach_id) then
    raise exception 'Coach not found: %', p_coach_id;
  end if;

  insert into programme_coaches (programme_id, coach_id, role_in_programme)
  values (p_programme_id, p_coach_id, p_role_in_programme)
  on conflict (programme_id, coach_id) do update
    set role_in_programme = excluded.role_in_programme;
end;
$$;

create or replace function admin_remove_coach_from_programme(
  p_programme_id int,
  p_coach_id int
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from programme_coaches
  where programme_id = p_programme_id and coach_id = p_coach_id;
end;
$$;


-- ============================================================
-- 4. GRANTS
-- ============================================================

grant execute on function admin_get_programmes(int, text, int, boolean) to authenticated;
grant execute on function admin_get_programme(int) to authenticated;
grant execute on function admin_create_programme(text, text, int, int, int, int, text, text, numeric, int, int) to authenticated;
grant execute on function admin_update_programme(int, text, text, int, int, int, int, text, text, numeric, int, int) to authenticated;
grant execute on function admin_archive_programme(int) to authenticated;
grant execute on function admin_unarchive_programme(int) to authenticated;
grant execute on function admin_delete_programme(int) to authenticated;

grant execute on function admin_get_venues() to authenticated;
grant execute on function admin_get_levels() to authenticated;
grant execute on function admin_get_coaches_for_programme() to authenticated;

grant execute on function admin_get_programme_coaches(int) to authenticated;
grant execute on function admin_assign_coach_to_programme(int, int, text) to authenticated;
grant execute on function admin_remove_coach_from_programme(int, int) to authenticated;