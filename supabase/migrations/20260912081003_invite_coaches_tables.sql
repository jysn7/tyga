-- ============================================================
-- Admin: Coach Invites
-- Assumes admin-shared-functions.sql has been run (assert_is_admin()).
--
-- ASSUMPTION — I don't have your handle_new_user() trigger function, only
-- your comment that it "always hardcodes 'parent'" on signup. See the
-- integration note at the bottom — this table alone does NOT make an
-- invited user become a coach on signup; handle_new_user() needs a small
-- change too, which I can't write blind.
-- ============================================================

create table if not exists coach_invites (
  id serial primary key,
  email text not null,
  coach_type text check (coach_type in ('head_coach', 'assistant_coach', 'volunteer')),
  max_student_ratio int,
  invited_by uuid references accounts(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists idx_coach_invites_email on coach_invites (email);
create index if not exists idx_coach_invites_status on coach_invites (status);

create or replace function admin_get_coach_invites(p_status text default 'pending')
returns table (
  id int,
  email text,
  coach_type text,
  max_student_ratio int,
  invited_by_name text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select ci.id, ci.email, ci.coach_type, ci.max_student_ratio,
         a.full_name as invited_by_name, ci.status, ci.created_at
  from coach_invites ci
  left join accounts a on a.id = ci.invited_by
  where p_status is null or ci.status = p_status
  order by ci.created_at desc;
end;
$$;

-- Records the invite. Does NOT send the email — that requires
-- supabase.auth.admin.inviteUserByEmail(), which needs the service-role
-- key and must run server-side (Route Handler), never in a client RPC.
create or replace function admin_record_coach_invite(
  p_email text,
  p_coach_type text default null,
  p_max_student_ratio int default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite_id int;
  v_admin_id uuid;
begin
  v_admin_id := assert_is_admin();

  if p_coach_type is not null and p_coach_type not in ('head_coach', 'assistant_coach', 'volunteer') then
    raise exception 'Invalid coach_type: %', p_coach_type;
  end if;

  if exists (select 1 from coach_invites where email = p_email and status = 'pending') then
    raise exception 'An invite is already pending for %', p_email;
  end if;

  if exists (select 1 from accounts where email = p_email) then
    raise exception '% already has an account', p_email;
  end if;

  insert into coach_invites (email, coach_type, max_student_ratio, invited_by)
  values (p_email, p_coach_type, p_max_student_ratio, v_admin_id)
  returning id into v_invite_id;

  return v_invite_id;
end;
$$;

create or replace function admin_revoke_coach_invite(p_invite_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update coach_invites set status = 'revoked' where id = p_invite_id and status = 'pending';
end;
$$;

grant execute on function admin_get_coach_invites(text) to authenticated;
grant execute on function admin_record_coach_invite(text, text, int) to authenticated;
grant execute on function admin_revoke_coach_invite(int) to authenticated;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite coach_invites%rowtype;
  v_coach_id int;
begin
  -- Check for a pending coach invite matching this email BEFORE inserting
  -- the account, so we know whether to set role = 'parent' (default) or
  -- 'coach' (invited) in the same insert, rather than inserting then
  -- updating right after.
  select * into v_invite
  from coach_invites
  where email = new.email and status = 'pending'
  order by created_at desc
  limit 1;

  insert into accounts (id, role, full_name, email)
  values (
    new.id,
    case when v_invite.id is not null then 'coach' else 'parent' end,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );

  -- If this signup fulfills a pending coach invite, create the coaches
  -- row (same shape as admin_create_coach) and mark the invite accepted.
  if v_invite.id is not null then
    insert into coaches (account_id, coach_type, max_student_ratio)
    values (new.id, v_invite.coach_type, v_invite.max_student_ratio)
    returning id into v_coach_id;

    update coach_invites
    set status = 'accepted', accepted_at = now()
    where id = v_invite.id;
  end if;

  return new;
end;
$$;