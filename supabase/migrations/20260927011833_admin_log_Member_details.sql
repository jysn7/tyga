drop function if exists admin_get_member_detail(int);
drop function if exists admin_log_sensitive_access(int, text[], text);

-- Log sensitive access for one or more fields in a single call
create or replace function admin_log_sensitive_access(
  p_member_id int,
  p_fields text[],
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_field text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  perform assert_is_admin();

  if p_member_id is null then
    raise exception 'member_id is required';
  end if;

  if p_fields is null or array_length(p_fields, 1) is null then
    raise exception 'At least one field is required';
  end if;

  if p_reason is null or length(trim(p_reason)) < 3 then
    raise exception 'A reason is required (minimum 3 characters)';
  end if;

  foreach v_field in array p_fields loop
    if v_field not in ('medical_notes', 'dob', 'emergency_contact') then
      raise exception 'Invalid field: %', v_field;
    end if;

    insert into sensitive_data_access_log (
      user_id, member_id, field_accessed, reason
    ) values (
      v_uid, p_member_id, v_field, trim(p_reason)
    );
  end loop;
end;
$$;

-- Fetch everything for the member (no logging here — the frontend gates it)
create or replace function admin_get_member_detail(p_member_id int)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_result jsonb;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  perform assert_is_admin();

  select jsonb_build_object(
    'member', to_jsonb(m.*),
    'account', (select to_jsonb(a.*) from accounts a where a.id = m.account_id),
    'level', (select to_jsonb(l.*) from levels l where l.id = m.current_level_id),
    'questionnaire', (
      select to_jsonb(q.*) from member_questionnaires q where q.member_id = m.id limit 1
    ),
    'consents', (
      select coalesce(jsonb_agg(to_jsonb(c.*) order by c.consent_type), '[]'::jsonb)
      from consents c where c.member_id = m.id
    ),
    'documents', (
      select coalesce(jsonb_agg(to_jsonb(d.*) order by d.uploaded_at desc), '[]'::jsonb)
      from documents d where d.member_id = m.id
    ),
    'enrollments', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'status', e.status,
          'programme_id', e.programme_id,
          'programme_name', p.name,
          'venue_name', v.name,
          'joined_at', e.created_at
        ) order by e.created_at desc
      ), '[]'::jsonb)
      from enrollments e
      left join programmes p on p.id = e.programme_id
      left join venues v on v.id = p.venue_id
      where e.member_id = m.id
    ),
    'progressions', (
      select coalesce(jsonb_agg(to_jsonb(lp.*) order by lp.created_at desc), '[]'::jsonb)
      from level_progressions lp where lp.member_id = m.id
    ),
    'attendance_summary', (
      select jsonb_build_object(
        'total', count(*),
        'present', count(*) filter (where att.status = 'present'),
        'absent', count(*) filter (where att.status = 'absent'),
        'late', count(*) filter (where att.status = 'late'),
        'excused', count(*) filter (where att.status = 'excused')
      )
      from attendance att where att.member_id = m.id
    ),
    'sensitive_access_history', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', sl.id,
          'field', sl.field_accessed,
          'reason', sl.reason,
          'accessed_at', sl.accessed_at,
          'user_name', actor.full_name,
          'user_email', actor.email
        ) order by sl.accessed_at desc
      ), '[]'::jsonb)
      from (
        select * from sensitive_data_access_log
        where member_id = m.id
        order by accessed_at desc
        limit 30
      ) sl
      left join accounts actor on actor.id = sl.user_id
    )
  )
  into v_result
  from members m
  where m.id = p_member_id;

  if v_result is null then
    raise exception 'Member not found';
  end if;

  return v_result;
end;
$$;

grant execute on function admin_get_member_detail(int) to authenticated;
grant execute on function admin_log_sensitive_access(int, text[], text) to authenticated;