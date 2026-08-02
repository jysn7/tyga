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
security definer
as $$
begin
  if new.type = 'assessment'
     and new.status = 'completed'
     and new.assessed_level_id is not null then
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


-- Returns the programmes a given member is eligible for, filtered by
-- age (derived from dob), gender, and current level. Also enforces
-- that the caller can only query for their own member — a parent
-- cannot use this to probe another family's data.
create or replace function get_eligible_programmes(p_member_id int)
returns setof programmes
language sql
stable
as $$
  select p.*
  from programmes p
  join members m on m.id = p_member_id
  where p_member_id in (
    select id from members
    where account_id = auth.uid()
    and id = p_member_id
  )
  and m.dob between (current_date - (p.max_age || ' years')::interval)
                 and (current_date - (p.min_age || ' years')::interval)
  and (p.gender_restriction is null or p.gender_restriction = 'any' or p.gender_restriction = m.gender)
  and (p.level_id is null or p.level_id = m.current_level_id);
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
security definer
as $$
begin
  insert into sensitive_data_access_log (user_id, member_id, field_accessed, reason)
  values (auth.uid(), p_member_id, p_field, p_reason);
end;
$$;