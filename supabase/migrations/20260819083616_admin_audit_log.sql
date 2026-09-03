-- ============================================================
-- Admin: Audit Log — read functions
-- Assumes the audit_log table + log_audit_event trigger already exist.
-- ============================================================

-- Full, filterable audit log view (for a dedicated Audit page)
create or replace function admin_get_audit_log(
  p_table_name text default null,
  p_actor_id uuid default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id bigint,
  actor_id uuid,
  actor_name text,
  actor_role text,
  action text,
  table_name text,
  record_id text,
  changed_fields text[],
  new_data jsonb,
  old_data jsonb,
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
    al.id, al.actor_id, a.full_name, al.actor_role,
    al.action, al.table_name, al.record_id,
    al.changed_fields, al.new_data, al.old_data, al.created_at
  from audit_log al
  left join accounts a on a.id = al.actor_id
  where (p_table_name is null or al.table_name = p_table_name)
    and (p_actor_id is null or al.actor_id = p_actor_id)
  order by al.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- Condensed feed for the Overview dashboard — same underlying table,
-- trimmed columns, capped small (default 10). Replaces the old
-- five-table union-based recent-activity function entirely.
create or replace function admin_report_recent_activity(p_limit int default 10)
returns table (
  id bigint,
  actor_name text,
  action text,
  table_name text,
  record_id text,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select al.id, a.full_name, al.action, al.table_name, al.record_id, al.created_at
  from audit_log al
  left join accounts a on a.id = al.actor_id
  order by al.created_at desc
  limit p_limit;
end;
$$;

grant execute on function admin_get_audit_log(text, uuid, int, int) to authenticated;
grant execute on function admin_report_recent_activity(int) to authenticated;

drop function if exists admin_get_accounts(text);
drop function if exists admin_get_accounts(text, boolean, text);


--- update: admin_get_accounts now returns avatar_url, so we need to drop the old version first. ---

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
  avatar_url text,
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
  select a.id, a.role, a.full_name, a.email, a.phone, a.address, a.avatar_url, a.active, a.created_at
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