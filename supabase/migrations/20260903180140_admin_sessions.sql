-- ============================================================
-- TYGA Platform — Admin: Session Management
-- Assumes admin-shared-functions.sql and admin-programmes.sql
-- have been run first
-- ============================================================

-- ============================================================
-- 1. SESSION GENERATION
-- ============================================================

create or replace function admin_generate_programme_sessions(
  p_programme_id int,
  p_days_of_week int[],  -- 0 = Sunday ... 6 = Saturday
  p_start_time time,
  p_end_time time,
  p_range_start date,
  p_range_end date,
  p_venue_id int default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_day date;
  v_count int := 0;
  v_session_id int;
  v_venue_id int;
begin
  perform assert_is_admin();

  if array_length(p_days_of_week, 1) is null then
    raise exception 'At least one day must be specified';
  end if;

  if not exists (select 1 from programmes where id = p_programme_id and archived_at is null) then
    raise exception 'Programme not found or is archived: %', p_programme_id;
  end if;

  -- Use programme's venue if not specified
  if p_venue_id is null then
    select venue_id into v_venue_id from programmes where id = p_programme_id;
  else
    v_venue_id := p_venue_id;
  end if;

  v_day := p_range_start;

  while v_day <= p_range_end loop
    if extract(dow from v_day)::int = any(p_days_of_week) then
      insert into programme_sessions (
        programme_id, session_date, start_time, end_time, venue_id
      )
      values (p_programme_id, v_day, p_start_time, p_end_time, v_venue_id)
      returning id into v_session_id;

      -- Auto-assign programme coaches to this session
      insert into session_coaches (session_id, coach_id, role_in_session)
      select v_session_id, pc.coach_id, pc.role_in_programme
      from programme_coaches pc
      where pc.programme_id = p_programme_id;

      v_count := v_count + 1;
    end if;
    v_day := v_day + 1;
  end loop;

  return v_count;
end;
$$;


-- ============================================================
-- 2. SESSION CRUD
-- ============================================================

-- ---------- Get Sessions ----------

create or replace function admin_get_sessions(
  p_programme_id int default null,
  p_start_date date default null,
  p_end_date date default null,
  p_status text default null,
  p_session_id int default null
)
returns table (
  id int,
  programme_id int,
  programme_name text,
  session_date date,
  start_time time,
  end_time time,
  venue_id int,
  venue_name text,
  status text,
  coach_notes text,
  coach_count bigint,
  enrolled_count bigint,
  attendance_count bigint
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    ps.id,
    ps.programme_id,
    p.name as programme_name,
    ps.session_date,
    ps.start_time,
    ps.end_time,
    ps.venue_id,
    v.name as venue_name,
    ps.status,
    ps.coach_notes,
    (
      select count(distinct sc.coach_id) from session_coaches sc
      where sc.session_id = ps.id
    ) as coach_count,
    (
      select count(*) from enrollments e
      where e.programme_id = p.id and e.status = 'active'
    ) as enrolled_count,
    (
      select count(*) from attendance a
      where a.session_id = ps.id
    ) as attendance_count
  from programme_sessions ps
  left join programmes p on p.id = ps.programme_id
  left join venues v on v.id = ps.venue_id
  where (p_session_id is null or ps.id = p_session_id)
    and (p_programme_id is null or ps.programme_id = p_programme_id)
    and (p_start_date is null or ps.session_date >= p_start_date)
    and (p_end_date is null or ps.session_date <= p_end_date)
    and (p_status is null or ps.status = p_status)
  order by ps.session_date desc;
end;
$$;

-- ---------- Update Session ----------

create or replace function admin_update_session(
  p_session_id int,
  p_session_date date default null,
  p_start_time time default null,
  p_end_time time default null,
  p_venue_id int default null,
  p_status text default null,
  p_coach_notes text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_status is not null and p_status not in ('scheduled', 'cancelled', 'completed') then
    raise exception 'Invalid status: %', p_status;
  end if;

  if p_venue_id is not null and not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found: %', p_venue_id;
  end if;

  update programme_sessions
  set
    session_date = coalesce(p_session_date, session_date),
    start_time = coalesce(p_start_time, start_time),
    end_time = coalesce(p_end_time, end_time),
    venue_id = coalesce(p_venue_id, venue_id),
    status = coalesce(p_status, status),
    coach_notes = coalesce(p_coach_notes, coach_notes)
  where id = p_session_id;
end;
$$;

-- ---------- Delete Session ----------

create or replace function admin_delete_session(p_session_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  
  if exists (select 1 from attendance where session_id = p_session_id) then
    raise exception 'Cannot delete session with attendance records';
  end if;

  delete from programme_sessions where id = p_session_id;
end;
$$;


-- ============================================================
-- 3. SESSION COACHES
-- ============================================================

-- ---------- Sync Session Coaches from Programme ----------

create or replace function admin_sync_session_coaches(p_session_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_programme_id int;
begin
  perform assert_is_admin();

  select programme_id into v_programme_id
  from programme_sessions where id = p_session_id;

  if not found then
    raise exception 'Session not found: %', p_session_id;
  end if;

  delete from session_coaches where session_id = p_session_id;

  insert into session_coaches (session_id, coach_id, role_in_session)
  select p_session_id, pc.coach_id, pc.role_in_programme
  from programme_coaches pc
  where pc.programme_id = v_programme_id;
end;
$$;

-- ---------- Override: Add Coach to Session ----------

create or replace function admin_add_coach_to_session(
  p_session_id int,
  p_coach_id int,
  p_role_in_session text default 'assistant'
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_role_in_session not in ('lead', 'assistant', 'volunteer') then
    raise exception 'Invalid role: %', p_role_in_session;
  end if;

  if not exists (select 1 from programme_sessions where id = p_session_id) then
    raise exception 'Session not found: %', p_session_id;
  end if;

  if not exists (select 1 from coaches where id = p_coach_id) then
    raise exception 'Coach not found: %', p_coach_id;
  end if;

  insert into session_coaches (session_id, coach_id, role_in_session)
  values (p_session_id, p_coach_id, p_role_in_session)
  on conflict (session_id, coach_id) do update
    set role_in_session = excluded.role_in_session;
end;
$$;

-- ---------- Remove Coach from Session ----------

create or replace function admin_remove_coach_from_session(
  p_session_id int,
  p_coach_id int
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from session_coaches
  where session_id = p_session_id and coach_id = p_coach_id;
end;
$$;


-- ============================================================
-- 4. CURRICULUM MODULES (Tagging)
-- ============================================================

-- ---------- Tag Modules to Session ----------

create or replace function admin_tag_session_curriculum(
  p_session_id int,
  p_module_ids int[]
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_module_id int;
begin
  perform assert_is_admin();

  if array_length(p_module_ids, 1) is null then
    raise exception 'At least one module ID must be provided';
  end if;

  if not exists (select 1 from programme_sessions where id = p_session_id) then
    raise exception 'Session not found: %', p_session_id;
  end if;

  foreach v_module_id in array p_module_ids
  loop
    if not exists (select 1 from curriculum_modules where id = v_module_id) then
      raise exception 'Invalid module_id: %', v_module_id;
    end if;
  end loop;

  insert into session_curriculum_modules (session_id, curriculum_module_id)
  select p_session_id, unnest(p_module_ids)
  on conflict (session_id, curriculum_module_id) do nothing;
end;
$$;

-- ---------- Remove Module from Session ----------

create or replace function admin_remove_module_from_session(
  p_session_id int,
  p_module_id int
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from session_curriculum_modules
  where session_id = p_session_id and curriculum_module_id = p_module_id;
end;
$$;

-- ---------- Get Modules for Session ----------

create or replace function admin_get_session_modules(p_session_id int)
returns table (
  id int,
  name text,
  category text,
  description text,
  is_milestone boolean
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select cm.id, cm.name, cm.category, cm.description, cm.is_milestone
  from session_curriculum_modules scm
  join curriculum_modules cm on cm.id = scm.curriculum_module_id
  where scm.session_id = p_session_id
  order by cm.name;
end;
$$;


-- ============================================================
-- 5. RATIO CHECK
-- ============================================================

create or replace function admin_check_programme_ratio(p_programme_id int)
returns table (
  session_id int,
  session_date date,
  enrolled_count bigint,
  coach_count bigint,
  max_ratio int,
  is_over_ratio boolean
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    ps.id as session_id,
    ps.session_date,
    (
      select count(*) from enrollments e
      where e.programme_id = p_programme_id and e.status = 'active'
    ) as enrolled_count,
    (
      select count(distinct sc.coach_id) from session_coaches sc
      where sc.session_id = ps.id
    ) as coach_count,
    p.max_ratio,
    (
      select count(*) from enrollments e
      where e.programme_id = p_programme_id and e.status = 'active'
    ) > (
      select count(distinct sc.coach_id) * p.max_ratio
      from session_coaches sc
      where sc.session_id = ps.id
    ) as is_over_ratio
  from programme_sessions ps
  join programmes p on p.id = ps.programme_id
  where ps.programme_id = p_programme_id
  order by ps.session_date;
end;
$$;


-- ============================================================
-- 6. GRANTS
-- ============================================================

grant execute on function admin_generate_programme_sessions(int, int[], time, time, date, date, int) to authenticated;
grant execute on function admin_get_sessions(int, date, date, text, int) to authenticated;
grant execute on function admin_update_session(int, date, time, time, int, text, text) to authenticated;
grant execute on function admin_delete_session(int) to authenticated;

grant execute on function admin_sync_session_coaches(int) to authenticated;
grant execute on function admin_add_coach_to_session(int, int, text) to authenticated;
grant execute on function admin_remove_coach_from_session(int, int) to authenticated;

grant execute on function admin_tag_session_curriculum(int, int[]) to authenticated;
grant execute on function admin_remove_module_from_session(int, int) to authenticated;
grant execute on function admin_get_session_modules(int) to authenticated;

grant execute on function admin_check_programme_ratio(int) to authenticated;