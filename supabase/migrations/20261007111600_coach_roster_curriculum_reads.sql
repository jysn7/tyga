create or replace function coach_get_roster()
returns table (
  programme_id int,
  programme_name text,
  member_id int,
  full_name text,
  current_level_id int,
  current_level_name text
)
language sql
security invoker
stable
as $$
  select distinct
    p.id,
    p.name,
    m.id,
    m.full_name,
    m.current_level_id,
    l.name
  from programme_coaches pc
  join programmes p on p.id = pc.programme_id
  join enrollments e on e.programme_id = p.id and e.status = 'active'
  join members m on m.id = e.member_id
  left join levels l on l.id = m.current_level_id
  where pc.coach_id = get_coach_id()
  order by p.name, m.full_name, m.id;
$$;

create or replace function coach_get_curriculum_modules(p_level_id int)
returns table (
  id int,
  level_id int,
  level_name text,
  category text,
  name text,
  description text,
  is_milestone boolean
)
language sql
security invoker
stable
as $$
  select
    cm.id,
    cm.level_id,
    l.name,
    cm.category,
    cm.name,
    cm.description,
    cm.is_milestone
  from curriculum_modules cm
  join levels l on l.id = cm.level_id
  where cm.level_id = p_level_id
    and cm.archived_at is null
    and l.archived_at is null
  order by cm.category, cm.name, cm.id;
$$;

revoke all on function coach_get_roster() from public;
revoke all on function coach_get_curriculum_modules(int) from public;

grant execute on function coach_get_roster() to authenticated;
grant execute on function coach_get_curriculum_modules(int) to authenticated;
