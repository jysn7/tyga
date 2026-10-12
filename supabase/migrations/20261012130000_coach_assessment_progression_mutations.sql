create or replace function coach_claim_assessment(p_appointment_id int)
returns void
language plpgsql
security definer set search_path = public
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

  if not exists (
    select 1
    from appointments a
    where a.id = p_appointment_id
      and a.type = 'assessment'
      and a.coach_id is null
      and a.status in ('requested', 'scheduled')
  ) then
    raise exception 'Assessment request is unavailable to claim';
  end if;

  update appointments
  set coach_id = v_coach_id
  where id = p_appointment_id
    and type = 'assessment'
    and coach_id is null;
end;
$$;

revoke all on function coach_claim_assessment(int) from public;
grant execute on function coach_claim_assessment(int) to authenticated;

create or replace function coach_record_assessment(
  p_appointment_id int,
  p_assessed_level_id int,
  p_notes text default null
)
returns void
language plpgsql
security definer set search_path = public
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

  if not exists (
    select 1
    from appointments a
    where a.id = p_appointment_id
      and a.type = 'assessment'
      and a.coach_id = v_coach_id
  ) then
    raise exception 'Assessment appointment not found or is not assigned to you';
  end if;

  if not exists (select 1 from levels where id = p_assessed_level_id) then
    raise exception 'Invalid assessed level: %', p_assessed_level_id;
  end if;

  update appointments
  set
    assessed_level_id = p_assessed_level_id,
    notes = p_notes,
    status = 'completed'
  where id = p_appointment_id
    and coach_id = v_coach_id
    and type = 'assessment';

  if not found then
    raise exception 'Unable to complete assessment for appointment %', p_appointment_id;
  end if;
end;
$$;

revoke all on function coach_record_assessment(int, int, text) from public;
grant execute on function coach_record_assessment(int, int, text) to authenticated;

create or replace function coach_record_parent_consultation(
  p_appointment_id int,
  p_notes text default null
)
returns void
language plpgsql
security definer set search_path = public
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

  if not exists (
    select 1
    from appointments a
    where a.id = p_appointment_id
      and a.type = 'parent_consultation'
      and a.coach_id = v_coach_id
  ) then
    raise exception 'Consultation appointment not found or is not assigned to you';
  end if;

  update appointments
  set
    notes = p_notes,
    status = 'completed'
  where id = p_appointment_id
    and coach_id = v_coach_id
    and type = 'parent_consultation';

  if not found then
    raise exception 'Unable to complete consultation for appointment %', p_appointment_id;
  end if;
end;
$$;

revoke all on function coach_record_parent_consultation(int, text) from public;
grant execute on function coach_record_parent_consultation(int, text) to authenticated;

create or replace function coach_submit_progression(
  p_member_id int,
  p_to_level_id int,
  p_badge_complete boolean default false,
  p_notes text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_coach_id int;
  v_from_level_id int;
begin
  select id into v_coach_id
  from coaches
  where account_id = auth.uid();

  if v_coach_id is null then
    raise exception 'Coach profile not found for the current user';
  end if;

  if not exists (select 1 from members where id = p_member_id) then
    raise exception 'Member not found';
  end if;

  if not exists (select 1 from levels where id = p_to_level_id) then
    raise exception 'Invalid target level: %', p_to_level_id;
  end if;

  select current_level_id into v_from_level_id
  from members
  where id = p_member_id;

  if v_from_level_id is null then
    raise exception 'Member has no current level to progress from';
  end if;

  insert into level_progressions (
    member_id,
    from_level_id,
    to_level_id,
    assessed_by,
    date,
    badge_complete,
    notes
  )
  values (
    p_member_id,
    v_from_level_id,
    p_to_level_id,
    v_coach_id,
    current_date,
    p_badge_complete,
    p_notes
  );
end;
$$;

revoke all on function coach_submit_progression(int, int, boolean, text) from public;
grant execute on function coach_submit_progression(int, int, boolean, text) to authenticated;
