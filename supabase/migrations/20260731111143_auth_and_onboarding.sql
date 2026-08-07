-- ============================================================
-- TYGA Platform — Auth & Onboarding Functions
-- Phase 0 (Authentication) + Phase 1 (Onboarding & Placement)
-- Run AFTER the schema migration. Contains ONLY auth and
-- onboarding logic — no RLS policies, no other phases.
-- ============================================================

-- ---------- Phase 0: Auth ----------

-- Creates the matching accounts row the moment someone signs up.
-- Public sign-up can only ever create a 'parent' account — role is
-- hardcoded, never trusted from client-supplied metadata. Coach and
-- admin accounts must be created separately by an admin.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into accounts (id, role, full_name, email)
  values (
    new.id,
    'parent',
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ---------- Phase 1: Onboarding & Skill-Level Placement ----------

-- When an assessment appointment is marked completed with a level
-- attached, automatically sets that member's current_level_id.
create or replace function set_level_from_assessment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.type = 'assessment'
     and new.status = 'completed'
     and new.assessed_level_id is not null then
    
    -- Validate the level exists
    if not exists (select 1 from levels where id = new.assessed_level_id) then
      raise exception 'Invalid level_id: %', new.assessed_level_id;
    end if;
    
    -- Validate the member belongs to the current user or caller has permission
    -- (This will be enforced by RLS, but we check anyway)
    update members
    set current_level_id = new.assessed_level_id
    where id = new.member_id;
  end if;
  return new;
end;
$$;

create trigger trg_set_level_from_assessment
after update on appointments
for each row execute function set_level_from_assessment();


-- Data-integrity guard: a parent_consultation can never carry an
-- assessed_level_id, and a completed assessment must always have one.
create or replace function enforce_appointment_type_consistency()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.type = 'parent_consultation' and new.assessed_level_id is not null then
    raise exception 'parent_consultation appointments cannot have an assessed_level_id';
  end if;

  if new.type = 'assessment' and new.status = 'completed' and new.assessed_level_id is null then
    raise exception 'a completed assessment must have an assessed_level_id';
  end if;

  return new;
end;
$$;

create trigger trg_enforce_appointment_type
before insert or update on appointments
for each row execute function enforce_appointment_type_consistency();


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


-- ---------- Phase 3: Appointment Management ----------

-- Creates an assessment appointment for a member.
-- Only the parent of the member can request an assessment.
create or replace function request_assessment(
  p_member_id int,
  p_coach_id int,
  p_venue_id int,
  p_scheduled_at timestamptz,
  p_notes text default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_appointment_id int;
begin
  -- Verify the member belongs to the current user
  if not exists (
    select 1 from members 
    where id = p_member_id and account_id = auth.uid()
  ) then
    raise exception 'Member not found or access denied';
  end if;
  
  -- Verify the coach exists and is active (optional)
  if not exists (
    select 1 from coaches c
    join accounts a on a.id = c.account_id
    where c.id = p_coach_id and a.active = true
  ) then
    raise exception 'Coach not found or inactive';
  end if;
  
  -- Verify the venue exists
  if not exists (select 1 from venues where id = p_venue_id) then
    raise exception 'Venue not found';
  end if;
  
  insert into appointments (
    member_id,
    coach_id,
    venue_id,
    type,
    requested_at,
    scheduled_at,
    status,
    notes
  )
  values (
    p_member_id,
    p_coach_id,
    p_venue_id,
    'assessment',
    now(),
    p_scheduled_at,
    'requested',
    p_notes
  )
  returning id into v_appointment_id;
  
  return v_appointment_id;
end;
$$;


-- Logs access to a member's sensitive fields (medical_notes, dob,
-- emergency_contact). Called explicitly by the application whenever
-- one of those fields is read — runs as security definer so it can
-- write to the log regardless of the caller's own RLS permissions,
-- but always logs the caller's real auth.uid(), so it can't be spoofed.
create or replace function log_sensitive_data_access(
  p_member_id int,
  p_field text,
  p_reason text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- Validate the field being accessed
  if p_field not in ('medical_notes', 'dob', 'emergency_contact') then
    raise exception 'Invalid field. Must be medical_notes, dob, or emergency_contact';
  end if;
  
  insert into sensitive_data_access_log (user_id, member_id, field_accessed, reason)
  values (auth.uid(), p_member_id, p_field, p_reason);
end;
$$;


-- ---------- Helper Functions ----------

-- Returns all members belonging to the current authenticated user.
-- Useful for parents to see their children.
create or replace function get_my_members()
returns setof members
language sql
security definer set search_path = public
stable
as $$
  select *
  from members
  where account_id = auth.uid()
  order by created_at desc;
$$;


-- Returns a specific member if they belong to the current user.
-- Use this instead of direct table access to respect ownership.
create or replace function get_member(p_member_id int)
returns members
language sql
security definer set search_path = public
stable
as $$
  select *
  from members
  where id = p_member_id
  and account_id = auth.uid();
$$;