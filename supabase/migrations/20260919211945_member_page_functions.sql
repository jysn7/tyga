alter table members add column if not exists school_name text;
alter table members add column if not exists school_grade text;
alter table members add column if not exists id_or_birth_cert_number text;
alter table members add column if not exists kit_size_top text;
alter table members add column if not exists kit_size_bottom text;
alter table members add column if not exists shoe_size text;
alter table members add column if not exists previous_club text;
alter table members add column if not exists medical_aid_details text;
alter table members add column if not exists doctor_contact text;
alter table members add column if not exists emergency_contact_name text;
alter table members add column if not exists emergency_contact_relationship text;
alter table members add column if not exists emergency_contact_phone text;
alter table members add column if not exists onboarding_complete boolean not null default false;

drop function if exists get_my_members_with_details(int);

create or replace function get_my_members_with_details(p_member_id int default null)
returns table (
  id int, full_name text, dob date, gender text,
  school_name text, school_grade text, id_or_birth_cert_number text,
  kit_size_top text, kit_size_bottom text, shoe_size text, previous_club text,
  medical_notes text, medical_aid_details text, doctor_contact text,
  emergency_contact_name text, emergency_contact_relationship text, emergency_contact_phone text,
  current_level_name text, next_session_label text, active_enrollment_count bigint,
  onboarding_complete boolean
)
language sql
security definer set search_path = public
stable
as $$
  select
    m.id, m.full_name, m.dob, m.gender,
    m.school_name, m.school_grade, m.id_or_birth_cert_number,
    m.kit_size_top, m.kit_size_bottom, m.shoe_size, m.previous_club,
    m.medical_notes, m.medical_aid_details, m.doctor_contact,
    m.emergency_contact_name, m.emergency_contact_relationship, m.emergency_contact_phone,
    l.name,
    (
      select ps.session_date || ' ' || ps.start_time
      from enrollments e
      join programme_sessions ps on ps.programme_id = e.programme_id
      where e.member_id = m.id and e.status = 'active'
        and ps.session_date >= current_date and ps.status = 'scheduled'
      order by ps.session_date, ps.start_time
      limit 1
    ),
    coalesce((select count(*) from enrollments e where e.member_id = m.id and e.status = 'active'), 0),
    m.onboarding_complete
  from members m
  left join levels l on l.id = m.current_level_id
  where m.account_id = auth.uid()
    and (p_member_id is null or m.id = p_member_id)
  order by m.created_at desc;
$$;

grant execute on function get_my_members_with_details(int) to authenticated;


drop function if exists get_member_programmes(int);

create or replace function get_member_programmes(p_member_id int)
returns table (
  enrollment_id int, programme_id int, programme_name text, venue_name text,
  status text, joined_at date,
  next_session jsonb, recent_sessions jsonb
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  if not exists (select 1 from members where id = p_member_id and account_id = auth.uid()) then
    raise exception 'Member not found or access denied';
  end if;

  return query
  select
    e.id, e.programme_id, p.name, v.name,
    e.status, e.joined_at,
    (
      select jsonb_build_object('date', ps.session_date, 'startTime', ps.start_time, 'endTime', ps.end_time)
      from programme_sessions ps
      where ps.programme_id = e.programme_id
        and ps.session_date >= current_date and ps.status = 'scheduled'
      order by ps.session_date, ps.start_time
      limit 1
    ),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'date', ps.session_date, 'status', a.status
      ) order by ps.session_date desc)
      from attendance a
      join programme_sessions ps on ps.id = a.session_id
      where a.member_id = p_member_id and ps.programme_id = e.programme_id
      limit 5
    ), '[]'::jsonb)
  from enrollments e
  join programmes p on p.id = e.programme_id
  left join venues v on v.id = p.venue_id
  where e.member_id = p_member_id
  order by e.joined_at desc;
end;
$$;

drop function if exists get_member_progression(int);

create or replace function get_member_progression(p_member_id int)
returns table (
  current_level_id int, current_level_name text, current_level_goal text, current_level_focus text,
  latest_badge_complete boolean, latest_progression_notes text, latest_progression_date date,
  modules_covered jsonb,
  next_level_id int, next_level_name text, next_level_goal text
)
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_member members%rowtype;
  v_current_sort_order int;
begin
  select * into v_member from members where id = p_member_id and account_id = auth.uid();
  if not found then
    raise exception 'Member not found or access denied';
  end if;

  select sort_order into v_current_sort_order from levels where id = v_member.current_level_id;

  return query
  select
    l.id, l.name, l.goal, l.focus_summary,
    lp.badge_complete, lp.notes, lp.date,
    coalesce((
      select jsonb_agg(distinct jsonb_build_object('id', cm.id, 'name', cm.name, 'category', cm.category))
      from attendance a
      join programme_sessions ps on ps.id = a.session_id
      join session_curriculum_modules scm on scm.session_id = ps.id
      join curriculum_modules cm on cm.id = scm.curriculum_module_id
      where a.member_id = p_member_id and a.status = 'present'
    ), '[]'::jsonb),
    nl.id, nl.name, nl.goal
  from members m
  left join levels l on l.id = m.current_level_id
  left join lateral (
    select * from level_progressions
    where member_id = p_member_id
    order by date desc
    limit 1
  ) lp on true
  left join levels nl on nl.sort_order = v_current_sort_order + 1
  where m.id = p_member_id;
end;
$$;

grant execute on function get_member_progression(int) to authenticated;

grant execute on function get_member_programmes(int) to authenticated;