-- ============================================================
-- Tables (no policies on purpose: only the functions below touch them)
-- ============================================================
create table if not exists conversations (
  id                   bigint generated always as identity primary key,
  kind                 text not null check (kind in ('ticket', 'direct')),
  subject              text not null check (char_length(subject) between 3 and 150),
  category             text check (category in ('payment','enrolment','schedule','account','technical','safeguarding','feedback','other')),
  status               text not null default 'open' check (status in ('open', 'waiting', 'resolved', 'closed')),
  priority             text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  source               text not null default 'portal' check (source in ('portal', 'public_form')),
  assigned_to          uuid references accounts(id) on delete set null,
  requester_account_id uuid references accounts(id) on delete set null,
  requester_name       text,
  requester_email      text,
  requester_phone      text,
  member_id            int references members(id) on delete set null,
  programme_id         int references programmes(id) on delete set null,
  ip_hash              text,
  created_at           timestamptz not null default now(),
  last_message_at      timestamptz not null default now(),
  last_sender_role     text,
  first_response_at    timestamptz,
  resolved_at          timestamptz,
  rating               int check (rating between 1 and 5),
  rating_comment       text,
  constraint ticket_needs_category check (kind <> 'ticket' or category is not null)
);

create table if not exists conversation_participants (
  conversation_id bigint not null references conversations(id) on delete cascade,
  account_id      uuid   not null references accounts(id) on delete cascade,
  role            text   not null check (role in ('requester', 'parent', 'coach')),
  last_read_at    timestamptz,
  primary key (conversation_id, account_id)
);

create table if not exists messages (
  id                bigint generated always as identity primary key,
  conversation_id   bigint not null references conversations(id) on delete cascade,
  sender_account_id uuid references accounts(id) on delete set null,
  sender_name       text,
  sender_role       text not null check (sender_role in ('requester', 'parent', 'coach', 'admin', 'system')),
  kind              text not null default 'message' check (kind in ('message', 'internal', 'system')),
  body              text not null check (char_length(body) between 1 and 4000),
  created_at        timestamptz not null default now()
);

create index if not exists idx_messages_conv        on messages (conversation_id, id);
create index if not exists idx_messages_sender_time on messages (sender_account_id, created_at desc);
create index if not exists idx_conv_inbox           on conversations (kind, status, last_message_at desc);
create index if not exists idx_conv_requester       on conversations (requester_account_id);
create index if not exists idx_conv_email_time      on conversations (lower(requester_email), created_at desc);
create index if not exists idx_conv_ip_time         on conversations (ip_hash, created_at desc);
create index if not exists idx_participants_account on conversation_participants (account_id);

alter table conversations             enable row level security;
alter table conversation_participants enable row level security;
alter table messages                  enable row level security;

-- ============================================================
-- Helpers (not callable by users)
-- ============================================================
create or replace function support_display_name(p_account uuid)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(nullif(trim(full_name), ''), email, 'Someone') from accounts where id = p_account;
$$;

-- A parent may message a coach only while one of their children is ACTIVELY in a programme that coach teaches
create or replace function support_can_message(p_parent uuid, p_coach uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1
    from members m
    join enrollments e on e.member_id = m.id and e.status = 'active'
    join programme_coaches pc on pc.programme_id = e.programme_id
    join coaches c on c.id = pc.coach_id
    join accounts ap on ap.id = m.account_id and ap.active
    join accounts ac on ac.id = c.account_id and ac.active
    where m.account_id = p_parent and c.account_id = p_coach and m.archived_at is null
  );
$$;

create or replace function support_system_message(p_conv bigint, p_body text)
returns void language sql security definer set search_path = public, pg_temp as $$
  insert into messages (conversation_id, sender_role, kind, body) values (p_conv, 'system', 'system', p_body);
$$;

create or replace function support_notify(p_account uuid, p_title text, p_body text, p_conv bigint)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform create_notification(p_account, 'message', p_title, left(p_body, 140), 'conversation', p_conv::int, 'in_app');
exception when others then
  null;   -- a notification problem never blocks a message
end; $$;

create or replace function support_notify_admins(p_assigned uuid, p_title text, p_body text, p_conv bigint)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_assigned is not null and exists (select 1 from accounts where id = p_assigned and active and role = 'admin') then
    perform create_notification(p_assigned, 'ticket', p_title, left(p_body, 140), 'conversation', p_conv::int, 'in_app');
  else
    perform send_notification_to_role('ticket', p_title, left(p_body, 140), 'admin', 'conversation', p_conv::int, 'in_app');
  end if;
exception when others then
  null;
end; $$;

create or replace function support_rate_limit(p_account uuid, p_max int, p_minutes int)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if (select count(*) from messages
      where sender_account_id = p_account and created_at > now() - make_interval(mins => p_minutes)) >= p_max then
    raise exception 'You are sending messages very quickly. Please wait a few minutes';
  end if;
end; $$;

-- ============================================================
-- Tickets: parents and coaches
-- ============================================================
create or replace function create_my_ticket(
  p_subject text, p_category text, p_body text,
  p_member_id int default null, p_programme_id int default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_acc     accounts%rowtype;
  v_subject text := trim(coalesce(p_subject, ''));
  v_body    text := trim(coalesce(p_body, ''));
  v_id      bigint;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select * into v_acc from accounts where id = v_uid;
  if not found or v_acc.anonymised_at is not null or not v_acc.active then
    raise exception 'Your account cannot send requests';
  end if;

  if p_category not in ('payment','enrolment','schedule','account','technical','safeguarding','feedback','other') then
    raise exception 'Please choose a topic';
  end if;
  if char_length(v_subject) not between 3 and 150 then raise exception 'The subject must be 3 to 150 characters'; end if;
  if char_length(v_body) not between 5 and 4000 then raise exception 'The message must be 5 to 4000 characters'; end if;

  if (select count(*) from conversations
      where kind = 'ticket' and requester_account_id = v_uid and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'You have sent several requests in the last hour. Please wait, or call us';
  end if;

  if p_member_id is not null and not parent_owns_member(p_member_id) then raise exception 'Child not found'; end if;
  if p_programme_id is not null and not exists (select 1 from programmes where id = p_programme_id) then
    raise exception 'Programme not found';
  end if;

  insert into conversations (kind, subject, category, priority, source, requester_account_id,
                             requester_name, requester_email, requester_phone, member_id, programme_id,
                             last_sender_role)
  values ('ticket', v_subject, p_category, case when p_category = 'safeguarding' then 'urgent' else 'normal' end,
          'portal', v_uid, v_acc.full_name, v_acc.email, v_acc.phone, p_member_id, p_programme_id, 'requester')
  returning id into v_id;

  insert into conversation_participants (conversation_id, account_id, role, last_read_at)
  values (v_id, v_uid, 'requester', now());

  insert into messages (conversation_id, sender_account_id, sender_name, sender_role, body)
  values (v_id, v_uid, coalesce(v_acc.full_name, v_acc.email), 'requester', v_body);

  perform support_notify_admins(null,
    case when p_category = 'safeguarding' then 'URGENT: safety or conduct concern' else 'New support request' end,
    v_subject, v_id);

  return json_build_object('id', v_id);
end;
$$;

create or replace function get_my_tickets()
returns table (id bigint, subject text, category text, status text, created_at timestamptz,
               last_message_at timestamptz, last_sender_role text, unread boolean, rating int)
language sql stable security definer set search_path = public, pg_temp as $$
  select c.id, c.subject, c.category, c.status, c.created_at, c.last_message_at, c.last_sender_role,
         (c.last_sender_role = 'admin' and c.last_message_at > coalesce(p.last_read_at, '-infinity'::timestamptz)),
         c.rating
  from conversations c
  left join conversation_participants p on p.conversation_id = c.id and p.account_id = auth.uid()
  where c.kind = 'ticket' and c.requester_account_id = auth.uid()
  order by c.last_message_at desc
  limit 100;
$$;

-- ============================================================
-- Reading a conversation (marks it read). Staff-only notes are never returned here.
-- ============================================================
create or replace function open_my_conversation(p_id bigint)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid     uuid := auth.uid();
  v_c       conversations%rowtype;
  v_role    text;
  v_other   uuid;
  v_can     boolean := true;
  v_blocked text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select * into v_c from conversations where id = p_id;
  if not found then raise exception 'Conversation not found'; end if;

  select role into v_role from conversation_participants where conversation_id = p_id and account_id = v_uid;
  if v_role is null and v_c.requester_account_id is distinct from v_uid then
    raise exception 'Conversation not found';
  end if;

  if v_c.status = 'closed' then
    v_can := false;
    v_blocked := case when v_c.kind = 'ticket' then 'This ticket is closed. Please start a new one.'
                      else 'This conversation has been closed by the academy.' end;
  elsif v_c.kind = 'direct' then
    select account_id into v_other from conversation_participants where conversation_id = p_id and account_id <> v_uid limit 1;
    if not (case when v_role = 'parent' then support_can_message(v_uid, v_other)
                 else support_can_message(v_other, v_uid) end) then
      v_can := false;
      v_blocked := 'You can no longer message this person.';
    end if;
  end if;

  update conversation_participants set last_read_at = now() where conversation_id = p_id and account_id = v_uid;

  return json_build_object(
    'id', v_c.id, 'kind', v_c.kind, 'subject', v_c.subject, 'category', v_c.category,
    'status', v_c.status, 'created_at', v_c.created_at, 'rating', v_c.rating,
    'can_reply', v_can, 'reply_blocked_reason', v_blocked,
    'other', (select json_build_object('name', coalesce(a.full_name, a.email), 'role', p.role, 'avatar_url', a.avatar_url)
              from conversation_participants p join accounts a on a.id = p.account_id
              where p.conversation_id = p_id and p.account_id <> v_uid limit 1),
    'messages', coalesce((
      select json_agg(json_build_object(
        'id', m.id, 'body', m.body, 'created_at', m.created_at, 'kind', m.kind,
        'sender_name', m.sender_name, 'sender_role', m.sender_role,
        'is_mine', m.sender_account_id = v_uid) order by m.id)
      from messages m where m.conversation_id = p_id and m.kind <> 'internal'
    ), '[]'::json)
  );
end;
$$;

-- ============================================================
-- Reply (the requester of a ticket, or either side of a direct conversation)
-- ============================================================
create or replace function reply_to_conversation(p_id bigint, p_body text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_c     conversations%rowtype;
  v_role  text;
  v_other uuid;
  v_body  text := trim(coalesce(p_body, ''));
  v_name  text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from accounts where id = v_uid and active and anonymised_at is null) then
    raise exception 'Your account cannot send messages';
  end if;

  select * into v_c from conversations where id = p_id for update;
  if not found then raise exception 'Conversation not found'; end if;

  if v_c.kind = 'ticket' then
    if v_c.requester_account_id is distinct from v_uid then raise exception 'Conversation not found'; end if;
    v_role := 'requester';
    if v_c.status = 'closed' then raise exception 'This ticket is closed. Please start a new one'; end if;
    if char_length(v_body) not between 1 and 4000 then raise exception 'The message must be 1 to 4000 characters'; end if;
  else
    select role into v_role from conversation_participants where conversation_id = p_id and account_id = v_uid;
    if v_role is null then raise exception 'Conversation not found'; end if;
    if v_c.status = 'closed' then raise exception 'This conversation has been closed by the academy'; end if;
    select account_id into v_other from conversation_participants where conversation_id = p_id and account_id <> v_uid limit 1;
    if not (case when v_role = 'parent' then support_can_message(v_uid, v_other)
                 else support_can_message(v_other, v_uid) end) then
      raise exception 'You can no longer message this person';
    end if;
    if char_length(v_body) not between 1 and 2000 then raise exception 'The message must be 1 to 2000 characters'; end if;
  end if;

  perform support_rate_limit(v_uid, 20, 10);

  v_name := support_display_name(v_uid);

  insert into messages (conversation_id, sender_account_id, sender_name, sender_role, body)
  values (p_id, v_uid, v_name, v_role, v_body);

  if v_c.kind = 'ticket' and v_c.status in ('resolved', 'waiting') then
    update conversations set status = 'open', resolved_at = null where id = p_id;
    if v_c.status = 'resolved' then perform support_system_message(p_id, 'Reopened by the requester'); end if;
  end if;

  update conversations set last_message_at = now(), last_sender_role = v_role where id = p_id;
  update conversation_participants set last_read_at = now() where conversation_id = p_id and account_id = v_uid;

  if v_c.kind = 'ticket' then
    perform support_notify_admins(v_c.assigned_to, 'Reply on a support request', v_c.subject, p_id);
  else
    perform support_notify(v_other, 'New message from ' || v_name, v_body, p_id);
  end if;

  return json_build_object('ok', true);
end;
$$;

create or replace function resolve_my_ticket(p_id bigint)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select status into v_status from conversations
  where id = p_id and kind = 'ticket' and requester_account_id = auth.uid() for update;
  if v_status is null then raise exception 'Ticket not found'; end if;
  if v_status in ('resolved', 'closed') then return; end if;

  update conversations set status = 'resolved', resolved_at = now() where id = p_id;
  perform support_system_message(p_id, 'Marked as resolved by the requester');
end; $$;

create or replace function rate_my_ticket(p_id bigint, p_rating int, p_comment text default null)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_rating not between 1 and 5 then raise exception 'Choose a rating from 1 to 5'; end if;

  update conversations
  set rating = p_rating, rating_comment = left(nullif(trim(coalesce(p_comment, '')), ''), 500)
  where id = p_id and kind = 'ticket' and requester_account_id = auth.uid()
    and status in ('resolved', 'closed') and rating is null;

  if not found then raise exception 'This ticket cannot be rated'; end if;
end; $$;

create or replace function get_my_unread_count()
returns int language sql stable security definer set search_path = public, pg_temp as $$
  select count(*)::int
  from conversations c
  join conversation_participants p on p.conversation_id = c.id and p.account_id = auth.uid()
  where c.status <> 'closed'
    and c.last_sender_role is distinct from p.role
    and c.last_message_at > coalesce(p.last_read_at, '-infinity'::timestamptz);
$$;

-- ============================================================
-- Direct messages: parent <-> coach
-- ============================================================
create or replace function get_my_message_contacts()
returns table (account_id uuid, full_name text, avatar_url text, role text, programmes text, children text)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_uid  uuid := auth.uid();
  v_role text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select a.role into v_role from accounts a where a.id = v_uid;

  if v_role = 'parent' then
    return query
    select ac.id, ac.full_name::text, ac.avatar_url::text, 'coach'::text,
           string_agg(distinct p.name, ', ')::text, string_agg(distinct m.full_name, ', ')::text
    from members m
    join enrollments e on e.member_id = m.id and e.status = 'active'
    join programmes p on p.id = e.programme_id
    join programme_coaches pc on pc.programme_id = e.programme_id
    join coaches c on c.id = pc.coach_id
    join accounts ac on ac.id = c.account_id and ac.active
    where m.account_id = v_uid and m.archived_at is null
    group by ac.id, ac.full_name, ac.avatar_url
    order by ac.full_name;
  elsif v_role = 'coach' then
    return query
    select ap.id, ap.full_name::text, ap.avatar_url::text, 'parent'::text,
           string_agg(distinct p.name, ', ')::text, string_agg(distinct m.full_name, ', ')::text
    from coaches c
    join programme_coaches pc on pc.coach_id = c.id
    join enrollments e on e.programme_id = pc.programme_id and e.status = 'active'
    join programmes p on p.id = e.programme_id
    join members m on m.id = e.member_id and m.archived_at is null
    join accounts ap on ap.id = m.account_id and ap.active
    where c.account_id = v_uid
    group by ap.id, ap.full_name, ap.avatar_url
    order by ap.full_name;
  end if;
end;
$$;

create or replace function start_direct_conversation(p_other uuid, p_body text, p_member_id int default null)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_role  text;
  v_conv  bigint;
  v_status text;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;
  select role into v_role from accounts where id = v_uid and active and anonymised_at is null;
  if v_role not in ('parent', 'coach') then raise exception 'Messaging is for parents and coaches'; end if;
  if p_other is null or p_other = v_uid then raise exception 'Choose who to message'; end if;

  if not (case when v_role = 'parent' then support_can_message(v_uid, p_other)
               else support_can_message(p_other, v_uid) end) then
    raise exception 'You can only message a coach or parent connected through an active programme';
  end if;

  select c.id, c.status into v_conv, v_status
  from conversations c
  join conversation_participants a on a.conversation_id = c.id and a.account_id = v_uid
  join conversation_participants b on b.conversation_id = c.id and b.account_id = p_other
  where c.kind = 'direct'
  limit 1;

  if v_conv is not null and v_status = 'closed' then
    raise exception 'This conversation was closed by the academy. Please contact the academy';
  end if;

  if v_conv is null then
    insert into conversations (kind, subject, source, requester_account_id, member_id)
    values ('direct', 'Direct message', 'portal', v_uid,
            case when p_member_id is not null and v_role = 'parent' and parent_owns_member(p_member_id) then p_member_id end)
    returning id into v_conv;

    insert into conversation_participants (conversation_id, account_id, role, last_read_at) values
      (v_conv, v_uid, v_role, now()),
      (v_conv, p_other, case when v_role = 'parent' then 'coach' else 'parent' end, null);
  end if;

  perform reply_to_conversation(v_conv, p_body);
  return json_build_object('id', v_conv);
end;
$$;

create or replace function get_my_direct_conversations()
returns table (id bigint, other_account_id uuid, other_name text, other_avatar text, other_role text,
               last_message text, last_message_at timestamptz, unread boolean, status text, children text)
language sql stable security definer set search_path = public, pg_temp as $$
  select c.id, o.account_id, coalesce(a.full_name, a.email), a.avatar_url, o.role,
         (select left(m.body, 120) from messages m where m.conversation_id = c.id and m.kind <> 'internal' order by m.id desc limit 1),
         c.last_message_at,
         (c.last_sender_role is distinct from me.role and c.last_message_at > coalesce(me.last_read_at, '-infinity'::timestamptz)),
         c.status,
         (select string_agg(distinct mb.full_name, ', ')
            from members mb where mb.account_id = (case when me.role = 'parent' then me.account_id else o.account_id end)
              and mb.archived_at is null)
  from conversations c
  join conversation_participants me on me.conversation_id = c.id and me.account_id = auth.uid()
  join conversation_participants o  on o.conversation_id  = c.id and o.account_id <> auth.uid()
  join accounts a on a.id = o.account_id
  where c.kind = 'direct'
  order by c.last_message_at desc
  limit 100;
$$;

-- ============================================================
-- Public contact form (service role only: the server action calls this)
-- ============================================================
create or replace function public_create_ticket(
  p_name text, p_email text, p_phone text, p_category text,
  p_subject text, p_body text, p_ip_hash text
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name    text := left(trim(coalesce(p_name, '')), 100);
  v_email   text := lower(trim(coalesce(p_email, '')));
  v_phone   text := nullif(left(trim(coalesce(p_phone, '')), 30), '');
  v_subject text := trim(coalesce(p_subject, ''));
  v_body    text := trim(coalesce(p_body, ''));
  v_id      bigint;
begin
  if char_length(v_name) < 2 then raise exception 'Please enter your name'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email address'; end if;
  if p_category not in ('payment','enrolment','schedule','account','technical','safeguarding','feedback','other') then
    raise exception 'Please choose a topic';
  end if;
  if char_length(v_subject) not between 3 and 150 then raise exception 'The subject must be 3 to 150 characters'; end if;
  if char_length(v_body) not between 10 and 4000 then raise exception 'The message must be 10 to 4000 characters'; end if;

  if (select count(*) from conversations where lower(requester_email) = v_email
        and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'You have already sent several messages. Please wait an hour or call us';
  end if;
  if p_ip_hash is not null and (select count(*) from conversations where ip_hash = p_ip_hash
        and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many messages from this connection. Please try again later';
  end if;

  insert into conversations (kind, subject, category, priority, source, requester_name, requester_email,
                             requester_phone, ip_hash, last_sender_role)
  values ('ticket', v_subject, p_category, case when p_category = 'safeguarding' then 'urgent' else 'normal' end,
          'public_form', v_name, v_email, v_phone, p_ip_hash, 'requester')
  returning id into v_id;

  insert into messages (conversation_id, sender_name, sender_role, body)
  values (v_id, v_name, 'requester', v_body);

  perform support_notify_admins(null,
    case when p_category = 'safeguarding' then 'URGENT: safety or conduct concern' else 'New website enquiry' end,
    v_subject, v_id);

  return json_build_object('id', v_id);
end;
$$;

-- ============================================================
-- Admin: inbox
-- ============================================================
create or replace function admin_get_ticket_summary()
returns json language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  perform assert_is_admin();

  return (
    select json_build_object(
      'open',        count(*) filter (where status = 'open'),
      'waiting',     count(*) filter (where status = 'waiting'),
      'needs_reply', count(*) filter (where status in ('open', 'waiting') and last_sender_role = 'requester'),
      'unassigned',  count(*) filter (where status in ('open', 'waiting') and assigned_to is null),
      'urgent',      count(*) filter (where status in ('open', 'waiting') and priority = 'urgent'),
      'overdue',     count(*) filter (where status = 'open' and first_response_at is null
                                        and created_at < now() - interval '24 hours'),
      'resolved_7d', count(*) filter (where status in ('resolved', 'closed') and resolved_at > now() - interval '7 days'),
      'avg_first_response_hours', round((avg(extract(epoch from first_response_at - created_at) / 3600)
          filter (where first_response_at is not null and created_at > now() - interval '30 days'))::numeric, 1),
      'avg_rating',  round((avg(rating) filter (where rating is not null))::numeric, 1),
      'direct_total', (select count(*) from conversations where kind = 'direct')
    )
    from conversations where kind = 'ticket'
  );
end; $$;

create or replace function admin_get_tickets(
  p_kind text default 'ticket', p_status text default null, p_category text default null,
  p_assigned text default null,          -- 'me' | 'unassigned' | null
  p_search text default null, p_needs_reply boolean default false,
  p_limit int default 25, p_offset int default 0
)
returns table (
  id bigint, kind text, subject text, category text, status text, priority text, source text,
  requester_name text, requester_email text, assigned_to uuid, assigned_name text,
  created_at timestamptz, last_message_at timestamptz, last_sender_role text,
  preview text, needs_reply boolean, overdue boolean, total_count bigint
)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_limit   int  := least(greatest(coalesce(p_limit, 25), 1), 100);
  v_offset  int  := greatest(coalesce(p_offset, 0), 0);
  v_search  text := nullif(trim(coalesce(p_search, '')), '');
  v_pattern text;
begin
  perform assert_is_admin();

  if p_kind not in ('ticket', 'direct') then raise exception 'Invalid kind'; end if;
  if v_search is not null then
    v_pattern := '%' || replace(replace(replace(v_search, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  end if;

  return query
  select
    c.id, c.kind::text, c.subject::text, c.category::text, c.status::text, c.priority::text, c.source::text,
    (case when c.kind = 'direct'
          then (select string_agg(support_display_name(p.account_id), ' & ' order by p.role)
                from conversation_participants p where p.conversation_id = c.id)
          else coalesce(c.requester_name, support_display_name(c.requester_account_id)) end)::text,
    coalesce(c.requester_email, (select a.email from accounts a where a.id = c.requester_account_id))::text,
    c.assigned_to,
    (case when c.assigned_to is null then null else support_display_name(c.assigned_to) end)::text,
    c.created_at, c.last_message_at, c.last_sender_role::text,
    (select left(m.body, 140) from messages m where m.conversation_id = c.id and m.kind <> 'system' order by m.id desc limit 1)::text,
    (c.kind = 'ticket' and c.status in ('open', 'waiting') and c.last_sender_role = 'requester'),
    (c.kind = 'ticket' and c.status = 'open' and c.first_response_at is null
       and c.created_at < now() - interval '24 hours'),
    count(*) over()
  from conversations c
  where c.kind = p_kind
    and (p_status is null or c.status = p_status)
    and (p_category is null or c.category = p_category)
    and (p_assigned is null
         or (p_assigned = 'me' and c.assigned_to = auth.uid())
         or (p_assigned = 'unassigned' and c.assigned_to is null))
    and (not p_needs_reply
         or (c.kind = 'ticket' and c.status in ('open', 'waiting') and c.last_sender_role = 'requester'))
    and (v_pattern is null
         or c.subject ilike v_pattern or c.requester_name ilike v_pattern or c.requester_email ilike v_pattern
         or exists (select 1 from accounts a where a.id = c.requester_account_id
                      and (a.full_name ilike v_pattern or a.email ilike v_pattern))
         or c.id::text = v_search)
  order by (c.status in ('resolved', 'closed')),
           case c.priority when 'urgent' then 0 when 'high' then 1 else 2 end,
           c.last_message_at desc
  limit v_limit offset v_offset;
end;
$$;

create or replace function admin_get_conversation(p_id bigint)
returns json language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_result json;
begin
  perform assert_is_admin();

  select json_build_object(
    'id', c.id, 'kind', c.kind, 'subject', c.subject, 'category', c.category, 'status', c.status,
    'priority', c.priority, 'source', c.source, 'created_at', c.created_at,
    'first_response_at', c.first_response_at, 'resolved_at', c.resolved_at,
    'rating', c.rating, 'rating_comment', c.rating_comment,
    'assigned_to', c.assigned_to,
    'requester', json_build_object(
      'account_id', c.requester_account_id,
      'name', coalesce(c.requester_name, support_display_name(c.requester_account_id)),
      'email', coalesce(c.requester_email, (select a.email from accounts a where a.id = c.requester_account_id)),
      'phone', coalesce(c.requester_phone, (select a.phone from accounts a where a.id = c.requester_account_id))),
    'member', (select json_build_object('id', m.id, 'name', m.full_name) from members m where m.id = c.member_id),
    'programme', (select json_build_object('id', p.id, 'name', p.name) from programmes p where p.id = c.programme_id),
    'participants', coalesce((select json_agg(json_build_object(
        'account_id', pp.account_id, 'name', support_display_name(pp.account_id), 'role', pp.role))
        from conversation_participants pp where pp.conversation_id = c.id), '[]'::json),
    'messages', coalesce((select json_agg(json_build_object(
        'id', m.id, 'body', m.body, 'created_at', m.created_at, 'kind', m.kind,
        'sender_name', m.sender_name, 'sender_role', m.sender_role,
        'is_mine', m.sender_account_id = auth.uid()) order by m.id)
        from messages m where m.conversation_id = c.id), '[]'::json)
  ) into v_result
  from conversations c where c.id = p_id;

  if v_result is null then raise exception 'Conversation not found'; end if;
  return v_result;
end; $$;

create or replace function admin_reply_conversation(
  p_id bigint, p_body text, p_internal boolean default false, p_resolve boolean default false
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_c    conversations%rowtype;
  v_body text := trim(coalesce(p_body, ''));
  v_name text;
  v_mail text;
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  select * into v_c from conversations where id = p_id for update;
  if not found then raise exception 'Conversation not found'; end if;
  if char_length(v_body) not between 1 and 4000 then raise exception 'The message must be 1 to 4000 characters'; end if;

  v_name := support_display_name(auth.uid());

  if p_internal then
    insert into messages (conversation_id, sender_account_id, sender_name, sender_role, kind, body)
    values (p_id, auth.uid(), v_name, 'admin', 'internal', v_body);
    return json_build_object('ok', true, 'notify_email', null);
  end if;

  if v_c.kind <> 'ticket' then raise exception 'Admins can only add private notes to direct conversations'; end if;
  if v_c.status = 'closed' then raise exception 'This ticket is closed'; end if;

  insert into messages (conversation_id, sender_account_id, sender_name, sender_role, body)
  values (p_id, auth.uid(), v_name, 'admin', v_body);

  update conversations
  set last_message_at = now(), last_sender_role = 'admin',
      first_response_at = coalesce(first_response_at, now()),
      assigned_to = coalesce(assigned_to, auth.uid()),
      status = case when p_resolve then 'resolved' else 'waiting' end,
      resolved_at = case when p_resolve then now() else null end
  where id = p_id;

  if p_resolve then perform support_system_message(p_id, 'Marked as resolved by ' || v_name); end if;

  if v_c.requester_account_id is not null then
    update conversation_participants set last_read_at = last_read_at
    where conversation_id = p_id;                       -- (no change; unread is derived from last_message_at)
    perform support_notify(v_c.requester_account_id, 'The academy replied', v_c.subject || ': ' || v_body, p_id);
  else
    v_mail := v_c.requester_email;                      -- anonymous: the server action sends an email
  end if;

  return json_build_object('ok', true, 'notify_email', v_mail, 'requester_name', v_c.requester_name,
                           'subject', v_c.subject, 'ticket_id', p_id);
end;
$$;

create or replace function admin_update_ticket(p_id bigint, p_patch jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_c    conversations%rowtype;
  v_name text;
  v_new  text;
begin
  perform assert_is_admin();
  perform assert_recent_mfa();

  select * into v_c from conversations where id = p_id for update;
  if not found then raise exception 'Conversation not found'; end if;
  v_name := support_display_name(auth.uid());

  if p_patch ? 'status' then
    v_new := p_patch ->> 'status';
    if v_new not in ('open', 'waiting', 'resolved', 'closed') then raise exception 'Invalid status'; end if;
    if v_new <> v_c.status then
      update conversations set status = v_new,
        resolved_at = case when v_new in ('resolved', 'closed') then coalesce(resolved_at, now()) else null end
      where id = p_id;
      perform support_system_message(p_id, 'Status changed from ' || v_c.status || ' to ' || v_new || ' by ' || v_name);
    end if;
  end if;

  if v_c.kind = 'ticket' then
    if p_patch ? 'priority' then
      if (p_patch ->> 'priority') not in ('low', 'normal', 'high', 'urgent') then raise exception 'Invalid priority'; end if;
      update conversations set priority = p_patch ->> 'priority' where id = p_id;
    end if;
    if p_patch ? 'category' then
      if (p_patch ->> 'category') not in ('payment','enrolment','schedule','account','technical','safeguarding','feedback','other') then
        raise exception 'Invalid category';
      end if;
      update conversations set category = p_patch ->> 'category' where id = p_id;
    end if;
    if p_patch ? 'assigned_to' then
      if nullif(p_patch ->> 'assigned_to', '') is not null
         and not exists (select 1 from accounts where id = (p_patch ->> 'assigned_to')::uuid and role = 'admin' and active) then
        raise exception 'Assign tickets to an active administrator';
      end if;
      update conversations set assigned_to = nullif(p_patch ->> 'assigned_to', '')::uuid where id = p_id;
      perform support_system_message(p_id,
        case when nullif(p_patch ->> 'assigned_to', '') is null then 'Unassigned by ' || v_name
             else 'Assigned to ' || support_display_name((p_patch ->> 'assigned_to')::uuid) || ' by ' || v_name end);
    end if;
  end if;
end;
$$;

-- ============================================================
-- Grants
-- ============================================================
revoke execute on function support_display_name(uuid), support_can_message(uuid, uuid),
  support_system_message(bigint, text), support_notify(uuid, text, text, bigint),
  support_notify_admins(uuid, text, text, bigint), support_rate_limit(uuid, int, int)
  from public, anon, authenticated;

revoke execute on function public_create_ticket(text, text, text, text, text, text, text) from public, anon, authenticated;
grant  execute on function public_create_ticket(text, text, text, text, text, text, text) to service_role;

revoke execute on function create_my_ticket(text, text, text, int, int), get_my_tickets(), open_my_conversation(bigint),
  reply_to_conversation(bigint, text), resolve_my_ticket(bigint), rate_my_ticket(bigint, int, text),
  get_my_unread_count(), get_my_message_contacts(), start_direct_conversation(uuid, text, int),
  get_my_direct_conversations(), admin_get_ticket_summary(),
  admin_get_tickets(text, text, text, text, text, boolean, int, int), admin_get_conversation(bigint),
  admin_reply_conversation(bigint, text, boolean, boolean), admin_update_ticket(bigint, jsonb)
  from public, anon;

grant execute on function create_my_ticket(text, text, text, int, int), get_my_tickets(), open_my_conversation(bigint),
  reply_to_conversation(bigint, text), resolve_my_ticket(bigint), rate_my_ticket(bigint, int, text),
  get_my_unread_count(), get_my_message_contacts(), start_direct_conversation(uuid, text, int),
  get_my_direct_conversations(), admin_get_ticket_summary(),
  admin_get_tickets(text, text, text, text, text, boolean, int, int), admin_get_conversation(bigint),
  admin_reply_conversation(bigint, text, boolean, boolean), admin_update_ticket(bigint, jsonb)
  to authenticated;