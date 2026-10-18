create or replace function member_is_level_complete(p_member_id int)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current_level_id int;
  v_milestone_count int;
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

  select count(*) into v_milestone_count
  from curriculum_modules
  where level_id = v_current_level_id
    and is_milestone
    and archived_at is null;

  if v_milestone_count = 0 then
    return false;
  end if;

  return not exists (
    select 1
    from curriculum_modules cm
    where cm.level_id = v_current_level_id
      and cm.is_milestone
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
    raise exception 'Student must complete every active milestone in their current level before advancing';
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

revoke all on function member_is_level_complete(int) from public, anon;
revoke all on function coach_advance_member_level(int, boolean, text) from public, anon;
grant execute on function member_is_level_complete(int) to authenticated;
grant execute on function coach_advance_member_level(int, boolean, text) to authenticated;
