-- ---------- Phase 2: Member Management (Onboarding) ----------

-- Creates a new member (participant) for the currently authenticated user.
-- Parents use this to add their children to the system.
create or replace function create_member(
  p_full_name text,
  p_dob date,
  p_gender text,
  p_medical_notes text default null,
  p_emergency_contact text default null,
  p_current_level_id int default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_member_id int;
begin
  -- Validate gender
  if p_gender not in ('male', 'female', 'any') then
    raise exception 'Invalid gender. Must be male, female, or any';
  end if;

  -- Validate level exists if provided
  if p_current_level_id is not null and
     not exists (select 1 from levels where id = p_current_level_id) then
    raise exception 'Invalid level_id: %', p_current_level_id;
  end if;

  -- Validate DOB is not in the future
  if p_dob > current_date then
    raise exception 'Date of birth cannot be in the future';
  end if;

  insert into members (
    account_id,
    full_name,
    dob,
    gender,
    medical_notes,
    emergency_contact,
    current_level_id
  )
  values (
    auth.uid(),
    p_full_name,
    p_dob,
    p_gender,
    p_medical_notes,
    p_emergency_contact,
    p_current_level_id
  )
  returning id into v_member_id;

  return v_member_id;
end;
$$;


-- Updates a member's details. Only the parent who owns the member
-- can update it (enforced by RLS, but we check anyway).
create or replace function update_member(
  p_member_id int,
  p_full_name text default null,
  p_dob date default null,
  p_gender text default null,
  p_medical_notes text default null,
  p_emergency_contact text default null,
  p_current_level_id int default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Verify the member belongs to the current user
  if not exists (
    select 1 from members
    where id = p_member_id and account_id = auth.uid()
  ) then
    raise exception 'Member not found or access denied';
  end if;

  -- Validate gender if provided
  if p_gender is not null and p_gender not in ('male', 'female', 'any') then
    raise exception 'Invalid gender. Must be male, female, or any';
  end if;

  -- Validate level exists if provided
  if p_current_level_id is not null and
     not exists (select 1 from levels where id = p_current_level_id) then
    raise exception 'Invalid level_id: %', p_current_level_id;
  end if;

  -- Validate DOB is not in the future
  if p_dob is not null and p_dob > current_date then
    raise exception 'Date of birth cannot be in the future';
  end if;

  update members
  set
    full_name = coalesce(p_full_name, full_name),
    dob = coalesce(p_dob, dob),
    gender = coalesce(p_gender, gender),
    medical_notes = coalesce(p_medical_notes, medical_notes),
    emergency_contact = coalesce(p_emergency_contact, emergency_contact),
    current_level_id = coalesce(p_current_level_id, current_level_id)
  where id = p_member_id;
end;
$$;


-- Submits the onboarding questionnaire for a member.
-- Each member can only have one questionnaire (enforced by unique constraint).
create or replace function submit_member_questionnaire(
  p_member_id int,
  p_availability jsonb,
  p_self_reported_skill_level text,
  p_interests jsonb,
  p_gear_owned jsonb
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Verify the member belongs to the current user
  if not exists (
    select 1 from members
    where id = p_member_id and account_id = auth.uid()
  ) then
    raise exception 'Member not found or access denied';
  end if;

  -- Validate that the member doesn't already have a submitted questionnaire
  if exists (
    select 1 from member_questionnaires
    where member_id = p_member_id and submitted_at is not null
  ) then
    raise exception 'Questionnaire already submitted for this member';
  end if;

  insert into member_questionnaires (
    member_id,
    availability,
    self_reported_skill_level,
    interests,
    gear_owned,
    submitted_at
  )
  values (
    p_member_id,
    p_availability,
    p_self_reported_skill_level,
    p_interests,
    p_gear_owned,
    now()
  )
  on conflict (member_id) do update
  set
    availability = excluded.availability,
    self_reported_skill_level = excluded.self_reported_skill_level,
    interests = excluded.interests,
    gear_owned = excluded.gear_owned,
    submitted_at = excluded.submitted_at;
end;
$$;


-- Returns members belonging to the current authenticated user, joined
-- with their level, next session, and active enrollment count.
-- Call with no argument for the full list ("My Members" page), or pass
-- p_member_id to fetch just one (member detail page) — same shape either
-- way, so callers use .single() only when p_member_id is provided.
-- Replaces the old get_my_members() and get_member(p_member_id) —
-- neither of those returned joined/derived data, so both are now
-- superseded by this one function.
create or replace function get_my_members_with_details(p_member_id int default null)
returns table (
  id int,
  full_name text,
  dob date,
  gender text,
  medical_notes text,
  emergency_contact text,
  current_level_name text,
  next_session_label text,
  active_enrollment_count bigint
)
language sql
security definer set search_path = public
stable
as $$
  select
    m.id,
    m.full_name,
    m.dob,
    m.gender,
    m.medical_notes,
    m.emergency_contact,
    l.name as current_level_name,
    null::text as next_session_label, -- TODO: wire up once programme_sessions/enrollments join is ready
    coalesce((
      select count(*)
      from enrollments e
      where e.member_id = m.id
        and e.status = 'active'
    ), 0) as active_enrollment_count
  from members m
  left join levels l on l.id = m.current_level_id
  where m.account_id = auth.uid()
    and (p_member_id is null or m.id = p_member_id)
  order by m.created_at desc;
$$;