-- ============================================================
-- TYGA Platform — Notification System (corrected)
-- Assumes admin-shared-functions.sql has already been run
-- (requires: assert_is_admin()).
-- ============================================================

-- ---------- Migration: notification_type column ----------
-- Required by every function below — the original schema had no
-- column to distinguish notification types.

alter table notifications add column notification_type text;


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
    and channel = p_channel;

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
  select array_agg(id) into v_account_ids
  from accounts
  where active = true
    and (p_role is null or role = p_role);

  if array_length(v_account_ids, 1) > 0 then
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

-- The only way to trigger a manual announcement from the app —
-- properly gated, unlike the raw core functions above.
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

-- Get my notifications
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

-- Get unread count
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

-- Mark as read — keeps status in sync with read_at so there's a
-- single source of truth, not two independent "is this read" signals.
create or replace function mark_read(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update notifications
  set read_at = now(), status = 'read'
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
  set read_at = now(), status = 'read'
  where account_id = auth.uid() and read_at is null;
end;
$$;

-- Delete notification
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


-- ---------- AUTOMATIC TRIGGERS ----------

-- 1. Welcome notification on signup
create or replace function notify_welcome()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform create_notification(
    new.id,
    'welcome',
    'Welcome to TYGA! 🎉',
    'Thank you for joining! Complete your profile to get started.'
  );
  return new;
end;
$$;

create trigger on_account_created
  after insert on accounts
  for each row
  execute function notify_welcome();

-- 2. New member added to account
create or replace function notify_member_added()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform create_notification(
    new.account_id,
    'member_added',
    'New Member Added',
    format('%s has been added to your account', new.full_name),
    'member',
    new.id
  );
  return new;
end;
$$;

create trigger on_member_created
  after insert on members
  for each row
  execute function notify_member_added();

-- 3. Enrollment confirmed
create or replace function notify_enrollment_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_id uuid;
  v_programme_name text;
begin
  if new.status = 'active' then
    select account_id, name
    into v_account_id, v_programme_name
    from members m
    join programmes p on p.id = new.programme_id
    where m.id = new.member_id;

    perform create_notification(
      v_account_id,
      'enrollment_confirmed',
      'Enrollment Confirmed ✅',
      format('Enrolled in %s successfully', v_programme_name),
      'enrollment',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger on_enrollment_active
  after update of status on enrollments
  for each row
  when (new.status = 'active')
  execute function notify_enrollment_confirmed();

-- 4. Attendance marked (present/late/excused only — absences are
-- deliberately not notified to avoid pinging families on every miss)
create or replace function notify_attendance()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_id uuid;
  v_status_text text;
begin
  if new.status = 'present' then
    v_status_text := '✅ Present';
  elsif new.status = 'late' then
    v_status_text := '⏰ Late';
  elsif new.status = 'excused' then
    v_status_text := '📝 Excused';
  else
    return new;
  end if;

  select account_id into v_account_id
  from members where id = new.member_id;

  perform create_notification(
    v_account_id,
    'attendance_update',
    'Attendance Updated',
    format('Attendance marked as %s', v_status_text),
    'attendance',
    new.id
  );
  return new;
end;
$$;

create trigger on_attendance_marked
  after insert or update of status on attendance
  for each row
  when (new.status in ('present', 'late', 'excused'))
  execute function notify_attendance();

-- 5. Payment confirmed
create or replace function notify_payment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_id uuid;
begin
  if new.status = 'paid' then
    select account_id into v_account_id
    from invoices where id = new.invoice_id;

    perform create_notification(
      v_account_id,
      'payment_confirmed',
      'Payment Confirmed 💰',
      format('Payment of R%s has been confirmed', new.amount),
      'payment',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger on_payment_success
  after update of status on payments
  for each row
  when (new.status = 'paid')
  execute function notify_payment();

-- 6. Level upgrade — only fires when badge completion is actually
-- confirmed, so families are never notified of an unconfirmed promotion.
create or replace function notify_level_upgrade()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_account_id uuid;
  v_from_level text;
  v_to_level text;
begin
  select account_id,
         (select name from levels where id = new.from_level_id),
         (select name from levels where id = new.to_level_id)
  into v_account_id, v_from_level, v_to_level
  from members where id = new.member_id;

  perform create_notification(
    v_account_id,
    'level_upgrade',
    'Level Up! ⭐',
    format('Promoted from %s to %s', v_from_level, v_to_level),
    'level_progression',
    new.id
  );
  return new;
end;
$$;

create trigger on_level_upgrade
  after insert on level_progressions
  for each row
  when (new.badge_complete = true)
  execute function notify_level_upgrade();


-- ---------- CRON JOBS (Optional — requires pg_cron) ----------

-- Send session reminders (run daily)
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

-- Check overdue gear (run daily)
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

-- Clean up old notifications (run weekly)
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

-- Core send functions: service_role ONLY. These are called by triggers,
-- webhook handlers, and admin_send_announcement — never directly by a
-- client. Granting `authenticated` here would let any logged-in user
-- spam-notify the entire organization.
grant execute on function create_notification(uuid, text, text, text, text, int, text) to service_role;
grant execute on function create_bulk_notifications(uuid[], text, text, text, text, int, text) to service_role;
grant execute on function send_notification_to_role(text, text, text, text, text, int, text) to service_role;

-- Admin-facing wrapper — properly gated via assert_is_admin()
grant execute on function admin_send_announcement(text, text, text) to authenticated;

-- User functions — scoped to auth.uid() internally, safe for any authenticated user
grant execute on function get_my_notifications(int, int) to authenticated;
grant execute on function get_unread_count() to authenticated;
grant execute on function mark_read(int) to authenticated;
grant execute on function mark_all_read() to authenticated;
grant execute on function delete_notification(int) to authenticated;

-- Cron functions — service_role only
grant execute on function send_session_reminders() to service_role;
grant execute on function notify_gear_due() to service_role;
grant execute on function delete_old_notifications() to service_role;


-- ---------- OPTIONAL: Setup pg_cron (Uncomment if needed) ----------

-- create extension if not exists pg_cron;

-- select cron.schedule('session-reminders', '0 8 * * *', 'select send_session_reminders();');
-- select cron.schedule('gear-reminders', '0 9 * * *', 'select notify_gear_due();');
-- select cron.schedule('delete-old-notifications', '0 3 * * 0', 'select delete_old_notifications();');