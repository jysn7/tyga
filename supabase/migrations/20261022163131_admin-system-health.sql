create or replace function health_ping()
returns boolean language sql stable security definer set search_path = public as $$ select true $$;
grant execute on function health_ping() to anon, authenticated;   -- deliberately public: the uptime monitor calls it

-- Runs one counting query. Returns null if the query cannot run (for example a table was never created).
create or replace function health_count(p_sql text)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare n int;
begin
  execute p_sql into n;
  return coalesce(n, 0);
exception when others then
  return null;
end;
$$;
revoke execute on function health_count(text) from public, anon, authenticated;   -- it runs text as the owner: never callable directly

create or replace function admin_get_system_health()
returns json
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  perform assert_is_admin();

  return json_build_object(
    'checked_at', now(),
    'checks', (
      select coalesce(json_agg(json_build_object(
          'code', c.code, 'label', c.label, 'severity', c.severity, 'count', health_count(c.q))
        order by case c.severity when 'high' then 0 when 'medium' then 1 else 2 end, c.label), '[]'::json)
      from (values
        ('exposed_tables', 'Tables the public key can read with no row-level security', 'high',
         $q$ select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
               and has_table_privilege('anon', c.oid, 'select') $q$),
        ('failed_jobs', 'Scheduled jobs that failed in the last 24 hours', 'high',
         $q$ select count(*) from job_runs where ok = false and started_at > now() - interval '24 hours' $q$),
        ('paid_not_active', 'Paid invoices whose enrolment is still pending', 'high',
         $q$ select count(*) from invoices i
             join invoice_line_items li on li.invoice_id = i.id and li.item_type = 'programme_fee'
             join enrollments e on e.id = li.reference_id
             where i.status = 'paid' and e.status = 'pending' $q$),
        ('over_capacity', 'Programmes with more active children than places', 'high',
         $q$ select count(*) from programmes p where p.capacity is not null
             and (select count(*) from enrollments e where e.programme_id = p.id and e.status = 'active') > p.capacity $q$),
        ('duplicate_open', 'Children enrolled twice in the same programme', 'high',
         $q$ select count(*) from (select 1 from enrollments where status in ('pending', 'active', 'paused')
             group by member_id, programme_id having count(*) > 1) x $q$),
        ('stuck_payments', 'Card payments started but never completed (abandoned checkout or a missed webhook)', 'medium',
         $q$ select count(*) from payments p join invoices i on i.id = p.invoice_id
             where p.status = 'pending' and i.status in ('pending', 'overdue')
               and i.issued_at < (now() at time zone 'Africa/Johannesburg')::date - 1 $q$),
        ('active_unpaid', 'Active enrolments with an unpaid invoice', 'medium',
         $q$ select count(*) from enrollments e where e.status = 'active' and not coalesce(e.subsidised, false)
             and exists (select 1 from invoice_line_items li join invoices i on i.id = li.invoice_id
                         where li.item_type = 'programme_fee' and li.reference_id = e.id
                           and i.status in ('pending', 'overdue')) $q$),
        ('refunds_waiting', 'Refund decisions waiting more than 7 days', 'medium',
         $q$ select count(*) from enrollment_refund_reviews
             where resolved_at is null and created_at < now() - interval '7 days' $q$),
        ('tickets_overdue', 'Support tickets with no reply after 24 hours', 'medium',
         $q$ select count(*) from conversations where kind = 'ticket' and status = 'open'
             and first_response_at is null and created_at < now() - interval '24 hours' $q$),
        ('deletion_requests_old', 'Data deletion requests open more than 7 days', 'medium',
         $q$ select count(*) from account_data_requests
             where kind = 'deletion' and status = 'open' and created_at < now() - interval '7 days' $q$),
        ('memberships_attention', 'Memberships needing attention (failed charge)', 'medium',
         $q$ select count(*) from memberships where status = 'attention' $q$),
        ('staff_without_mfa', 'Active coaches and admins with no authenticator', 'medium',
         $q$ select count(*) from accounts a where a.role in ('admin', 'coach') and a.active
             and not exists (select 1 from auth.mfa_factors f where f.user_id = a.id and f.status = 'verified') $q$),
        ('single_admin', 'Fewer than two active administrators (a lockout risk)', 'medium',
         $q$ select case when count(*) < 2 then 1 else 0 end from accounts where role = 'admin' and active $q$),
        ('sessions_no_coach', 'Upcoming sessions with no coach assigned', 'medium',
         $q$ select count(*) from programme_sessions ps where ps.session_date >= current_date
             and coalesce(ps.status, '') <> 'cancelled'
             and not exists (select 1 from session_coaches sc where sc.session_id = ps.id) $q$),
        ('stale_jobs', 'Daily jobs that have not run in over 36 hours', 'medium',
         $q$ select count(*) from (select job, max(started_at) as m from job_runs
             where job in ('overdue_invoices', 'complete_enrolments', 'close_stale_tickets') group by job) x
             where x.m < now() - interval '36 hours' $q$),
        ('pending_old', 'Enrolments pending for more than 30 days', 'low',
         $q$ select count(*) from enrollments where status = 'pending' and joined_at < current_date - 30 $q$),
        ('sessions_no_venue', 'Upcoming sessions with no venue', 'low',
         $q$ select count(*) from programme_sessions where venue_id is null and session_date >= current_date $q$),
        ('coaches_no_account', 'Coach records with no account', 'low',
         $q$ select count(*) from coaches where account_id is null $q$)
      ) as c(code, label, severity, q)
    ),
    'jobs', (
      select coalesce(json_agg(j order by j.job), '[]'::json)
      from (select distinct on (job) job, started_at, finished_at, ok, detail
            from job_runs order by job, started_at desc) j
    )
  );
end;
$$;

-- CSV exports. Medical notes are never included. Every export is logged.
create or replace function admin_export(p_kind text, p_from date default null, p_to date default null)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_today date := (now() at time zone 'Africa/Johannesburg')::date;
  v_from  date := coalesce(p_from, v_today - 90);
  v_to    date := coalesce(p_to, v_today);
  v_rows  json;
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  if p_kind not in ('members', 'enrolments', 'attendance', 'payments') then raise exception 'Unknown export'; end if;
  if v_to < v_from then raise exception 'The end date is before the start date'; end if;
  if v_to - v_from > 731 then raise exception 'Choose a range of two years or less'; end if;

  if p_kind = 'members' then
    select coalesce(json_agg(x), '[]'::json) into v_rows from (
      select m.id, m.full_name as child, m.dob as date_of_birth, m.gender, l.name as level,
             a.full_name as parent, a.email as parent_email, a.phone as parent_phone,
             (select count(*) from enrollments e where e.member_id = m.id and e.status = 'active') as active_enrolments,
             (m.archived_at is not null) as archived, m.created_at::date as registered
      from members m join accounts a on a.id = m.account_id left join levels l on l.id = m.current_level_id
      order by m.full_name limit 20000) x;

  elsif p_kind = 'enrolments' then
    select coalesce(json_agg(x), '[]'::json) into v_rows from (
      select e.id, m.full_name as child, a.full_name as parent, p.name as programme, e.status,
             e.joined_at, coalesce(e.subsidised, false) as subsidised
      from enrollments e join members m on m.id = e.member_id join accounts a on a.id = m.account_id
      join programmes p on p.id = e.programme_id
      where e.joined_at between v_from and v_to
      order by e.joined_at desc limit 20000) x;

  elsif p_kind = 'attendance' then
    select coalesce(json_agg(x), '[]'::json) into v_rows from (
      select ps.session_date as date, p.name as programme, m.full_name as child, at.status, at.marked_at
      from attendance at join programme_sessions ps on ps.id = at.session_id
      join programmes p on p.id = ps.programme_id join members m on m.id = at.member_id
      where ps.session_date between v_from and v_to
      order by ps.session_date desc, p.name, m.full_name limit 20000) x;

  else
    select coalesce(json_agg(x), '[]'::json) into v_rows from (
      select py.id, py.invoice_id, a.full_name as parent, py.amount, py.method, py.status,
             py.gateway_reference as reference, py.paid_at
      from payments py join invoices i on i.id = py.invoice_id join accounts a on a.id = i.account_id
      where (py.paid_at at time zone 'Africa/Johannesburg')::date between v_from and v_to
      order by py.paid_at desc limit 20000) x;
  end if;

  insert into account_admin_actions (account_id, action, details, performed_by)
  values (auth.uid(), 'data_exported',
          jsonb_build_object('kind', p_kind, 'from', v_from, 'to', v_to), auth.uid());

  return v_rows;
end;
$$;

revoke execute on function admin_get_system_health(), admin_export(text, date, date) from public, anon;
grant  execute on function admin_get_system_health(), admin_export(text, date, date) to authenticated;