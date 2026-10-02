-- ============================================================
-- Coach: My Roster
-- Create with: supabase migration new coach_roster
--
-- One row per (member, programme). A child in two of your programmes
-- appears twice, so the screen can filter by programme easily.
-- ============================================================

create or replace function coach_get_roster()
returns table (
  enrollment_id int,
  member_id int,
  member_name text,
  member_age int,
  gender text,
  current_level_id int,
  current_level_name text,
  next_level_id int,
  next_level_name text,
  programme_id int,
  programme_name text,
  attendance_rate int,   -- null until the child has any attendance recorded
  joined_at date
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_coach_id int := get_coach_id();
begin
  if v_coach_id is null then
    raise exception 'Access denied: coach role required';
  end if;

  return query
  select
    e.id,
    m.id,
    m.full_name,
    extract(year from age(current_date, m.dob))::int,
    m.gender,
    m.current_level_id,
    l.name,
    nl.id,
    nl.name,
    p.id,
    p.name,
    (
      select round(
        count(*) filter (where a.status = 'present')::numeric
        / nullif(count(*), 0) * 100
      )::int
      from attendance a
      join programme_sessions ps on ps.id = a.session_id
      where a.member_id = m.id and ps.programme_id = p.id
    ),
    e.joined_at
  from programme_coaches pc
  join programmes p on p.id = pc.programme_id and p.archived_at is null
  join enrollments e on e.programme_id = p.id and e.status = 'active'
  join members m on m.id = e.member_id and m.archived_at is null
  left join levels l on l.id = m.current_level_id
  left join levels nl on nl.sort_order = l.sort_order + 1   -- the level just above
  where pc.coach_id = v_coach_id
  order by p.name, m.full_name;
end;
$$;

grant execute on function coach_get_roster() to authenticated;
