create or replace function member_is_level_complete(p_member_id int)
returns boolean
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

revoke all on function member_is_level_complete(int) from public, anon;
grant execute on function member_is_level_complete(int) to authenticated;
