
-- Coach Appointments (intake assessments and parent consultations)

--my appointments and unclaimed assessments

create or replace function coach_get_appointments(p_type text default null)
returns table (
  appointment_id int,
  type text,
  status text,
  member_id int,
  member_name text,
  member_age int,
  reported_skill_level text,
  venue_name text,
  requested_at timestamptz,
  scheduled_at timestamptz,
  coach_id int,
  coach_name text,
  is_unclaimed boolean,
  assessed_level_name text,
  notes text
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

  if p_type is not null and p_type not in ('assessment', 'parent_consultation') then
    raise exception 'Invalid type: %', p_type;
  end if;

  return query
  select
    ap.id,
    ap.type,
    ap.status,
    ap.member_id,
    m.full_name,
    extract(year from age(current_date, m.dob))::int,
    q.self_reported_skill_level,
    v.name,
    ap.requested_at,
    ap.scheduled_at,
    ap.coach_id,
    ca.full_name,
    (ap.coach_id is null),
    al.name,
    ap.notes
  from appointments ap
  join members m on m.id = ap.member_id
  join venues v on v.id = ap.venue_id
  left join member_questionnaires q on q.member_id = m.id
  left join coaches c on c.id = ap.coach_id
  left join accounts ca on ca.id = c.account_id
  left join levels al on al.id = ap.assessed_level_id
  where (
      ap.coach_id = v_coach_id
      -- unclaimed pool: only open assessment requests
      or (ap.coach_id is null
          and ap.type = 'assessment'
          and ap.status in ('requested', 'scheduled'))
    )
    and (p_type is null or ap.type = p_type)
  order by ap.requested_at desc;
end;
$$;


--claim an unclaimed assessment

create or replace function coach_claim_assessment(p_appointment_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_coach_id int := get_coach_id();
begin
  if v_coach_id is null then
    raise exception 'Access denied: coach role required';
  end if;

  --"and coach_id is null" stops two coaches claiming the same assessment at the same time.
  --whoever runs first wins, the second update matches 0 rows.
  update appointments
  set coach_id = v_coach_id
  where id = p_appointment_id
    and type = 'assessment'
    and coach_id is null
    and status in ('requested', 'scheduled');

  if not found then
    raise exception 'This assessment is no longer available to claim';
  end if;
end;
$$;


--record the result of an assessment

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
  v_coach_id int := get_coach_id();
begin
  if v_coach_id is null then
    raise exception 'Access denied: coach role required';
  end if;

  if p_assessed_level_id is null then
    raise exception 'Please choose the assessed level';
  end if;

  update appointments
  set
    assessed_level_id = p_assessed_level_id,
    status = 'completed',
    --add the coach's notes after any notes the parent has already written
    notes = case
      when p_notes is null or trim(p_notes) = '' then notes
      else concat_ws(E'\n\n', notes, p_notes)
    end
  where id = p_appointment_id
    and type = 'assessment'
    and coach_id = v_coach_id
    and status in ('requested', 'scheduled');

  if not found then
    raise exception 'Assessment not found, not assigned to you, or already closed';
  end if;
end;
$$;


--record a parent consultation--

create or replace function coach_record_parent_consultation(
  p_appointment_id int,
  p_notes text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_coach_id int := get_coach_id();
begin
  if v_coach_id is null then
    raise exception 'Access denied: coach role required';
  end if;

  update appointments
  set
    status = 'completed',
    notes = case
      when p_notes is null or trim(p_notes) = '' then notes
      else concat_ws(E'\n\n', notes, p_notes)
    end
  where id = p_appointment_id
    and type = 'parent_consultation'
    and coach_id = v_coach_id
    and status in ('requested', 'scheduled');

  if not found then
    raise exception 'Consultation not found, not assigned to you, or already closed';
  end if;
end;
$$;


-- ---------- Grants ----------

grant execute on function coach_get_appointments(text) to authenticated;
grant execute on function coach_claim_assessment(int) to authenticated;
grant execute on function coach_record_assessment(int, int, text) to authenticated;
grant execute on function coach_record_parent_consultation(int, text) to authenticated;
