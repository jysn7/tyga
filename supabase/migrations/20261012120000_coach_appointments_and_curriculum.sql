create or replace function coach_get_appointments(p_type text default null)
returns table (
  id int,
  member_id int,
  member_name text,
  coach_id int,
  coach_name text,
  venue_id int,
  venue_name text,
  type text,
  status text,
  requested_at timestamptz,
  scheduled_at timestamptz,
  assessed_level_id int,
  assessed_level_name text,
  notes text
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_coach_id int;
begin
  select id into v_coach_id
  from coaches
  where account_id = auth.uid();

  if v_coach_id is null then
    raise exception 'Coach profile not found for the current user';
  end if;

  if p_type is not null and p_type not in ('assessment', 'parent_consultation') then
    raise exception 'Invalid appointment type: %', p_type;
  end if;

  return query
  select
    a.id,
    a.member_id,
    m.full_name as member_name,
    a.coach_id,
    coach_account.full_name as coach_name,
    a.venue_id,
    v.name as venue_name,
    a.type,
    a.status,
    a.requested_at,
    a.scheduled_at,
    a.assessed_level_id,
    l.name as assessed_level_name,
    a.notes
  from appointments a
  join members m on m.id = a.member_id
  left join coaches assigned_coach on assigned_coach.id = a.coach_id
  left join accounts coach_account on coach_account.id = assigned_coach.account_id
  left join venues v on v.id = a.venue_id
  left join levels l on l.id = a.assessed_level_id
  where (
      a.coach_id = v_coach_id
      or (a.coach_id is null and a.type = 'assessment')
    )
    and (p_type is null or a.type = p_type)
  order by a.requested_at desc, a.id desc;
end;
$$;

revoke all on function coach_get_appointments(text) from public;
grant execute on function coach_get_appointments(text) to authenticated;

create or replace function coach_tag_session_curriculum(
  p_session_id int,
  p_module_ids int[]
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_coach_id int;
  v_module_id int;
begin
  select id into v_coach_id
  from coaches
  where account_id = auth.uid();

  if v_coach_id is null then
    raise exception 'Coach profile not found for the current user';
  end if;

  if array_length(p_module_ids, 1) is null then
    raise exception 'At least one module ID must be provided';
  end if;

  if not exists (
    select 1
    from session_coaches sc
    where sc.session_id = p_session_id
      and sc.coach_id = v_coach_id
  ) then
    raise exception 'You are not assigned to this session';
  end if;

  foreach v_module_id in array p_module_ids
  loop
    if not exists (
      select 1
      from curriculum_modules cm
      join programmes p on p.level_id = cm.level_id
      join programme_sessions ps on ps.programme_id = p.id
      where ps.id = p_session_id
        and cm.id = v_module_id
    ) then
      raise exception 'Module % is not available for this programme level', v_module_id;
    end if;

    if not exists (
      select 1
      from session_curriculum_modules scm
      where scm.session_id = p_session_id
        and scm.curriculum_module_id = v_module_id
    ) then
      insert into session_curriculum_modules (session_id, curriculum_module_id)
      values (p_session_id, v_module_id);
    end if;
  end loop;
end;
$$;

revoke all on function coach_tag_session_curriculum(int, int[]) from public;
grant execute on function coach_tag_session_curriculum(int, int[]) to authenticated;
