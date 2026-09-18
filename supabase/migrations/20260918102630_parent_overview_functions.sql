-- ============================================================
-- Parent Overview RPCs
-- ============================================================

drop function if exists parent_get_stats();
drop function if exists parent_get_children();
drop function if exists parent_get_upcoming_sessions(int);
drop function if exists parent_get_recent_progress(int);
drop function if exists parent_get_outstanding_invoices();


-- ---------- Stat tiles ----------

create or replace function parent_get_stats()
returns table (
  active_members bigint,
  upcoming_sessions bigint,
  outstanding_balance numeric,
  badges_this_month bigint
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_account_id uuid := auth.uid();
begin
  if v_account_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    -- Active members
    coalesce((
      select count(*) from members m
      where m.account_id = v_account_id and m.archived_at is null
    ), 0),

    -- Upcoming sessions (next 14 days)
    coalesce((
      select count(distinct ps.id)
      from programme_sessions ps
      join enrollments e on e.programme_id = ps.programme_id
      join members m on m.id = e.member_id
      where m.account_id = v_account_id
        and m.archived_at is null
        and e.status = 'active'
        and ps.status = 'scheduled'
        and ps.session_date >= current_date
        and ps.session_date <= current_date + 14
    ), 0),

    -- Outstanding balance
    coalesce((
      select sum(i.total_amount)
      from invoices i
      where i.account_id = v_account_id
        and i.status in ('pending', 'partially_paid', 'overdue')
    ), 0),

    -- Badges this month
    coalesce((
      select count(*)
      from member_milestones mm
      join members m on m.id = mm.member_id
      where m.account_id = v_account_id
        and m.archived_at is null
        and mm.completed_at is not null
        and mm.completed_at >= date_trunc('month', current_date)
    ), 0);
end;
$$;


-- ---------- Children summary ----------

create or replace function parent_get_children()
returns table (
  id int,
  full_name text,
  age int,
  level_name text,
  initials text,
  next_session_label text,
  next_programme_name text,
  next_venue_name text,
  attendance_rate int,
  badges int
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_account_id uuid := auth.uid();
begin
  if v_account_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    m.id,
    m.full_name,
    extract(year from age(current_date, m.dob))::int,
    l.name,

    upper(
      coalesce(
        left(split_part(m.full_name, ' ', 1), 1) ||
        coalesce(left(split_part(m.full_name, ' ', 2), 1), ''),
        '?'
      )
    ),

    case
      when ns.session_date is not null then
        to_char(ns.session_date, 'Dy, DD Mon') || ' · ' || to_char(ns.start_time, 'HH24:MI')
      else null
    end,

    ns.programme_name,
    ns.venue_name,

    coalesce((
      select round(
        (count(*) filter (where a.status = 'present')::numeric / nullif(count(*), 0)) * 100
      )::int
      from attendance a
      where a.member_id = m.id
    ), 0),

    coalesce((
      select count(*)
      from member_milestones mm
      where mm.member_id = m.id and mm.completed_at is not null
    ), 0)::int

  from members m
  left join levels l on l.id = m.current_level_id
  left join lateral (
    select ps.session_date, ps.start_time, p.name as programme_name, v.name as venue_name
    from enrollments e
    join programme_sessions ps on ps.programme_id = e.programme_id
    join programmes p on p.id = e.programme_id
    left join venues v on v.id = p.venue_id
    where e.member_id = m.id
      and e.status = 'active'
      and ps.status = 'scheduled'
      and ps.session_date >= current_date
    order by ps.session_date asc, ps.start_time asc
    limit 1
  ) ns on true
  where m.account_id = v_account_id
    and m.archived_at is null
  order by m.created_at asc;
end;
$$;


-- ---------- Upcoming sessions ----------

create or replace function parent_get_upcoming_sessions(p_limit int default 4)
returns table (
  session_id int,
  member_name text,
  programme_name text,
  session_date date,
  start_time time,
  venue_name text
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_account_id uuid := auth.uid();
begin
  if v_account_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    ps.id,
    m.full_name,
    p.name,
    ps.session_date,
    ps.start_time,
    v.name
  from programme_sessions ps
  join programmes p on p.id = ps.programme_id
  left join venues v on v.id = p.venue_id
  join enrollments e on e.programme_id = ps.programme_id and e.status = 'active'
  join members m on m.id = e.member_id
  where m.account_id = v_account_id
    and m.archived_at is null
    and ps.status = 'scheduled'
    and ps.session_date >= current_date
  order by ps.session_date asc, ps.start_time asc
  limit p_limit;
end;
$$;


-- ---------- Recent progress ----------

create or replace function parent_get_recent_progress(p_limit int default 5)
returns table (
  milestone_id int,
  member_name text,
  milestone_name text,
  completed_at date
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_account_id uuid := auth.uid();
begin
  if v_account_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    mm.id,
    m.full_name,
    cm.name,
    mm.completed_at
  from member_milestones mm
  join members m on m.id = mm.member_id
  join curriculum_modules cm on cm.id = mm.curriculum_module_id
  where m.account_id = v_account_id
    and m.archived_at is null
    and mm.completed_at is not null
  order by mm.completed_at desc
  limit p_limit;
end;
$$;


-- ---------- Outstanding invoices ----------

create or replace function parent_get_outstanding_invoices()
returns table (
  invoice_id int,
  description text,
  amount numeric,
  due_at date,
  is_overdue boolean
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_account_id uuid := auth.uid();
begin
  if v_account_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    i.id,
    coalesce(
      (select ili.description from invoice_line_items ili where ili.invoice_id = i.id limit 1),
      'Invoice'
    ),
    i.total_amount,
    i.due_at,
    (i.status = 'overdue' or (i.due_at is not null and i.due_at < current_date))
  from invoices i
  where i.account_id = v_account_id
    and i.status in ('pending', 'partially_paid', 'overdue')
  order by i.due_at asc nulls last;
end;
$$;


-- ---------- Grants ----------

grant execute on function parent_get_stats() to authenticated;
grant execute on function parent_get_children() to authenticated;
grant execute on function parent_get_upcoming_sessions(int) to authenticated;
grant execute on function parent_get_recent_progress(int) to authenticated;
grant execute on function parent_get_outstanding_invoices() to authenticated;