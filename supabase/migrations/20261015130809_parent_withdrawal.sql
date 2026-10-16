create table if not exists enrollment_status_history (
  id            bigint generated always as identity primary key,
  enrollment_id int not null references enrollments(id) on delete cascade,
  from_status   text,
  to_status     text not null,
  reason        text,
  changed_by    uuid,
  changed_at    timestamptz not null default now()
);
create index if not exists idx_enr_history on enrollment_status_history (enrollment_id, changed_at desc);

create table if not exists enrollment_refund_reviews (
  id            bigint generated always as identity primary key,
  enrollment_id int not null references enrollments(id) on delete cascade,
  invoice_id    int,
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   uuid
);
create unique index if not exists uq_open_refund_review
  on enrollment_refund_reviews (enrollment_id) where resolved_at is null;

alter table enrollment_status_history enable row level security;
alter table enrollment_refund_reviews enable row level security;

create or replace function parent_withdraw_enrollment(
  p_enrollment_id int,
  p_reason_code   text,
  p_reason_note   text default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid            uuid := auth.uid();
  v_old            text;
  v_member_name    text;
  v_programme_name text;
  v_invoice_id     int;
  v_invoice_status text;
  v_refund         boolean := false;
  v_cancelled      boolean := false;
  v_admin          uuid;
  v_label          text;
  v_note           text := left(nullif(trim(coalesce(p_reason_note, '')), ''), 300);
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_label := case p_reason_code
    when 'schedule_clash' then 'Schedule clash'
    when 'cost'           then 'Cost'
    when 'moved_away'     then 'Moved away'
    when 'lost_interest'  then 'Lost interest'
    when 'other'          then 'Other'
    else null
  end;

  if v_label is null then
    raise exception 'Please choose a reason';
  end if;
  if p_reason_code = 'other' and v_note is null then
    raise exception 'Please tell us the reason';
  end if;

  -- Only the parent's own child's enrolment is found, and the row is locked
  select e.status, m.full_name, p.name
    into v_old, v_member_name, v_programme_name
  from enrollments e
  join members m on m.id = e.member_id
  join programmes p on p.id = e.programme_id
  where e.id = p_enrollment_id
    and m.account_id = v_uid
  for update of e;

  if v_old is null then
    raise exception 'Enrollment not found';
  end if;

  -- A second click or a double submit does nothing
  if v_old in ('withdrawn', 'cancelled') then
    return json_build_object(
      'enrollment_id', p_enrollment_id,
      'status', v_old,
      'already', true,
      'refund_review', exists (
        select 1 from enrollment_refund_reviews r
        where r.enrollment_id = p_enrollment_id and r.resolved_at is null),
      'invoice_cancelled', false
    );
  end if;

  if v_old = 'completed' then
    raise exception 'This enrolment has already finished';
  end if;

  update enrollments set status = 'withdrawn' where id = p_enrollment_id;

  insert into enrollment_status_history (enrollment_id, from_status, to_status, reason, changed_by)
  values (p_enrollment_id, v_old, 'withdrawn',
          'Parent: ' || v_label || coalesce(' - ' || v_note, ''), v_uid);

  select i.id, i.status into v_invoice_id, v_invoice_status
  from invoice_line_items li
  join invoices i on i.id = li.invoice_id
  where li.item_type = 'programme_fee' and li.reference_id = p_enrollment_id
  order by i.id desc
  limit 1;

  if v_invoice_status in ('pending', 'overdue') then
    update invoices set status = 'cancelled' where id = v_invoice_id;
    v_cancelled := true;
  elsif v_invoice_status in ('paid', 'partially_paid') then
    insert into enrollment_refund_reviews (enrollment_id, invoice_id)
    values (p_enrollment_id, v_invoice_id)
    on conflict (enrollment_id) where resolved_at is null do nothing;
    v_refund := true;
  end if;

  -- Best effort: a notification problem never blocks the withdrawal
  begin
    perform create_notification(
      v_uid,
      'enrollment_update',
      case when v_old = 'pending' then 'Enrolment cancelled' else 'Enrolment withdrawn' end,
      format('%s has been %s %s.%s',
        v_member_name,
        case when v_old = 'pending' then 'cancelled from' else 'withdrawn from' end,
        v_programme_name,
        case when v_refund
             then ' The academy will review whether a refund applies and be in touch.'
             else '' end),
      'enrollment', p_enrollment_id, 'in_app'
    );

    for v_admin in select a.id from accounts a where a.role = 'admin' and a.active loop
      perform create_notification(
        v_admin,
        'enrollment_update',
        'Enrolment withdrawn by a parent',
        format('%s withdrew from %s (%s).%s',
          v_member_name, v_programme_name, v_label,
          case when v_refund then ' A paid enrolment: a refund decision is needed.' else '' end),
        'enrollment', p_enrollment_id, 'in_app'
      );
    end loop;
  exception when others then
    null;
  end;

  return json_build_object(
    'enrollment_id', p_enrollment_id,
    'status', 'withdrawn',
    'already', false,
    'refund_review', v_refund,
    'invoice_cancelled', v_cancelled
  );
end;
$$;

revoke execute on function parent_withdraw_enrollment(int, text, text) from public, anon;
grant  execute on function parent_withdraw_enrollment(int, text, text) to authenticated;


-- 1. Stop parents bypassing the function with a direct table update (it leaves the invoice pending
--    and writes no history). Only drop it if your code has no .from("enrollments").update(...)
drop policy if exists "Parents withdraw own pending enrollments" on enrollments;

-- 2. Make the old cancel function use the new logic, so existing buttons keep working
create or replace function parent_cancel_enrollment(p_enrollment_id integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  perform parent_withdraw_enrollment(p_enrollment_id, 'other', 'Cancelled by parent');
end;
$$;