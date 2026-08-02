-- ============================================================
-- TYGA Platform — RLS Policies (corrected)
-- Run AFTER all tables are created
-- ============================================================

-- ---------- Helper Functions ----------

-- Check if the current user is an admin (reads accounts.role, not the JWT's Postgres role)
create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from accounts where id = auth.uid() and role = 'admin'
  );
$$;

-- Get coach_id for current user
create or replace function get_coach_id()
returns int
language sql
stable
security definer
as $$
  select id from coaches where account_id = auth.uid();
$$;

-- ---------- Auto-sync session_coaches from programme_coaches ----------
-- every new session automatically inherits its programme's coach assignments.

create or replace function sync_session_coaches()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into session_coaches (session_id, coach_id, role_in_session)
  select new.id, pc.coach_id, pc.role_in_programme
  from programme_coaches pc
  where pc.programme_id = new.programme_id
  on conflict (session_id, coach_id) do nothing;
  return new;
end;
$$;

create trigger trg_sync_session_coaches
after insert on programme_sessions
for each row execute function sync_session_coaches();

-- ---------- Sensitive data access logging (server-side only) ----------
-- No direct INSERT policy exists on sensitive_data_access_log (see below).
-- The application calls this function whenever it reads medical_notes,
-- dob, or emergency_contact — it runs as security definer so it can write
-- to the log regardless of the caller's own RLS permissions, but it
-- always logs the caller's own auth.uid(), so it can't be spoofed.

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

-- ---------- Enable RLS on All Tables ----------

alter table accounts enable row level security;
alter table members enable row level security;
alter table member_questionnaires enable row level security;
alter table coaches enable row level security;
alter table levels enable row level security;
alter table venues enable row level security;
alter table programmes enable row level security;
alter table programme_coaches enable row level security;
alter table programme_sessions enable row level security;
alter table session_coaches enable row level security;
alter table session_curriculum_modules enable row level security;
alter table curriculum_modules enable row level security;
alter table member_milestones enable row level security;
alter table appointments enable row level security;
alter table enrollments enable row level security;
alter table attendance enable row level security;
alter table level_progressions enable row level security;
alter table bookings enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table sponsorships enable row level security;
alter table sponsorship_allocations enable row level security;
alter table gear_types enable row level security;
alter table gear_units enable row level security;
alter table gear_rentals enable row level security;
alter table gear_rental_units enable row level security;
alter table invoices enable row level security;
alter table invoice_line_items enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table sensitive_data_access_log enable row level security;

-- ---------- ACCOUNTS ----------

create policy "Users view own account"
on accounts for select
to authenticated
using (id = auth.uid());

create policy "Users update own account"
on accounts for update
to authenticated
using (id = auth.uid());

create policy "Users insert own account"
on accounts for insert
to authenticated
with check (id = auth.uid());

create policy "Admins view all accounts"
on accounts for select
to authenticated
using (is_admin());

-- ---------- MEMBERS ----------

create policy "Parents view own members"
on members for select
to authenticated
using (account_id = auth.uid());

create policy "Parents insert own members"
on members for insert
to authenticated
with check (account_id = auth.uid());

create policy "Parents update own members"
on members for update
to authenticated
using (account_id = auth.uid());

create policy "Parents delete own members"
on members for delete
to authenticated
using (account_id = auth.uid());

create policy "Coaches view members in their programmes"
on members for select
to authenticated
using (
  exists (
    select 1
    from enrollments e
    join programme_coaches pc on pc.programme_id = e.programme_id
    where e.member_id = members.id
    and pc.coach_id = get_coach_id()
  )
);

create policy "Admins manage all members"
on members for all
to authenticated
using (is_admin());

-- ---------- MEMBER QUESTIONNAIRES ----------

create policy "Parents view own member questionnaires"
on member_questionnaires for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Parents insert own member questionnaires"
on member_questionnaires for insert
to authenticated
with check (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Admins manage all questionnaires"
on member_questionnaires for all
to authenticated
using (is_admin());

-- ---------- COACHES ----------

create policy "Coaches view own profile"
on coaches for select
to authenticated
using (account_id = auth.uid());

create policy "Parents and coaches view coach directory"
on coaches for select
to authenticated
using (true);
-- Needed so the client/coach portals can render "who's teaching this programme"
-- (e.g. the CoachList component). Coach records hold no sensitive personal
-- data themselves (that lives on accounts, which has its own policies).

create policy "Admins manage coaches"
on coaches for all
to authenticated
using (is_admin());

-- ---------- LEVELS ----------

create policy "Anyone can view levels"
on levels for select
to authenticated
using (true);

create policy "Admins manage levels"
on levels for all
to authenticated
using (is_admin());

-- ---------- VENUES ----------

create policy "Anyone can view venues"
on venues for select
to authenticated
using (true);

create policy "Admins manage venues"
on venues for all
to authenticated
using (is_admin());

-- ---------- PROGRAMMES ----------
-- No status column in this schema — eligibility (age/gender/level) is
-- filtered at the application layer, not via RLS. All authenticated users
-- can read programme rows; only admins can write.

create policy "Anyone can view programmes"
on programmes for select
to authenticated
using (true);

create policy "Admins manage programmes"
on programmes for all
to authenticated
using (is_admin());

-- ---------- PROGRAMME COACHES ----------

create policy "Anyone can view programme coach assignments"
on programme_coaches for select
to authenticated
using (true);

create policy "Admins manage programme coaches"
on programme_coaches for all
to authenticated
using (is_admin());

-- ---------- PROGRAMME SESSIONS ----------

create policy "Coaches view own sessions"
on programme_sessions for select
to authenticated
using (
  exists (
    select 1 from session_coaches
    where session_id = programme_sessions.id
    and coach_id = get_coach_id()
  )
);

create policy "Parents view programme sessions"
on programme_sessions for select
to authenticated
using (true);
-- Eligibility to enroll is enforced at the application layer; viewing a
-- session's schedule is not itself sensitive.

create policy "Admins manage sessions"
on programme_sessions for all
to authenticated
using (is_admin());

-- ---------- SESSION COACHES ----------

create policy "Coaches view own session assignments"
on session_coaches for select
to authenticated
using (coach_id = get_coach_id());

create policy "Admins manage session coaches"
on session_coaches for all
to authenticated
using (is_admin());

-- ---------- CURRICULUM MODULES / SESSION CURRICULUM MODULES ----------

create policy "Anyone can view curriculum modules"
on curriculum_modules for select
to authenticated
using (true);

create policy "Admins manage curriculum modules"
on curriculum_modules for all
to authenticated
using (is_admin());

create policy "Coaches view session curriculum coverage"
on session_curriculum_modules for select
to authenticated
using (
  exists (
    select 1 from session_coaches
    where session_id = session_curriculum_modules.session_id
    and coach_id = get_coach_id()
  )
);

create policy "Coaches tag their own session curriculum coverage"
on session_curriculum_modules for insert
to authenticated
with check (
  exists (
    select 1 from session_coaches
    where session_id = session_curriculum_modules.session_id
    and coach_id = get_coach_id()
  )
);

create policy "Admins manage session curriculum modules"
on session_curriculum_modules for all
to authenticated
using (is_admin());

-- ---------- MEMBER MILESTONES ----------

create policy "Parents view child milestones"
on member_milestones for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Coaches manage milestones for their students"
on member_milestones for all
to authenticated
using (
  exists (
    select 1 from enrollments e
    join programme_coaches pc on pc.programme_id = e.programme_id
    where e.member_id = member_milestones.member_id
    and pc.coach_id = get_coach_id()
  )
);

create policy "Admins manage all milestones"
on member_milestones for all
to authenticated
using (is_admin());

-- ---------- ENROLLMENTS ----------

create policy "Parents view family enrollments"
on enrollments for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Coaches view programme enrollments"
on enrollments for select
to authenticated
using (
  programme_id in (
    select programme_id from programme_coaches where coach_id = get_coach_id()
  )
);

create policy "Parents insert enrollments"
on enrollments for insert
to authenticated
with check (
  member_id in (select id from members where account_id = auth.uid())
  and status = 'pending'
);
-- Enrollments must always be created as 'pending' — they only become
-- 'active' via the server-side Paystack webhook handler, never directly.

create policy "Parents withdraw own pending enrollments"
on enrollments for update
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
  and status = 'pending'
)
with check (status = 'withdrawn');
-- Parents can cancel a not-yet-paid enrollment. They cannot activate one,
-- reactivate a withdrawn one, or touch an already-active enrollment.

create policy "Admins manage enrollments"
on enrollments for all
to authenticated
using (is_admin());

-- ---------- ATTENDANCE ----------

create policy "Coaches mark attendance"
on attendance for insert
to authenticated
with check (
  session_id in (select session_id from session_coaches where coach_id = get_coach_id())
);

create policy "Coaches view attendance for own sessions"
on attendance for select
to authenticated
using (
  session_id in (select session_id from session_coaches where coach_id = get_coach_id())
);

create policy "Parents view family attendance"
on attendance for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Admins manage attendance"
on attendance for all
to authenticated
using (is_admin());

-- ---------- LEVEL PROGRESSIONS ----------

create policy "Coaches submit progressions for their own students"
on level_progressions for insert
to authenticated
with check (
  assessed_by = get_coach_id()
  and exists (
    select 1 from enrollments e
    join programme_coaches pc on pc.programme_id = e.programme_id
    where e.member_id = level_progressions.member_id
    and pc.coach_id = get_coach_id()
  )
);

create policy "Coaches view their own submitted progressions"
on level_progressions for select
to authenticated
using (assessed_by = get_coach_id());

create policy "Parents view child progressions"
on level_progressions for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Admins manage progressions"
on level_progressions for all
to authenticated
using (is_admin());

-- ---------- APPOINTMENTS ----------

create policy "Parents request appointments"
on appointments for insert
to authenticated
with check (
  member_id in (select id from members where account_id = auth.uid())
  and coach_id is null
  and status = 'requested'
);
-- A parent can request an appointment but not assign themselves a coach
-- or pre-set its status to anything other than 'requested'.

create policy "Parents view family appointments"
on appointments for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Coaches view own appointments"
on appointments for select
to authenticated
using (coach_id = get_coach_id());

create policy "Coaches manage own appointments"
on appointments for update
to authenticated
using (coach_id = get_coach_id());

create policy "Admins manage appointments"
on appointments for all
to authenticated
using (is_admin());

-- ---------- BOOKINGS ----------

create policy "Parents view own bookings"
on bookings for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Parents request bookings"
on bookings for insert
to authenticated
with check (
  member_id in (select id from members where account_id = auth.uid())
  and status = 'pending'
);

create policy "Coaches view own bookings"
on bookings for select
to authenticated
using (coach_id = get_coach_id());

create policy "Admins manage bookings"
on bookings for all
to authenticated
using (is_admin());

-- ---------- EVENTS ----------
-- No status column in this schema — all events are visible; eligibility
-- (age/gender) is filtered at the application layer.

create policy "Anyone can view events"
on events for select
to authenticated
using (true);

create policy "Admins manage events"
on events for all
to authenticated
using (is_admin());

-- ---------- EVENT REGISTRATIONS ----------

create policy "Parents view own event registrations"
on event_registrations for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Parents insert own event registrations"
on event_registrations for insert
to authenticated
with check (
  member_id in (select id from members where account_id = auth.uid())
  and status = 'registered'
);

create policy "Admins manage event registrations"
on event_registrations for all
to authenticated
using (is_admin());

-- ---------- SPONSORSHIPS / SPONSORSHIP ALLOCATIONS ----------


create policy "Admins manage sponsorships"
on sponsorships for all
to authenticated
using (is_admin());

create policy "Admins manage sponsorship allocations"
on sponsorship_allocations for all
to authenticated
using (is_admin());

-- ---------- GEAR TYPES / GEAR UNITS ----------

create policy "Anyone can view gear types"
on gear_types for select
to authenticated
using (true);

create policy "Admins manage gear types"
on gear_types for all
to authenticated
using (is_admin());

create policy "Admins manage gear units"
on gear_units for all
to authenticated
using (is_admin());

create policy "Coaches view gear units"
on gear_units for select
to authenticated
using (get_coach_id() is not null);

-- ---------- GEAR RENTALS ----------

create policy "Parents view own gear rentals"
on gear_rentals for select
to authenticated
using (
  member_id in (select id from members where account_id = auth.uid())
);

create policy "Coaches view gear rentals for their own bookings"
on gear_rentals for select
to authenticated
using (
  exists (
    select 1 from bookings b
    where b.id = gear_rentals.booking_id
    and b.coach_id = get_coach_id()
  )
);

create policy "Coaches issue/return gear for their own bookings"
on gear_rentals for update
to authenticated
using (
  exists (
    select 1 from bookings b
    where b.id = gear_rentals.booking_id
    and b.coach_id = get_coach_id()
  )
);

create policy "Admins manage gear rentals"
on gear_rentals for all
to authenticated
using (is_admin());

-- ---------- GEAR RENTAL UNITS ----------

create policy "Coaches view rental units for their own bookings"
on gear_rental_units for select
to authenticated
using (
  exists (
    select 1 from gear_rentals gr
    join bookings b on b.id = gr.booking_id
    where gr.id = gear_rental_units.gear_rental_id
    and b.coach_id = get_coach_id()
  )
);

create policy "Admins manage gear rental units"
on gear_rental_units for all
to authenticated
using (is_admin());

-- ---------- INVOICES ----------

create policy "Parents view own invoices"
on invoices for select
to authenticated
using (account_id = auth.uid());

create policy "Admins manage invoices"
on invoices for all
to authenticated
using (is_admin());

-- ---------- INVOICE LINE ITEMS ----------

create policy "Parents view own invoice line items"
on invoice_line_items for select
to authenticated
using (
  invoice_id in (select id from invoices where account_id = auth.uid())
);

create policy "Admins manage invoice line items"
on invoice_line_items for all
to authenticated
using (is_admin());

-- ---------- PAYMENTS ----------
-- No client role can write here at all — payments are only ever written
-- by the server-side Paystack webhook handler using the service role key,
-- which bypasses RLS entirely. Only a SELECT policy exists for clients.

create policy "Parents view own payments"
on payments for select
to authenticated
using (
  invoice_id in (select id from invoices where account_id = auth.uid())
);

create policy "Admins view all payments"
on payments for select
to authenticated
using (is_admin());

-- ---------- NOTIFICATIONS ----------

create policy "Users view own notifications"
on notifications for select
to authenticated
using (account_id = auth.uid());

create policy "Users mark own notifications read"
on notifications for update
to authenticated
using (account_id = auth.uid())
with check (account_id = auth.uid());

create policy "Admins manage notifications"
on notifications for all
to authenticated
using (is_admin());

-- ---------- NOTIFICATION PREFERENCES ----------

create policy "Users view own notification preferences"
on notification_preferences for select
to authenticated
using (account_id = auth.uid());

create policy "Users update own notification preferences"
on notification_preferences for update
to authenticated
using (account_id = auth.uid());

create policy "Users insert own notification preferences"
on notification_preferences for insert
to authenticated
with check (account_id = auth.uid());

create policy "Admins manage notification preferences"
on notification_preferences for all
to authenticated
using (is_admin());

-- ---------- SENSITIVE DATA ACCESS LOG ----------
-- No INSERT policy exists for any client role — writes only ever happen
-- via log_sensitive_data_access(), which runs as security definer.

create policy "Admins view sensitive data access log"
on sensitive_data_access_log for select
to authenticated
using (is_admin());