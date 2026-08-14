-- ============================================================
-- TYGA Platform — Admin: Accounts, Members, Coaches
-- Assumes admin-shared-functions.sql has already been run
-- (requires: assert_is_admin()).
-- ============================================================

-- ---------- Migration: soft-delete column for Members ----------

alter table members add column archived_at timestamptz;


-- ============================================================
-- Admin: Accounts
-- ============================================================

-- Returns all accounts, optionally filtered by role.
create or replace function admin_get_accounts(p_role text default null)
returns table (
  id uuid,
  role text,
  full_name text,
  email text,
  phone text,
  address text,
  active boolean,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select a.id, a.role, a.full_name, a.email, a.phone, a.address, a.active, a.created_at
  from accounts a
  where p_role is null or a.role = p_role
  order by a.created_at desc;
end;
$$;

-- Changes an account's role — this is how a parent gets turned into a
-- coach (or admin). Public signup always hardcodes 'parent' via
-- handle_new_user(), so this is the only path to becoming coach/admin.
create or replace function admin_set_account_role(
  p_account_id uuid,
  p_role text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_role not in ('parent', 'coach', 'admin') then
    raise exception 'Invalid role: %', p_role;
  end if;

  update accounts set role = p_role where id = p_account_id;
end;
$$;

-- Activates or deactivates an account (soft delete — existing `active` column).
create or replace function admin_set_account_active(
  p_account_id uuid,
  p_active boolean
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  update accounts set active = p_active where id = p_account_id;
end;
$$;


-- ============================================================
-- Admin: Members
-- ============================================================

-- Cross-account member list, joined with owning account and level.
create or replace function admin_get_members(p_member_id int default null)
returns table (
  id int,
  account_id uuid,
  account_full_name text,
  account_email text,
  full_name text,
  dob date,
  gender text,
  current_level_name text,
  active_enrollment_count bigint,
  archived_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    m.id,
    m.account_id,
    a.full_name as account_full_name,
    a.email as account_email,
    m.full_name,
    m.dob,
    m.gender,
    l.name as current_level_name,
    coalesce((
      select count(*) from enrollments e
      where e.member_id = m.id and e.status = 'active'
    ), 0) as active_enrollment_count,
    m.archived_at,
    m.created_at
  from members m
  join accounts a on a.id = m.account_id
  left join levels l on l.id = m.current_level_id
  where p_member_id is null or m.id = p_member_id
  order by m.created_at desc;
end;
$$;

-- Reassigns a member to a different account (e.g. family login changed).
create or replace function admin_reassign_member(
  p_member_id int,
  p_new_account_id uuid
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if not exists (select 1 from accounts where id = p_new_account_id) then
    raise exception 'Target account not found: %', p_new_account_id;
  end if;

  update members set account_id = p_new_account_id where id = p_member_id;
end;
$$;

-- Archives a member (soft delete). Members are never hard-deleted —
-- medical history, attendance, and audit logs depend on the row persisting.
create or replace function admin_archive_member(p_member_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  update members set archived_at = now() where id = p_member_id;
end;
$$;

create or replace function admin_unarchive_member(p_member_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  update members set archived_at = null where id = p_member_id;
end;
$$;


-- ============================================================
-- Admin: Coaches
-- ============================================================

create or replace function admin_get_coaches(p_coach_id int default null)
returns table (
  id int,
  account_id uuid,
  full_name text,
  email text,
  active boolean,
  coach_type text,
  linked_member_id int,
  max_student_ratio int
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    c.id,
    c.account_id,
    a.full_name,
    a.email,
    a.active,
    c.coach_type,
    c.linked_member_id,
    c.max_student_ratio
  from coaches c
  left join accounts a on a.id = c.account_id
  where p_coach_id is null or c.id = p_coach_id
  order by a.full_name;
end;
$$;

-- Creates a coach profile linked to an existing account. Call
-- admin_set_account_role(account_id, 'coach') first (or right after)
-- so the account's role actually reflects that they're a coach —
-- this function only creates the coaches row, it doesn't change role.
create or replace function admin_create_coach(
  p_account_id uuid,
  p_coach_type text default null,
  p_max_student_ratio int default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_coach_id int;
begin
  perform assert_is_admin();

  if p_coach_type is not null and p_coach_type not in ('head_coach', 'assistant_coach', 'volunteer') then
    raise exception 'Invalid coach_type: %', p_coach_type;
  end if;

  insert into coaches (account_id, coach_type, max_student_ratio)
  values (p_account_id, p_coach_type, p_max_student_ratio)
  returning id into v_coach_id;

  return v_coach_id;
end;
$$;

create or replace function admin_update_coach(
  p_coach_id int,
  p_coach_type text default null,
  p_max_student_ratio int default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_coach_type is not null and p_coach_type not in ('head_coach', 'assistant_coach', 'volunteer') then
    raise exception 'Invalid coach_type: %', p_coach_type;
  end if;

  update coaches
  set
    coach_type = coalesce(p_coach_type, coach_type),
    max_student_ratio = coalesce(p_max_student_ratio, max_student_ratio)
  where id = p_coach_id;
end;
$$;

-- "Deactivating" a coach deactivates their linked account, not the
-- coaches row itself — programme_coaches/session_coaches/appointments
-- still reference this coach_id historically. UI should filter out
-- coaches whose linked account.active = false from "assign" pickers.
create or replace function admin_deactivate_coach(p_coach_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_id uuid;
begin
  perform assert_is_admin();

  select account_id into v_account_id from coaches where id = p_coach_id;

  if v_account_id is null then
    raise exception 'Coach not found or has no linked account: %', p_coach_id;
  end if;

  update accounts set active = false where id = v_account_id;
end;
$$;


-- ============================================================
-- Grants
-- ============================================================

grant execute on function admin_get_accounts(text) to authenticated;
grant execute on function admin_set_account_role(uuid, text) to authenticated;
grant execute on function admin_set_account_active(uuid, boolean) to authenticated;

grant execute on function admin_get_members(int) to authenticated;
grant execute on function admin_reassign_member(int, uuid) to authenticated;
grant execute on function admin_archive_member(int) to authenticated;
grant execute on function admin_unarchive_member(int) to authenticated;

grant execute on function admin_get_coaches(int) to authenticated;
grant execute on function admin_create_coach(uuid, text, int) to authenticated;
grant execute on function admin_update_coach(int, text, int) to authenticated;
grant execute on function admin_deactivate_coach(int) to authenticated;