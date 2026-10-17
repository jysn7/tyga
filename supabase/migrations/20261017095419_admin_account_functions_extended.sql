-- ============================================================
-- Tables and columns
-- ============================================================
alter table accounts add column if not exists anonymised_at timestamptz;

create table if not exists account_admin_actions (
  id           bigint generated always as identity primary key,
  account_id   uuid not null,                 -- no FK: history must outlive deletions
  action       text not null,
  reason       text,
  details      jsonb not null default '{}',
  performed_by uuid,
  performed_at timestamptz not null default now()
);
create index if not exists idx_account_actions on account_admin_actions (account_id, performed_at desc);
alter table account_admin_actions enable row level security;   -- no policies: only the functions below touch it

drop function if exists admin_set_account_role(uuid, text);
drop function if exists admin_set_account_active(uuid, boolean);

-- ============================================================
-- Helpers
-- ============================================================

-- Sensitive actions need a code-verified session, when the admin has MFA enrolled
create or replace function assert_recent_mfa()
returns void
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from auth.mfa_factors where user_id = auth.uid() and status = 'verified')
     and coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    raise exception 'Please verify with your authenticator code before doing this';
  end if;
end;
$$;

-- What stops an account being anonymised right now
create or replace function account_anonymise_blockers(p_account_id uuid)
returns text[]
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  r      text[] := '{}';
  n      int;
  v_role text;
  v_anon timestamptz;
  v_today date := (now() at time zone 'Africa/Johannesburg')::date;
begin
  select role, anonymised_at into v_role, v_anon from accounts where id = p_account_id;
  if not found then
    return array['Account not found'];
  end if;

  if v_anon is not null then r := r || 'Already anonymised'; end if;
  if v_role = 'admin' then r := r || 'Admin accounts cannot be anonymised. Change the role first'; end if;
  if p_account_id = auth.uid() then r := r || 'You cannot anonymise your own account'; end if;

  select count(*) into n
  from enrollments e join members m on m.id = e.member_id
  where m.account_id = p_account_id and e.status in ('pending', 'active', 'paused');
  if n > 0 then r := r || format('%s open enrolment(s): withdraw them first', n); end if;

  select count(*) into n
  from invoices where account_id = p_account_id and status in ('pending', 'overdue', 'partially_paid');
  if n > 0 then r := r || format('%s unpaid invoice(s): settle or cancel them first', n); end if;

  select count(*) into n
  from enrollment_refund_reviews rr
  join enrollments e on e.id = rr.enrollment_id
  join members m on m.id = e.member_id
  where m.account_id = p_account_id and rr.resolved_at is null;
  if n > 0 then r := r || format('%s refund decision(s) still open', n); end if;

  select count(*) into n
  from memberships where account_id = p_account_id and status in ('pending', 'active', 'non_renewing', 'attention');
  if n > 0 then r := r || 'Membership is still active: cancel it first (and cancel the subscription in Paystack)'; end if;

  select count(*) into n
  from coaches c
  join session_coaches sc on sc.coach_id = c.id
  join programme_sessions ps on ps.id = sc.session_id
  where c.account_id = p_account_id and ps.session_date >= v_today and coalesce(ps.status, '') <> 'cancelled';
  if n > 0 then r := r || format('Coach has %s upcoming session(s): reassign them first', n); end if;

  return r;
end;
$$;

-- ============================================================
-- Accounts list (adds last sign-in, MFA, children, pagination)
-- ============================================================
create or replace function admin_get_accounts_page(
  p_role   text default null,
  p_active boolean default null,
  p_search text default null,
  p_limit  int default 25,
  p_offset int default 0
)
returns table (
  id              uuid,
  role            text,
  full_name       text,
  email           text,
  phone           text,
  active          boolean,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  has_mfa         boolean,
  children_count  bigint,
  anonymised      boolean,
  total_count     bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_limit   int  := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset  int  := greatest(coalesce(p_offset, 0), 0);
  v_search  text := nullif(trim(coalesce(p_search, '')), '');
  v_pattern text;
begin
  perform assert_is_admin();

  if v_search is not null then
    v_pattern := '%' || replace(replace(replace(v_search, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  select
    a.id,
    a.role::text,
    a.full_name::text,
    a.email::text,
    a.phone::text,
    a.active,
    a.created_at,
    u.last_sign_in_at,
    exists (select 1 from auth.mfa_factors f where f.user_id = a.id and f.status = 'verified'),
    (select count(*) from members m where m.account_id = a.id and m.archived_at is null),
    a.anonymised_at is not null,
    count(*) over()
  from accounts a
  left join auth.users u on u.id = a.id
  where (p_role is null or a.role = p_role)
    and (p_active is null or a.active = p_active)
    and (v_pattern is null or a.full_name ilike v_pattern or a.email ilike v_pattern or a.phone ilike v_pattern)
  order by a.created_at desc, a.id
  limit v_limit offset v_offset;
end;
$$;

-- ============================================================
-- Account detail (side panel)
-- ============================================================
create or replace function admin_get_account_detail(p_account_id uuid)
returns json
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_today  date := (now() at time zone 'Africa/Johannesburg')::date;
  v_result json;
begin
  perform assert_is_admin();

  select json_build_object(
    'id', a.id,
    'role', a.role,
    'full_name', a.full_name,
    'email', a.email,
    'phone', a.phone,
    'alt_phone', a.alt_phone,
    'whatsapp_number', a.whatsapp_number,
    'area', a.area,
    'active', a.active,
    'created_at', a.created_at,
    'anonymised_at', a.anonymised_at,
    'is_self', a.id = auth.uid(),
    'last_sign_in_at', u.last_sign_in_at,
    'banned', coalesce(u.banned_until > now(), false),
    'providers', coalesce((select json_agg(i.provider) from auth.identities i where i.user_id = a.id), '[]'::json),
    'has_mfa', exists (select 1 from auth.mfa_factors f where f.user_id = a.id and f.status = 'verified'),
    'mfa_factors', coalesce((
      select json_agg(json_build_object('type', f.factor_type, 'name', f.friendly_name, 'added_at', f.created_at) order by f.created_at)
      from auth.mfa_factors f where f.user_id = a.id and f.status = 'verified'
    ), '[]'::json),
    'children', coalesce((
      select json_agg(json_build_object(
        'id', m.id,
        'full_name', m.full_name,
        'archived', m.archived_at is not null,
        'open_enrolments', (select count(*) from enrollments e
                            where e.member_id = m.id and e.status in ('pending', 'active', 'paused'))
      ) order by m.full_name)
      from members m where m.account_id = a.id
    ), '[]'::json),
    'coach', case when c.id is null then null else json_build_object(
      'id', c.id,
      'coach_type', c.coach_type,
      'max_student_ratio', c.max_student_ratio,
      'programmes', (select count(*) from programme_coaches pc where pc.coach_id = c.id),
      'upcoming_sessions', (
        select count(*) from session_coaches sc
        join programme_sessions ps on ps.id = sc.session_id
        where sc.coach_id = c.id and ps.session_date >= v_today and coalesce(ps.status, '') <> 'cancelled'
      )
    ) end,
    'membership', (
      select json_build_object('status', ms.status, 'amount', ms.amount, 'interval', ms."interval", 'next_charge_at', ms.next_charge_at)
      from memberships ms where ms.account_id = a.id order by ms.created_at desc limit 1
    ),
    'open_invoices', (
      select json_build_object('count', count(*), 'amount', coalesce(sum(i.total_amount), 0))
      from invoices i where i.account_id = a.id and i.status in ('pending', 'overdue', 'partially_paid')
    ),
    'other_active_admins', (select count(*) from accounts x where x.role = 'admin' and x.active and x.id <> a.id),
    'anonymise_blockers', to_json(account_anonymise_blockers(a.id)),
    'history', coalesce((
      select json_agg(json_build_object(
        'action', h.action, 'reason', h.reason, 'by', pb.full_name, 'at', h.performed_at, 'details', h.details
      ) order by h.performed_at desc)
      from (select * from account_admin_actions where account_id = a.id order by performed_at desc limit 20) h
      left join accounts pb on pb.id = h.performed_by
    ), '[]'::json)
  ) into v_result
  from accounts a
  left join auth.users u on u.id = a.id
  left join coaches c on c.account_id = a.id
  where a.id = p_account_id;

  if v_result is null then
    raise exception 'Account not found';
  end if;

  return v_result;
end;
$$;

-- ============================================================
-- Change role (guards: not yourself, not the last admin, no coach with upcoming sessions)
-- ============================================================
create or replace function admin_set_account_role(
  p_account_id uuid,
  p_role       text,
  p_reason     text default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old     text;
  v_active  boolean;
  v_anon    timestamptz;
  v_n       int;
  v_ratio   int;
  v_today   date := (now() at time zone 'Africa/Johannesburg')::date;
  v_reason  text := nullif(trim(coalesce(p_reason, '')), '');
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  if p_role not in ('parent', 'coach', 'admin') then
    raise exception 'Invalid role';
  end if;
  if p_account_id = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;
  if v_reason is null then                       -- remove these two lines if the old inline dropdown must keep working
    raise exception 'A reason is required';
  end if;

  select role, active, anonymised_at into v_old, v_active, v_anon
  from accounts where id = p_account_id for update;
  if not found then raise exception 'Account not found'; end if;
  if v_anon is not null then raise exception 'An anonymised account cannot be changed'; end if;

  if v_old = p_role then
    return json_build_object('changed', false, 'role', v_old);
  end if;

  if v_old = 'admin' and not exists (
    select 1 from accounts where role = 'admin' and active and id <> p_account_id
  ) then
    raise exception 'You cannot demote the last active administrator';
  end if;

  if p_role = 'admin' and not v_active then
    raise exception 'Reactivate this account before making it an administrator';
  end if;

  if v_old = 'coach' then
    select count(*) into v_n
    from coaches c
    join session_coaches sc on sc.coach_id = c.id
    join programme_sessions ps on ps.id = sc.session_id
    where c.account_id = p_account_id and ps.session_date >= v_today and coalesce(ps.status, '') <> 'cancelled';
    if v_n > 0 then
      raise exception 'This coach has % upcoming session(s). Reassign them first', v_n;
    end if;
  end if;

  update accounts set role = p_role where id = p_account_id;

  -- a coach account needs a coach record, or the coach portal says "Coach not found"
  if p_role = 'coach' then
    select default_max_ratio into v_ratio from app_settings where id = 1;
    insert into coaches (account_id, coach_type, max_student_ratio)
    values (p_account_id, 'assistant_coach', coalesce(v_ratio, 6))
    on conflict (account_id) do nothing;
  end if;

  insert into account_admin_actions (account_id, action, reason, details, performed_by)
  values (p_account_id, 'role_changed', v_reason, jsonb_build_object('from', v_old, 'to', p_role), auth.uid());

  return json_build_object('changed', true, 'role', p_role);
end;
$$;

-- ============================================================
-- Deactivate / reactivate. Deactivating blocks login and ends sessions.
-- ============================================================
create or replace function admin_set_account_active(
  p_account_id uuid,
  p_active     boolean,
  p_reason     text default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role   text;
  v_old    boolean;
  v_anon   timestamptz;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  if p_account_id = auth.uid() then
    raise exception 'You cannot change your own active status';
  end if;

  select role, active, anonymised_at into v_role, v_old, v_anon
  from accounts where id = p_account_id for update;
  if not found then raise exception 'Account not found'; end if;
  if v_anon is not null then raise exception 'An anonymised account cannot be changed'; end if;

  if not p_active and v_reason is null then      -- remove if the old inline toggle must keep working
    raise exception 'A reason is required';
  end if;

  if v_old = p_active then
    return json_build_object('changed', false, 'active', p_active);
  end if;

  if not p_active and v_role = 'admin' and not exists (
    select 1 from accounts where role = 'admin' and active and id <> p_account_id
  ) then
    raise exception 'You cannot deactivate the last active administrator';
  end if;

  update accounts set active = p_active where id = p_account_id;

  update auth.users
  set banned_until = case when p_active then null else now() + interval '100 years' end
  where id = p_account_id;

  if not p_active then
    delete from auth.sessions where user_id = p_account_id;   -- ends every device
  end if;

  insert into account_admin_actions (account_id, action, reason, performed_by)
  values (p_account_id, case when p_active then 'reactivated' else 'deactivated' end, v_reason, auth.uid());

  return json_build_object('changed', true, 'active', p_active);
end;
$$;

-- ============================================================
-- Used by the server actions (the email and the MFA removal go through Supabase's API)
-- ============================================================
create or replace function admin_authorize_password_reset(p_account_id uuid)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email  text;
  v_active boolean;
  v_anon   timestamptz;
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  select email, active, anonymised_at into v_email, v_active, v_anon from accounts where id = p_account_id;
  if not found then raise exception 'Account not found'; end if;
  if v_anon is not null then raise exception 'An anonymised account has no email'; end if;
  if not v_active then raise exception 'Reactivate this account before sending a reset link'; end if;
  if v_email is null then raise exception 'This account has no email address'; end if;

  if exists (
    select 1 from account_admin_actions
    where account_id = p_account_id and action = 'password_reset_sent'
      and performed_at > now() - interval '2 minutes'
  ) then
    raise exception 'A reset link was just sent. Please wait a couple of minutes';
  end if;

  return v_email;
end;
$$;

create or replace function admin_authorize_mfa_removal(p_account_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_anon timestamptz;
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  if p_account_id = auth.uid() then
    raise exception 'Use your own security settings to change your authenticator';
  end if;
  if nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'A reason is required';
  end if;

  select anonymised_at into v_anon from accounts where id = p_account_id;
  if not found then raise exception 'Account not found'; end if;
  if v_anon is not null then raise exception 'An anonymised account cannot be changed'; end if;

  if not exists (select 1 from auth.mfa_factors where user_id = p_account_id and status = 'verified') then
    raise exception 'This account has no authenticator enrolled';
  end if;
end;
$$;

create or replace function admin_revoke_account_sessions(p_account_id uuid)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  n int;
begin
  perform assert_is_admin();
  perform assert_recent_mfa();
  if p_account_id = auth.uid() then raise exception 'You cannot end your own sessions here'; end if;

  delete from auth.sessions where user_id = p_account_id;
  get diagnostics n = row_count;
  return n;
end;
$$;

create or replace function admin_log_account_action(p_account_id uuid, p_action text, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform assert_is_admin();
  if p_action not in ('password_reset_sent', 'mfa_removed') then
    raise exception 'Unknown action';
  end if;

  insert into account_admin_actions (account_id, action, reason, performed_by)
  values (p_account_id, p_action, nullif(trim(coalesce(p_reason, '')), ''), auth.uid());
end;
$$;

-- ============================================================
-- Anonymise (irreversible). Files in storage are deleted by the server action
-- using the URLs this function returns.
-- ============================================================
create or replace function admin_anonymise_account(
  p_account_id    uuid,
  p_confirm_email text,
  p_reason        text
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email      text;
  v_anon_email text;
  v_blockers   text[];
  v_member_ids int[];
  v_coach_ids  int[];
  v_docs       text[];
  v_levels     jsonb;
  v_reason     text := nullif(trim(coalesce(p_reason, '')), '');
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  if v_reason is null then raise exception 'A reason is required'; end if;

  select email into v_email from accounts where id = p_account_id for update;
  if not found then raise exception 'Account not found'; end if;

  if lower(trim(coalesce(p_confirm_email, ''))) <> lower(coalesce(v_email, '')) then
    raise exception 'The email you typed does not match this account';
  end if;

  v_blockers := account_anonymise_blockers(p_account_id);
  if coalesce(array_length(v_blockers, 1), 0) > 0 then
    raise exception 'Cannot anonymise yet: %', array_to_string(v_blockers, '; ');
  end if;

  v_anon_email := 'anonymised-' || p_account_id || '@anonymised.invalid';

  select coalesce(array_agg(id), '{}') into v_member_ids from members where account_id = p_account_id;
  select coalesce(array_agg(id), '{}') into v_coach_ids  from coaches where account_id = p_account_id;
  select coalesce(array_agg(file_url), '{}') into v_docs
  from documents where account_id = p_account_id or member_id = any(v_member_ids);

  -- levels are restored after appointment notes are cleared (a trigger on appointments can touch them)
  select coalesce(jsonb_object_agg(id::text, current_level_id), '{}'::jsonb) into v_levels
  from members where account_id = p_account_id;

  -- 1. The login: end sessions, remove MFA and linked sign-in methods, ban, free the email
  delete from auth.sessions    where user_id = p_account_id;
  delete from auth.mfa_factors where user_id = p_account_id;
  delete from auth.identities  where user_id = p_account_id;
  update auth.users
  set email = v_anon_email,
      phone = null,
      raw_user_meta_data = '{}'::jsonb,
      encrypted_password = '',
      banned_until = now() + interval '100 years'
  where id = p_account_id;

  -- 2. The children: keep the year of birth, gender and level so reports still work
  update members
  set full_name = 'Anonymised member',
      dob = date_trunc('year', dob)::date,
      school_name = null, school_grade = null,
      kit_size_top = null, kit_size_bottom = null, shoe_size = null,
      previous_club = null, medical_notes = null, medical_aid_details = null, doctor_contact = null,
      emergency_contact_name = null, emergency_contact_relationship = null, emergency_contact_phone = null,
      archived_at = coalesce(archived_at, now())
  where account_id = p_account_id;

  update member_questionnaires
  set availability = null, interests = null, gear_owned = null, self_reported_skill_level = null
  where member_id = any(v_member_ids);

  update consents set document_url = null where account_id = p_account_id;
  delete from documents where account_id = p_account_id or member_id = any(v_member_ids);

  update appointments       set notes = null where member_id = any(v_member_ids);
  update level_progressions set notes = null where member_id = any(v_member_ids);
  update member_milestones  set notes = null where member_id = any(v_member_ids);
  update gear_rentals       set notes = null where member_id = any(v_member_ids);
  update enrollment_status_history set reason = '[removed]'
  where reason is not null and enrollment_id in (select id from enrollments where member_id = any(v_member_ids));

  update members m
  set current_level_id = (v_levels ->> m.id::text)::int
  where m.account_id = p_account_id;

  -- 3. The parent's own data
  delete from notifications            where account_id = p_account_id;
  delete from push_subscriptions       where account_id = p_account_id;
  delete from notification_preferences where account_id = p_account_id;

  update team_members
  set display_name = 'Former team member', bio = null, portrait_url = null, visibility = 'archived'
  where coach_id = any(v_coach_ids);

  update coach_invites
  set email = 'anonymised-' || id || '@anonymised.invalid'
  where lower(email) = lower(v_email);

  update accounts
  set full_name = 'Anonymised user',
      email = v_anon_email,
      phone = null, address = null, avatar_url = null,
      alt_phone = null, whatsapp_number = null, area = null, relationship_to_child = null,
      paystack_customer_code = null, paystack_authorization_code = null, paystack_email_token = null,
      active = false,
      anonymised_at = now()
  where id = p_account_id;

  -- 4. Last: the audit trail kept row snapshots with the old values (including the updates above)
  update audit_log set old_data = null, new_data = null
  where (table_name = 'accounts' and record_id = p_account_id::text)
     or (table_name = 'members' and record_id in (select x::text from unnest(v_member_ids) as x))
     or (table_name = 'level_progressions'
         and (coalesce(new_data, old_data) ->> 'member_id')::int = any(v_member_ids));
  update audit_log set actor_name = 'Anonymised user' where actor_id = p_account_id;

  insert into account_admin_actions (account_id, action, reason, details, performed_by)
  values (p_account_id, 'anonymised', v_reason,
          jsonb_build_object('members', coalesce(array_length(v_member_ids, 1), 0),
                             'documents', coalesce(array_length(v_docs, 1), 0)),
          auth.uid());

  return json_build_object(
    'members_anonymised', coalesce(array_length(v_member_ids, 1), 0),
    'document_urls', to_json(v_docs)
  );
end;
$$;

-- ============================================================
-- Grants (anon revoked explicitly: Supabase grants it directly)
-- ============================================================
revoke execute on function assert_recent_mfa() from public, anon, authenticated;
revoke execute on function account_anonymise_blockers(uuid) from public, anon, authenticated;

revoke execute on function admin_get_accounts_page(text, boolean, text, int, int) from public, anon;
revoke execute on function admin_get_account_detail(uuid) from public, anon;
revoke execute on function admin_set_account_role(uuid, text, text) from public, anon;
revoke execute on function admin_set_account_active(uuid, boolean, text) from public, anon;
revoke execute on function admin_authorize_password_reset(uuid) from public, anon;
revoke execute on function admin_authorize_mfa_removal(uuid, text) from public, anon;
revoke execute on function admin_revoke_account_sessions(uuid) from public, anon;
revoke execute on function admin_log_account_action(uuid, text, text) from public, anon;
revoke execute on function admin_anonymise_account(uuid, text, text) from public, anon;

grant execute on function admin_get_accounts_page(text, boolean, text, int, int) to authenticated;
grant execute on function admin_get_account_detail(uuid) to authenticated;
grant execute on function admin_set_account_role(uuid, text, text) to authenticated;
grant execute on function admin_set_account_active(uuid, boolean, text) to authenticated;
grant execute on function admin_authorize_password_reset(uuid) to authenticated;
grant execute on function admin_authorize_mfa_removal(uuid, text) to authenticated;
grant execute on function admin_revoke_account_sessions(uuid) to authenticated;
grant execute on function admin_log_account_action(uuid, text, text) to authenticated;
grant execute on function admin_anonymise_account(uuid, text, text) to authenticated;