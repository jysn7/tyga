-- ============================================================
-- 0. Prerequisites and helper
-- ============================================================

create index if not exists idx_members_account_id        on members (account_id);
create index if not exists idx_enrollments_member_status  on enrollments (member_id, status);
create index if not exists idx_enrollments_programme      on enrollments (programme_id, status);
create index if not exists idx_sessions_programme_date    on programme_sessions (programme_id, session_date);
create index if not exists idx_attendance_member          on attendance (member_id);

drop function if exists parent_get_dashboard_summary();
drop function if exists parent_get_sessions(date, date, int);
drop function if exists parent_get_session_detail(int);
drop function if exists parent_get_member_attendance(int, date, date);
drop function if exists parent_get_member_attendance_summary(int);

-- True when the member belongs to the signed-in parent's account
create or replace function parent_owns_member(p_member_id int)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from members m
    where m.id = p_member_id
      and m.account_id = auth.uid()
  );
$$;

-- ============================================================
-- 1. Dashboard summary (next session per child)
-- ============================================================
create or replace function parent_get_dashboard_summary()
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamp := (now() at time zone 'Africa/Johannesburg');
  v_result json;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select json_build_object(
    'children_count', (
      select count(*)
      from members m
      where m.account_id = v_uid
        and m.archived_at is null
    ),
    'upcoming_7_days', (
      select count(*)
      from enrollments e
      join members m on m.id = e.member_id
                    and m.account_id = v_uid
                    and m.archived_at is null
      join programme_sessions ps on ps.programme_id = e.programme_id
      where e.status = 'active'
        and coalesce(ps.status, '') <> 'cancelled'
        and (ps.session_date + ps.start_time) >= v_now
        and (ps.session_date + ps.start_time) <= v_now + interval '7 days'
    ),
    'children', coalesce((
      select json_agg(
        json_build_object(
          'member_id', m.id,
          'full_name', m.full_name,
          'next_session', (
            select json_build_object(
              'session_id',     ps.id,
              'programme_name', p.name,
              'session_date',   ps.session_date,
              'start_time',     ps.start_time,
              'end_time',       ps.end_time,
              'venue_name',     v.name
            )
            from enrollments e
            join programme_sessions ps on ps.programme_id = e.programme_id
            join programmes p on p.id = ps.programme_id
            join venues v on v.id = ps.venue_id
            where e.member_id = m.id
              and e.status = 'active'
              and coalesce(ps.status, '') <> 'cancelled'
              and (ps.session_date + ps.start_time) >= v_now
            order by ps.session_date, ps.start_time
            limit 1
          )
        )
        order by m.full_name
      )
      from members m
      where m.account_id = v_uid
        and m.archived_at is null
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

-- ============================================================
-- 2. Sessions for My Schedule (all children, or one)
-- ============================================================
create or replace function parent_get_sessions(
  p_start_date date,
  p_end_date date,
  p_member_id int default null
)
returns table (
  session_id        int,
  member_id         int,
  member_name       text,
  programme_id      int,
  programme_name    text,
  level_name        text,
  session_date      date,
  start_time        time,
  end_time          time,
  venue_name        text,
  venue_address     text,
  coach_names       text,
  status            text,
  attendance_status text,
  notes_present     boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_start_date is null or p_end_date is null or p_end_date < p_start_date then
    raise exception 'Invalid date range';
  end if;

  if p_end_date - p_start_date > 366 then
    raise exception 'Date range too large';
  end if;

  if p_member_id is not null and not parent_owns_member(p_member_id) then
    raise exception 'Access denied';
  end if;

  return query
  select
    ps.id,
    m.id,
    m.full_name::text,
    p.id,
    p.name::text,
    l.name::text,
    ps.session_date,
    ps.start_time,
    ps.end_time,
    v.name::text,
    v.address::text,
    (
      select string_agg(ac.full_name::text, ', ' order by ac.full_name)
      from session_coaches sc
      join coaches c on c.id = sc.coach_id
      join accounts ac on ac.id = c.account_id
      where sc.session_id = ps.id
    ),
    ps.status::text,
    att.status::text,
    (ps.coach_notes is not null and length(trim(ps.coach_notes)) > 0)
  from enrollments e
  join members m on m.id = e.member_id
                and m.account_id = v_uid
                and m.archived_at is null
  join programmes p on p.id = e.programme_id
  join programme_sessions ps on ps.programme_id = e.programme_id
  join venues v on v.id = ps.venue_id
  left join levels l on l.id = p.level_id
  left join attendance att on att.session_id = ps.id
                          and att.member_id = m.id
  where e.status = 'active'
    and ps.session_date between p_start_date and p_end_date
    and (p_member_id is null or m.id = p_member_id)
  order by ps.session_date, ps.start_time, m.full_name;
end;
$$;

-- ============================================================
-- 3. Single session detail (the session details panel)
-- ============================================================
create or replace function parent_get_session_detail(p_session_id int)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_result json;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- The parent must have at least one active child in this session's programme
  if not exists (
    select 1
    from programme_sessions ps
    join enrollments e on e.programme_id = ps.programme_id
                      and e.status = 'active'
    join members m on m.id = e.member_id
                  and m.account_id = v_uid
    where ps.id = p_session_id
  ) then
    raise exception 'Session not found or access denied';
  end if;

  select json_build_object(
    'session_id',            ps.id,
    'programme_id',          p.id,
    'programme_name',        p.name,
    'programme_description', p.description,
    'level_name',            l.name,
    'session_date',          ps.session_date,
    'start_time',            ps.start_time,
    'end_time',              ps.end_time,
    'duration_minutes',      (extract(epoch from (ps.end_time - ps.start_time)) / 60)::int,
    'status',                ps.status,
    'is_cancelled',          coalesce(ps.status, '') = 'cancelled',
    'venue', json_build_object(
      'name',      v.name,
      'address',   v.address,
      'latitude',  v.latitude,
      'longitude', v.longitude
    ),
    'coaches', coalesce((
      select json_agg(
        json_build_object('coach_id', c.id, 'full_name', ac.full_name)
        order by ac.full_name
      )
      from session_coaches sc
      join coaches c on c.id = sc.coach_id
      join accounts ac on ac.id = c.account_id
      where sc.session_id = ps.id
    ), '[]'::json),
    'coach_notes', ps.coach_notes,
    'curriculum', coalesce((
      select json_agg(
        json_build_object(
          'module_id', cm.id,
          'name',      cm.name,
          'category',  cm.category
        )
        order by cm.category nulls last, cm.name
      )
      from session_curriculum_modules scm
      join curriculum_modules cm on cm.id = scm.curriculum_module_id
      where scm.session_id = ps.id
    ), '[]'::json),
    -- Only this parent's own children, never other families
    'children', coalesce((
      select json_agg(
        json_build_object(
          'member_id',         m.id,
          'full_name',         m.full_name,
          'attendance_status', att.status,
          'marked_at',         att.marked_at
        )
        order by m.full_name
      )
      from enrollments e
      join members m on m.id = e.member_id
                    and m.account_id = v_uid
      left join attendance att on att.session_id = ps.id
                              and att.member_id = m.id
      where e.programme_id = ps.programme_id
        and e.status = 'active'
    ), '[]'::json),
    'previous_session_id', (
      select ps2.id
      from programme_sessions ps2
      where ps2.programme_id = ps.programme_id
        and (ps2.session_date, ps2.start_time) < (ps.session_date, ps.start_time)
      order by ps2.session_date desc, ps2.start_time desc
      limit 1
    ),
    'next_session_id', (
      select ps2.id
      from programme_sessions ps2
      where ps2.programme_id = ps.programme_id
        and (ps2.session_date, ps2.start_time) > (ps.session_date, ps.start_time)
        and coalesce(ps2.status, '') <> 'cancelled'
      order by ps2.session_date, ps2.start_time
      limit 1
    )
  ) into v_result
  from programme_sessions ps
  join programmes p on p.id = ps.programme_id
  join venues v on v.id = ps.venue_id
  left join levels l on l.id = p.level_id
  where ps.id = p_session_id;

  return v_result;
end;
$$;

-- ============================================================
-- 4. Attendance history for one child
-- ============================================================
create or replace function parent_get_member_attendance(
  p_member_id int,
  p_start_date date default null,
  p_end_date date default null
)
returns table (
  session_id        int,
  programme_name    text,
  session_date      date,
  start_time        time,
  end_time          time,
  venue_name        text,
  session_status    text,
  attendance_status text,
  marked_at         timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not parent_owns_member(p_member_id) then
    raise exception 'Access denied';
  end if;

  return query
  select
    ps.id,
    p.name::text,
    ps.session_date,
    ps.start_time,
    ps.end_time,
    v.name::text,
    ps.status::text,
    a.status::text,
    a.marked_at::timestamptz
  from attendance a
  join programme_sessions ps on ps.id = a.session_id
  join programmes p on p.id = ps.programme_id
  join venues v on v.id = ps.venue_id
  where a.member_id = p_member_id
    and (p_start_date is null or ps.session_date >= p_start_date)
    and (p_end_date   is null or ps.session_date <= p_end_date)
  order by ps.session_date desc, ps.start_time desc;
end;
$$;

-- ============================================================
-- 5. Attendance summary for one child
--    Rate = (present + late) / (marked sessions excluding excused);
--    cancelled sessions are ignored.
-- ============================================================
create or replace function parent_get_member_attendance_summary(p_member_id int)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_result json;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not parent_owns_member(p_member_id) then
    raise exception 'Access denied';
  end if;

  select json_build_object(
    'member_id',    p_member_id,
    'total_marked', count(*),
    'present',      count(*) filter (where a.status = 'present'),
    'late',         count(*) filter (where a.status = 'late'),
    'absent',       count(*) filter (where a.status = 'absent'),
    'excused',      count(*) filter (where a.status = 'excused'),
    'attendance_rate', case
      when count(*) filter (where a.status <> 'excused') = 0 then null
      else round(
        100.0 * count(*) filter (where a.status in ('present', 'late'))
              / count(*) filter (where a.status <> 'excused'),
        1)
    end
  ) into v_result
  from attendance a
  join programme_sessions ps on ps.id = a.session_id
  where a.member_id = p_member_id
    and coalesce(ps.status, '') <> 'cancelled';

  return v_result;
end;
$$;

-- ============================================================
-- 6. Lock down + grants
--    Supabase grants execute to anon by default, so revoke it explicitly.
-- ============================================================
revoke execute on function parent_owns_member(int) from public, anon, authenticated;

revoke execute on function parent_get_dashboard_summary() from public, anon;
revoke execute on function parent_get_sessions(date, date, int) from public, anon;
revoke execute on function parent_get_session_detail(int) from public, anon;
revoke execute on function parent_get_member_attendance(int, date, date) from public, anon;
revoke execute on function parent_get_member_attendance_summary(int) from public, anon;

grant execute on function parent_get_dashboard_summary() to authenticated;
grant execute on function parent_get_sessions(date, date, int) to authenticated;
grant execute on function parent_get_session_detail(int) to authenticated;
grant execute on function parent_get_member_attendance(int, date, date) to authenticated;
grant execute on function parent_get_member_attendance_summary(int) to authenticated;