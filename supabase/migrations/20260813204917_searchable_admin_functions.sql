-- ============================================================
-- Migration: extend admin_get_accounts, admin_get_members, admin_get_coaches
-- with search + status filters. Run this against a database that already
-- has the original single/two-arg versions from admin-accounts-members-coaches.sql.
-- ============================================================

-- ---------- admin_get_accounts ----------

drop function if exists admin_get_accounts(text);

create or replace function admin_get_accounts(
  p_role text default null,
  p_active boolean default null,
  p_search text default null
)
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
  where
    (p_role is null or a.role = p_role)
    and (p_active is null or a.active = p_active)
    and (
      p_search is null
      or a.full_name ilike '%' || p_search || '%'
      or a.email ilike '%' || p_search || '%'
    )
  order by a.created_at desc;
end;
$$;

revoke all on function admin_get_accounts(text, boolean, text) from public;
grant execute on function admin_get_accounts(text, boolean, text) to authenticated;


-- ---------- admin_get_members ----------

drop function if exists admin_get_members(int);

create or replace function admin_get_members(
  p_member_id int default null,
  p_search text default null,
  p_archived boolean default false
)
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
  where
    (p_member_id is null or m.id = p_member_id)
    and (
      p_archived is null
      or (p_archived is true and m.archived_at is not null)
      or (p_archived is false and m.archived_at is null)
    )
    and (
      p_search is null
      or m.full_name ilike '%' || p_search || '%'
      or a.full_name ilike '%' || p_search || '%'
      or a.email ilike '%' || p_search || '%'
    )
  order by m.created_at desc;
end;
$$;

revoke all on function admin_get_members(int, text, boolean) from public;
grant execute on function admin_get_members(int, text, boolean) to authenticated;


-- ---------- admin_get_coaches ----------

drop function if exists admin_get_coaches(int);

create or replace function admin_get_coaches(
  p_coach_id int default null,
  p_search text default null,
  p_active boolean default null
)
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
  where
    (p_coach_id is null or c.id = p_coach_id)
    and (p_active is null or a.active = p_active)
    and (
      p_search is null
      or a.full_name ilike '%' || p_search || '%'
      or a.email ilike '%' || p_search || '%'
    )
  order by a.full_name;
end;
$$;

revoke all on function admin_get_coaches(int, text, boolean) from public;
grant execute on function admin_get_coaches(int, text, boolean) to authenticated;
