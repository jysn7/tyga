-- ---------- Phase 4: Account Settings ----------

-- Returns the current user's own account row.
create or replace function get_my_account()
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
language sql
security definer set search_path = public
stable
as $$
  select 
    id, role, full_name, email, phone, address, active, created_at
  from accounts 
  where id = auth.uid();
$$;

-- Updates the editable subset of the current user's own account.
-- Deliberately excludes role and email — role changes are admin-only,
-- and email changes go through Supabase Auth's own flow, not this table.
create or replace function update_my_account(
  p_full_name text default null,
  p_phone text default null,
  p_address text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update accounts
  set
    full_name = coalesce(p_full_name, full_name),
    phone = coalesce(p_phone, phone),
    address = coalesce(p_address, address)
  where id = auth.uid();
end;
$$;

-- Returns the current user's notification preferences for the given
-- channel. The known notification types are hardcoded here (matching
-- the UI's NOTIFICATION_TYPES list) rather than introspected from an
-- enum, so this works whether notification_type is a real Postgres
-- enum or a plain text column with a check constraint. Any type with
-- no existing row defaults to enabled = true.
create or replace function get_my_notification_preferences(p_channel text default 'in_app')
returns table (notification_type text, enabled boolean)
language sql
security definer set search_path = public
stable
as $$
  select
    t.notification_type,
    coalesce(np.enabled, true) as enabled
  from (
    values
      ('session_reminder'),
      ('gear_due'),
      ('payment_due'),
      ('level_upgrade'),
      ('parent_consultation_reminder'),
      ('announcement')
  ) as t(notification_type)
  left join notification_preferences np
    on np.account_id = auth.uid()
    and np.notification_type::text = t.notification_type
    and np.channel = p_channel
  order by t.notification_type;
$$;

-- Upserts a single notification preference for the current user.
-- Requires a unique constraint on (account_id, notification_type, channel):
--   alter table notification_preferences
--   add constraint notification_preferences_unique
--   unique (account_id, notification_type, channel);
create or replace function set_notification_preference(
  p_notification_type text,
  p_enabled boolean,
  p_channel text default 'in_app'
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  valid_types text[] := array['session_reminder', 'gear_due', 'payment_due', 'level_upgrade', 'parent_consultation_reminder', 'announcement'];
begin
  -- Validate notification type
  if not (p_notification_type = any(valid_types)) then
    raise exception 'Invalid notification_type: %', p_notification_type;
  end if;

  insert into notification_preferences (account_id, notification_type, channel, enabled)
  values (auth.uid(), p_notification_type, p_channel, p_enabled)
  on conflict (account_id, notification_type, channel)
  do update set enabled = excluded.enabled;
end;
$$;

-- Grants
grant execute on function get_my_account() to authenticated;
grant execute on function update_my_account(text, text, text) to authenticated;
grant execute on function get_my_notification_preferences(text) to authenticated;
grant execute on function set_notification_preference(text, boolean, text) to authenticated;