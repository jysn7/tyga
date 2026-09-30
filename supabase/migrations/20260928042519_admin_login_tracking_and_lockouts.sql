-- ============================================================
-- Login tracking + account lockouts
-- ============================================================

create table if not exists login_events (
  id bigserial primary key,
  account_id uuid references accounts(id) on delete set null,
  email_attempted text not null,
  event_type text not null check (event_type in ('login_success', 'login_failed', 'blocked_locked', 'logout')),
  ip_address inet,
  user_agent text,
  suspicious boolean not null default false,
  suspicious_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_events_account on login_events (account_id, created_at desc);
create index if not exists idx_login_events_email on login_events (email_attempted, created_at desc);
create index if not exists idx_login_events_ip on login_events (ip_address, created_at desc);
create index if not exists idx_login_events_suspicious on login_events (created_at desc) where suspicious;

create table if not exists account_lockouts (
  id serial primary key,
  account_id uuid not null references accounts(id) on delete cascade,
  source text not null check (source in ('admin', 'automatic')),
  reason text not null,
  locked_by uuid references accounts(id) on delete set null, -- null for automatic locks
  locked_at timestamptz not null default now(),
  locked_until timestamptz,                                  -- null = indefinite
  lifted_at timestamptz,
  lifted_by uuid references accounts(id) on delete set null,
  lift_note text
);

create index if not exists idx_lockouts_account on account_lockouts (account_id, locked_at desc);

alter table login_events enable row level security;
alter table account_lockouts enable row level security;

-- No insert/update/delete policies on purpose: writes only happen via the
-- service role (Edge Function / server route) or the definer functions below.
create policy "Users view own login events"
  on login_events for select to authenticated using (account_id = auth.uid());
create policy "Admins view login events"
  on login_events for select to authenticated using (is_admin());
create policy "Admins view lockouts"
  on account_lockouts for select to authenticated using (is_admin());


-- ---------- Lockout lookups ----------

-- Service-role only: the login route uses this to check an account by id.
create or replace function get_active_lockout(p_account_id uuid)
returns table (id int, reason text, locked_until timestamptz, source text)
language sql stable security definer set search_path = public
as $$
  select l.id, l.reason, l.locked_until, l.source
  from account_lockouts l
  where l.account_id = p_account_id
    and l.lifted_at is null
    and (l.locked_until is null or l.locked_until > now())
  order by l.locked_at desc
  limit 1;
$$;

-- Supabase grants new functions to anon/authenticated by default, so the
-- revoke has to name them explicitly, not just "public".
revoke execute on function get_active_lockout(uuid) from public, anon, authenticated;
grant execute on function get_active_lockout(uuid) to service_role;

-- A logged-in user checking their own status (used by the layout guard).
create or replace function get_my_active_lockout()
returns table (reason text, locked_until timestamptz)
language sql stable security definer set search_path = public
as $$
  select l.reason, l.locked_until
  from account_lockouts l
  where l.account_id = auth.uid()
    and l.lifted_at is null
    and (l.locked_until is null or l.locked_until > now())
  order by l.locked_at desc
  limit 1;
$$;

grant execute on function get_my_active_lockout() to authenticated;


-- ---------- Record a login event + flag suspicious activity ----------
-- Service-role only. If anyone could call this they could forge audit rows.

drop function if exists record_login_event(text, text, inet, text);

create or replace function record_login_event(
  p_email text,
  p_event_type text,
  p_ip inet default null,
  p_user_agent text default null
)
returns table (out_account_id uuid, out_recent_failures int, out_should_lock boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_account_id uuid;
  v_suspicious boolean := false;
  v_reason text;
  v_failures int := 0;
begin
  select a.id into v_account_id from accounts a where lower(a.email) = lower(p_email);

  -- Successful sign-in from an IP this account has never used before
  if p_event_type = 'login_success' and v_account_id is not null and p_ip is not null then
    if exists (select 1 from login_events e where e.account_id = v_account_id and e.event_type = 'login_success')
       and not exists (select 1 from login_events e where e.account_id = v_account_id
                       and e.event_type = 'login_success' and e.ip_address = p_ip) then
      v_suspicious := true;
      v_reason := 'Sign-in from a new IP address';
    end if;
  end if;

  if p_event_type = 'login_failed' then
    -- Failures for this email in the last 15 minutes, including this one
    select count(*) + 1 into v_failures
    from login_events e
    where lower(e.email_attempted) = lower(p_email)
      and e.event_type = 'login_failed'
      and e.created_at > now() - interval '15 minutes';

    if v_failures >= 5 then
      v_suspicious := true;
      v_reason := 'Repeated failed sign-ins';
    elsif p_ip is not null and (
      select count(distinct lower(e.email_attempted)) from login_events e
      where e.ip_address = p_ip and e.event_type = 'login_failed'
        and e.created_at > now() - interval '15 minutes'
    ) >= 5 then
      v_suspicious := true;
      v_reason := 'Many different accounts targeted from one IP';
    end if;
  end if;

  insert into login_events (account_id, email_attempted, event_type, ip_address, user_agent, suspicious, suspicious_reason)
  values (v_account_id, lower(p_email), p_event_type, p_ip, p_user_agent, v_suspicious, v_reason);

  return query select v_account_id, v_failures,
    (p_event_type = 'login_failed' and v_account_id is not null and v_failures >= 5);
end;
$$;

revoke execute on function record_login_event(text, text, inet, text) from public, anon, authenticated;
grant execute on function record_login_event(text, text, inet, text) to service_role;


-- ---------- Admin read functions ----------

drop function if exists admin_get_login_events(uuid, boolean, int);
drop function if exists admin_get_lockouts(boolean);

create or replace function admin_get_login_events(
  p_account_id uuid default null,
  p_suspicious_only boolean default false,
  p_limit int default 100
)
returns table (
  id bigint, account_id uuid, account_name text, email_attempted text,
  event_type text, ip_address text, user_agent text,
  suspicious boolean, suspicious_reason text, created_at timestamptz
)
language plpgsql security definer set search_path = public stable
as $$
begin
  perform assert_is_admin();

  return query
  select e.id, e.account_id, a.full_name, e.email_attempted, e.event_type,
         host(e.ip_address), e.user_agent, e.suspicious, e.suspicious_reason, e.created_at
  from login_events e
  left join accounts a on a.id = e.account_id
  where (p_account_id is null or e.account_id = p_account_id)
    and (not p_suspicious_only or e.suspicious)
  order by e.created_at desc
  limit p_limit;
end;
$$;

create or replace function admin_get_lockouts(p_active_only boolean default false)
returns table (
  id int, account_id uuid, account_name text, account_email text, source text,
  reason text, locked_by_name text, locked_at timestamptz, locked_until timestamptz,
  lifted_at timestamptz, lift_note text, is_active boolean
)
language plpgsql security definer set search_path = public stable
as $$
begin
  perform assert_is_admin();

  return query
  select l.id, l.account_id, a.full_name, a.email, l.source, l.reason, lb.full_name,
         l.locked_at, l.locked_until, l.lifted_at, l.lift_note,
         (l.lifted_at is null and (l.locked_until is null or l.locked_until > now()))
  from account_lockouts l
  join accounts a on a.id = l.account_id
  left join accounts lb on lb.id = l.locked_by
  where not p_active_only
     or (l.lifted_at is null and (l.locked_until is null or l.locked_until > now()))
  order by l.locked_at desc;
end;
$$;

grant execute on function admin_get_login_events(uuid, boolean, int) to authenticated;
grant execute on function admin_get_lockouts(boolean) to authenticated;