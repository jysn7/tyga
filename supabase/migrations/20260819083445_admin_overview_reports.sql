-- ============================================================
-- Admin: Overview Dashboard Reports
-- ============================================================

-- ---------- Stat tiles, with month-over-month deltas ----------

create or replace function admin_report_overview_stats()
returns table (
  total_accounts bigint,
  total_accounts_delta_pct numeric,
  active_members bigint,
  active_members_delta_pct numeric,
  active_coaches bigint,
  active_coaches_delta int,
  revenue_this_month decimal(10,2),
  revenue_delta_pct numeric
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_accounts_now bigint;
  v_accounts_prev bigint;
  v_members_now bigint;
  v_members_prev bigint;
  v_coaches_now bigint;
  v_coaches_prev bigint;
  v_revenue_now decimal(10,2);
  v_revenue_prev decimal(10,2);
begin
  perform assert_is_admin();

  select count(*) into v_accounts_now from accounts;
  select count(*) into v_accounts_prev from accounts
    where created_at < now() - interval '30 days';

  select count(distinct m.id) into v_members_now
    from members m join enrollments e on e.member_id = m.id
    where e.status = 'active' and m.archived_at is null;
  select count(distinct m.id) into v_members_prev
    from members m join enrollments e on e.member_id = m.id
    where e.status = 'active' and m.archived_at is null
      and e.joined_at < (current_date - 30);

  select count(*) into v_coaches_now
    from coaches c join accounts a on a.id = c.account_id
    where a.active = true;
  select count(*) into v_coaches_prev
    from coaches c join accounts a on a.id = c.account_id
    where a.active = true and a.created_at < now() - interval '30 days';

  select coalesce(sum(amount), 0) into v_revenue_now
    from payments
    where status = 'paid'
      and date_trunc('month', paid_at) = date_trunc('month', now());
  select coalesce(sum(amount), 0) into v_revenue_prev
    from payments
    where status = 'paid'
      and date_trunc('month', paid_at) = date_trunc('month', now() - interval '1 month');

  return query
  select
    v_accounts_now,
    case when v_accounts_prev = 0 then null
      else round((v_accounts_now - v_accounts_prev)::numeric / v_accounts_prev * 100, 1)
    end,
    v_members_now,
    case when v_members_prev = 0 then null
      else round((v_members_now - v_members_prev)::numeric / v_members_prev * 100, 1)
    end,
    v_coaches_now,
    (v_coaches_now - v_coaches_prev)::int,
    v_revenue_now,
    case when v_revenue_prev = 0 then null
      else round((v_revenue_now - v_revenue_prev)::numeric / v_revenue_prev * 100, 1)
    end;
end;
$$;


-- ---------- Enrollment trend, last N months ----------

create or replace function admin_report_enrollment_trend(p_months int default 6)
returns table (month_label text, enrollments bigint)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select
    to_char(month_start, 'Mon') as month_label,
    coalesce(count(e.id) filter (
      where date_trunc('month', e.joined_at) = month_start
    ), 0) as enrollments
  from generate_series(
    date_trunc('month', now()) - (p_months - 1) * interval '1 month',
    date_trunc('month', now()),
    interval '1 month'
  ) as month_start
  left join enrollments e on date_trunc('month', e.joined_at) = month_start
  group by month_start
  order by month_start;
end;
$$;


-- ---------- Members by level (current snapshot) ----------

create or replace function admin_report_members_by_level()
returns table (level_name text, member_count bigint, sort_order int)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select l.name, count(m.id), l.sort_order
  from levels l
  left join members m on m.current_level_id = l.id and m.archived_at is null
  where l.archived_at is null
  group by l.id, l.name, l.sort_order
  order by l.sort_order;
end;
$$;


grant execute on function admin_report_overview_stats() to authenticated;
grant execute on function admin_report_enrollment_trend(int) to authenticated;
grant execute on function admin_report_members_by_level() to authenticated;