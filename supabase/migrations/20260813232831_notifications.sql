-- ============================================================
-- TYGA Platform — Notification System (functions only)
-- Assumes admin-shared-functions.sql has already been run
-- (requires: assert_is_admin()).
--
-- Note: automatic triggers (welcome, member added, enrollment
-- confirmed, attendance, payment, level upgrade) are intentionally
-- omitted for now. Add them in a follow-up once the push layer is
-- in place.
-- ============================================================

-- ---------- Migration: notification_type column ----------

alter table notifications
  add column if not exists notification_type text;


-- ---------- CORE FUNCTIONS (service_role only — see Grants) ----------

-- Create a notification for a single user, respecting their stored
-- preference for this type/channel (defaults to enabled if unset).
create or replace function create_notification(
  p_account_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_related_type text default null,
  p_related_id int default null,
  p_channel text default 'in_app'
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_id int;
  v_enabled boolean;
begin
  select enabled into v_enabled
  from notification_preferences
  where account_id = p_account_id
    and notification_type = p_type
    and channel = p_channel
  limit 1;

  if v_enabled is null then
    v_enabled := true;
  end if;

  if v_enabled then
    insert into notifications (
      account_id, notification_type, related_type, related_id,
      channel, title, body, created_at
    ) values (
      p_account_id, p_type, p_related_type, p_related_id,
      p_channel, p_title, p_body, now()
    )
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

-- Create notifications for multiple users
create or replace function create_bulk_notifications(
  p_account_ids uuid[],
  p_type text,
  p_title text,
  p_body text,
  p_related_type text default null,
  p_related_id int default null,
  p_channel text default 'in_app'
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  foreach v_id in array p_account_ids
  loop
    perform create_notification(
      v_id, p_type, p_title, p_body,
      p_related_type, p_related_id, p_channel
    );
  end loop;
end;
$$;

-- Send notification to all users with a specific role (or everyone
-- active if p_role is null). Used internally by admin_send_announcement.
create or replace function send_notification_to_role(
  p_type text,
  p_title text,
  p_body text,
  p_role text default null,
  p_related_type text default null,
  p_related_id int default null,
  p_channel text default 'in_app'
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_account_ids
  from accounts
  where active = true
    and (p_role is null or role = p_role);

  if cardinality(v_account_ids) > 0 then
    perform create_bulk_notifications(
      v_account_ids,
      p_type,
      p_title,
      p_body,
      p_related_type,
      p_related_id,
      p_channel
    );
  end if;
end;
$$;


-- ---------- ADMIN-FACING WRAPPER ----------

create or replace function admin_send_announcement(
  p_title text,
  p_body text,
  p_role text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  perform send_notification_to_role('announcement', p_title, p_body, p_role);
end;
$$;


-- ---------- USER FUNCTIONS ----------

create or replace function get_my_notifications(
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id int,
  type text,
  title text,
  body text,
  related_type text,
  related_id int,
  is_read boolean,
  created_at timestamptz
)
language sql
security definer set search_path = public
stable
as $$
  select
    id,
    notification_type as type,
    title,
    body,
    related_type,
    related_id,
    read_at is not null as is_read,
    created_at
  from notifications
  where account_id = auth.uid()
  order by created_at desc
  limit p_limit
  offset p_offset;
$$;

create or replace function get_unread_count()
returns int
language sql
security definer set search_path = public
stable
as $$
  select count(*)::int
  from notifications
  where account_id = auth.uid()
    and read_at is null;
$$;

create or replace function mark_read(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update notifications
  set read_at = now()
  where id = p_id and account_id = auth.uid();
end;
$$;

create or replace function mark_all_read()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update notifications
  set read_at = now()
  where account_id = auth.uid() and read_at is null;
end;
$$;

create or replace function delete_notification(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from notifications
  where id = p_id and account_id = auth.uid();
end;
$$;


-- ---------- CRON JOBS (Optional — requires pg_cron) ----------

create or replace function send_session_reminders()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_enrollment record;
begin
  for v_enrollment in
    select distinct m.account_id, p.name as programme_name, ps.start_time
    from enrollments e
    join members m on m.id = e.member_id
    join programmes p on p.id = e.programme_id
    join programme_sessions ps on ps.programme_id = e.programme_id
    where e.status = 'active'
      and ps.session_date = current_date + 1
      and ps.status = 'scheduled'
  loop
    perform create_notification(
      v_enrollment.account_id,
      'session_reminder',
      'Upcoming Session 📅',
      format('%s tomorrow at %s', v_enrollment.programme_name, v_enrollment.start_time),
      'session',
      null
    );
  end loop;
end;
$$;

create or replace function notify_gear_due()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_rental record;
begin
  for v_rental in
    select gr.id, gr.member_id, m.account_id, gr.due_at
    from gear_rentals gr
    join members m on m.id = gr.member_id
    where gr.status = 'issued'
      and gr.due_at = current_date + 2
  loop
    perform create_notification(
      v_rental.account_id,
      'gear_due',
      'Gear Due Soon ⏰',
      format('Please return gear by %s', v_rental.due_at),
      'gear_rental',
      v_rental.id
    );
  end loop;
end;
$$;

create or replace function delete_old_notifications()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from notifications
  where created_at < now() - interval '30 days';
end;
$$;


-- ---------- GRANTS ----------

grant execute on function create_notification(uuid, text, text, text, text, int, text) to service_role;
grant execute on function create_bulk_notifications(uuid[], text, text, text, text, int, text) to service_role;
grant execute on function send_notification_to_role(text, text, text, text, text, int, text) to service_role;

grant execute on function admin_send_announcement(text, text, text) to authenticated;

grant execute on function get_my_notifications(int, int) to authenticated;
grant execute on function get_unread_count() to authenticated;
grant execute on function mark_read(int) to authenticated;
grant execute on function mark_all_read() to authenticated;
grant execute on function delete_notification(int) to authenticated;

grant execute on function send_session_reminders() to service_role;
grant execute on function notify_gear_due() to service_role;
grant execute on function delete_old_notifications() to service_role;


-- ---------- OPTIONAL: Setup pg_cron (Uncomment if needed) ----------

-- create extension if not exists pg_cron;

-- select cron.schedule('session-reminders', '0 8 * * *', 'select send_session_reminders();');
-- select cron.schedule('gear-reminders', '0 9 * * *', 'select notify_gear_due();');
-- select cron.schedule('delete-old-notifications', '0 3 * * 0', 'select delete_old_notifications();');