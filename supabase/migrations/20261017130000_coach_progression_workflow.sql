create or replace function coach_assert_student_access(p_member_id int)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_coach_id int;
begin
  select c.id into v_coach_id
  from coaches c
  join accounts a on a.id = c.account_id
  where c.account_id = auth.uid()
    and a.role = 'coach';

  if v_coach_id is null then
    raise exception 'Access denied: coach role required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from enrollments e
    join programme_coaches pc on pc.programme_id = e.programme_id
    where e.member_id = p_member_id
      and e.status = 'active'
      and pc.coach_id = v_coach_id
  ) then
    raise exception 'Access denied: student is not actively enrolled in your programme'
      using errcode = '42501';
  end if;

  return v_coach_id;
end;
$$;

revoke all on function coach_assert_student_access(int) from public, anon, authenticated;

create or replace function member_is_level_complete(p_member_id int)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current_level_id int;
  v_module_count int;
begin
  perform coach_assert_student_access(p_member_id);

  select current_level_id into v_current_level_id
  from members
  where id = p_member_id;

  if not found or v_current_level_id is null then
    return false;
  end if;

  if not exists (
    select 1 from levels
    where id = v_current_level_id and archived_at is null
  ) then
    return false;
  end if;

  select count(*) into v_module_count
  from curriculum_modules
  where level_id = v_current_level_id
    and archived_at is null;

  if v_module_count = 0 then
    return false;
  end if;

  return not exists (
    select 1
    from curriculum_modules cm
    where cm.level_id = v_current_level_id
      and cm.archived_at is null
      and not exists (
        select 1
        from member_milestones mm
        where mm.member_id = p_member_id
          and mm.curriculum_module_id = cm.id
          and mm.completed_at is not null
      )
  );
end;
$$;

create or replace function coach_complete_module_for_enrolled(
  p_member_id int,
  p_module_id int,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_coach_id int;
  v_current_level_id int;
  v_updated_rows int;
begin
  v_coach_id := coach_assert_student_access(p_member_id);

  select current_level_id into v_current_level_id
  from members
  where id = p_member_id
  for update;

  if not found then
    raise exception 'Student not found';
  end if;

  if v_current_level_id is null then
    raise exception 'Student has no current level';
  end if;

  if not exists (
    select 1
    from curriculum_modules cm
    join levels l on l.id = cm.level_id
    where cm.id = p_module_id
      and cm.level_id = v_current_level_id
      and cm.archived_at is null
      and l.archived_at is null
  ) then
    raise exception 'Module is not part of the student''s active level';
  end if;

  update member_milestones
  set completed_at = current_date,
      verified_by = v_coach_id,
      notes = nullif(btrim(p_notes), '')
  where member_id = p_member_id
    and curriculum_module_id = p_module_id;

  get diagnostics v_updated_rows = row_count;

  if v_updated_rows = 0 then
    insert into member_milestones (
      member_id,
      curriculum_module_id,
      completed_at,
      verified_by,
      notes
    )
    values (
      p_member_id,
      p_module_id,
      current_date,
      v_coach_id,
      nullif(btrim(p_notes), '')
    );
  end if;
end;
$$;

create or replace function coach_uncomplete_module_for_enrolled(
  p_member_id int,
  p_module_id int
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current_level_id int;
begin
  perform coach_assert_student_access(p_member_id);

  select current_level_id into v_current_level_id
  from members
  where id = p_member_id
  for update;

  if not found or v_current_level_id is null then
    raise exception 'Student has no current level';
  end if;

  if not exists (
    select 1
    from curriculum_modules cm
    join levels l on l.id = cm.level_id
    where cm.id = p_module_id
      and cm.level_id = v_current_level_id
      and cm.archived_at is null
      and l.archived_at is null
  ) then
    raise exception 'Module is not part of the student''s active level';
  end if;

  update member_milestones
  set completed_at = null,
      verified_by = null,
      notes = null
  where member_id = p_member_id
    and curriculum_module_id = p_module_id;
end;
$$;

create or replace function coach_advance_member_level(
  p_member_id int,
  p_badge_complete boolean default false,
  p_notes text default null
)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_coach_id int;
  v_from_level_id int;
  v_from_sort_order int;
  v_to_level_id int;
begin
  v_coach_id := coach_assert_student_access(p_member_id);

  select current_level_id into v_from_level_id
  from members
  where id = p_member_id
  for update;

  if not found then
    raise exception 'Student not found';
  end if;

  if v_from_level_id is null then
    raise exception 'Student has no current level';
  end if;

  select sort_order into v_from_sort_order
  from levels
  where id = v_from_level_id
    and archived_at is null;

  if not found then
    raise exception 'Student''s current level is archived or unavailable';
  end if;

  if not member_is_level_complete(p_member_id) then
    raise exception 'Student must complete every active module in their current level before advancing';
  end if;

  select id into v_to_level_id
  from levels
  where sort_order > v_from_sort_order
    and archived_at is null
  order by sort_order, id
  limit 1;

  if v_to_level_id is null then
    raise exception 'No higher active level is configured';
  end if;

  insert into level_progressions (
    member_id,
    from_level_id,
    to_level_id,
    assessed_by,
    badge_complete,
    notes
  )
  values (
    p_member_id,
    v_from_level_id,
    v_to_level_id,
    v_coach_id,
    coalesce(p_badge_complete, false),
    nullif(btrim(p_notes), '')
  );

  update members
  set current_level_id = v_to_level_id
  where id = p_member_id;

  return v_to_level_id;
end;
$$;

drop policy if exists "Coaches manage milestones for their students" on member_milestones;

create policy "Coaches view milestones for their students"
on member_milestones for select
to authenticated
using (
  exists (
    select 1
    from enrollments e
    join programme_coaches pc on pc.programme_id = e.programme_id
    where e.member_id = member_milestones.member_id
      and pc.coach_id = get_coach_id()
  )
);

drop policy if exists "Coaches submit progressions for their own students" on level_progressions;

revoke all on function member_is_level_complete(int) from public, anon;
revoke all on function coach_complete_module_for_enrolled(int, int, text) from public, anon;
revoke all on function coach_uncomplete_module_for_enrolled(int, int) from public, anon;
revoke all on function coach_advance_member_level(int, boolean, text) from public, anon;

grant execute on function member_is_level_complete(int) to authenticated;
grant execute on function coach_complete_module_for_enrolled(int, int, text) to authenticated;
grant execute on function coach_uncomplete_module_for_enrolled(int, int) to authenticated;
grant execute on function coach_advance_member_level(int, boolean, text) to authenticated;
