-- ============================================================
-- Marketing Site Admin — full migration
-- Adds: events publish workflow, marketing_programmes,
--       team_members, gallery_images, site_content
-- Depends on: accounts, programmes, venues, coaches, events,
--             audit_log, assert_is_admin()
-- ============================================================


-- ============================================================
-- 1. EXTEND EVENTS
-- ============================================================

alter table events
  add column if not exists visibility    text not null default 'draft'
    check (visibility in ('draft', 'published', 'archived')),
  add column if not exists published_at  timestamptz,
  add column if not exists sort_order    int not null default 0,
  add column if not exists updated_at    timestamptz not null default now(),
  add column if not exists updated_by    uuid references accounts(id);


-- ============================================================
-- 2. MARKETING PROGRAMMES
-- ============================================================

create table if not exists marketing_programmes (
  id                 serial primary key,
  programme_id       int references programmes(id) on delete set null,
  display_title      text not null,
  eyebrow            text,
  summary            text,
  description        text,
  bullets            jsonb not null default '[]'::jsonb,
  image_url          text,
  cta_label          text not null default 'Enrol',
  cta_url            text,
  price_override     numeric(10,2),
  sort_order         int not null default 0,
  visibility         text not null default 'draft'
    check (visibility in ('draft', 'published', 'archived')),
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  updated_by         uuid references accounts(id)
);


-- ============================================================
-- 3. TEAM MEMBERS
-- ============================================================

create table if not exists team_members (
  id             serial primary key,
  display_name   text not null,
  role_title     text not null,
  bio            text,
  portrait_url   text,
  coach_id       int references coaches(id) on delete set null,
  sort_order     int not null default 0,
  visibility     text not null default 'draft'
    check (visibility in ('draft', 'published', 'archived')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references accounts(id)
);


-- ============================================================
-- 4. GALLERY IMAGES
-- ============================================================

create table if not exists gallery_images (
  id            serial primary key,
  image_url     text not null,
  alt_text      text not null default '',
  category      text not null
    check (category in ('on_course', 'coaching', 'tournaments', 'academy_life')),
  caption       text,
  sort_order    int not null default 0,
  visibility    text not null default 'draft'
    check (visibility in ('draft', 'published', 'archived')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references accounts(id)
);

alter table gallery_images
  drop constraint if exists gallery_images_alt_text_required;

alter table gallery_images
  add constraint gallery_images_alt_text_required
  check (visibility = 'draft' or length(trim(alt_text)) > 0);


-- ============================================================
-- 5. SITE CONTENT (single row)
-- ============================================================

create table if not exists site_content (
  id                    int primary key default 1,
  hero_eyebrow          text,
  hero_heading          text,
  hero_summary          text,
  hero_cta_label        text,
  hero_cta_url          text,
  homepage_intro        text,
  marketing_statements  jsonb not null default '[]'::jsonb,
  location              text,
  parent_portal_url     text,
  social_links          jsonb not null default '{}'::jsonb,
  seo_title             text,
  seo_description       text,
  updated_at            timestamptz not null default now(),
  updated_by            uuid references accounts(id),
  constraint site_content_single_row check (id = 1)
);

insert into site_content (id) values (1) on conflict (id) do nothing;


-- ============================================================
-- 6. STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('gallery-images', 'gallery-images', true)
on conflict (id) do nothing;


-- ============================================================
-- 7. TRIGGER FUNCTIONS
-- ============================================================

create or replace function touch_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create or replace function log_content_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor_id   uuid := auth.uid();
  v_actor_name text;
  v_actor_role text;
begin
  if v_actor_id is not null then
    select full_name, role into v_actor_name, v_actor_role
    from accounts where id = v_actor_id;
  end if;

  insert into audit_log (
    actor_id, actor_name, actor_role, action,
    table_name, record_id, new_data, old_data
  )
  values (
    v_actor_id, v_actor_name, v_actor_role,
    lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id)::text,
    case when tg_op <> 'DELETE' then to_jsonb(new) else null end,
    case when tg_op <> 'INSERT' then to_jsonb(old) else null end
  );

  return coalesce(new, old);
end;
$$;


-- ============================================================
-- 8. ATTACH TRIGGERS
-- ============================================================

drop trigger if exists touch_events on events;
create trigger touch_events
  before update on events
  for each row execute function touch_updated_at();

drop trigger if exists touch_marketing_programmes on marketing_programmes;
create trigger touch_marketing_programmes
  before update on marketing_programmes
  for each row execute function touch_updated_at();

drop trigger if exists touch_team_members on team_members;
create trigger touch_team_members
  before update on team_members
  for each row execute function touch_updated_at();

drop trigger if exists touch_gallery_images on gallery_images;
create trigger touch_gallery_images
  before update on gallery_images
  for each row execute function touch_updated_at();

drop trigger if exists touch_site_content on site_content;
create trigger touch_site_content
  before update on site_content
  for each row execute function touch_updated_at();


drop trigger if exists audit_events on events;
create trigger audit_events
  after insert or update or delete on events
  for each row execute function log_content_change();

drop trigger if exists audit_marketing_programmes on marketing_programmes;
create trigger audit_marketing_programmes
  after insert or update or delete on marketing_programmes
  for each row execute function log_content_change();

drop trigger if exists audit_team_members on team_members;
create trigger audit_team_members
  after insert or update or delete on team_members
  for each row execute function log_content_change();

drop trigger if exists audit_gallery_images on gallery_images;
create trigger audit_gallery_images
  after insert or update or delete on gallery_images
  for each row execute function log_content_change();

drop trigger if exists audit_site_content on site_content;
create trigger audit_site_content
  after update on site_content
  for each row execute function log_content_change();


-- ============================================================
-- 9. PUBLIC READ FUNCTIONS
-- ============================================================

create or replace function get_upcoming_events(p_limit int default 10)
returns table (
  id            int,
  name          text,
  type          text,
  event_date    date,
  start_time    time,
  description   text,
  image_url     text,
  venue_name    text,
  entry_fee     numeric,
  capacity      int
)
language sql
security definer set search_path = public
stable
as $$
  select
    e.id, e.name, e.type, e.event_date, e.start_time,
    e.description, e.image_url, v.name,
    e.entry_fee, e.capacity
  from events e
  left join venues v on v.id = e.venue_id
  where e.visibility = 'published'
    and e.event_date >= current_date
  order by e.event_date asc, e.start_time asc
  limit p_limit;
$$;

grant execute on function get_upcoming_events(int) to anon, authenticated;


create or replace function get_marketing_programmes()
returns table (
  id                 int,
  programme_id       int,
  display_title      text,
  eyebrow            text,
  summary            text,
  description        text,
  bullets            jsonb,
  image_url          text,
  cta_label          text,
  cta_url            text,
  price              numeric,
  min_age            int,
  max_age            int,
  gender_restriction text,
  venue_name         text,
  sort_order         int
)
language sql
security definer set search_path = public
stable
as $$
  select
    mp.id,
    mp.programme_id,
    mp.display_title,
    mp.eyebrow,
    mp.summary,
    mp.description,
    mp.bullets,
    coalesce(mp.image_url, p.image_url),
    mp.cta_label,
    coalesce(mp.cta_url, '/programmes/' || mp.programme_id),
    coalesce(mp.price_override, p.price),
    p.min_age,
    p.max_age,
    p.gender_restriction,
    v.name,
    mp.sort_order
  from marketing_programmes mp
  left join programmes p on p.id = mp.programme_id
  left join venues v on v.id = p.venue_id
  where mp.visibility = 'published'
  order by mp.sort_order asc;
$$;

grant execute on function get_marketing_programmes() to anon, authenticated;


create or replace function get_published_team_members()
returns table (
  id            int,
  display_name  text,
  role_title    text,
  bio           text,
  portrait_url  text,
  sort_order    int
)
language sql
security definer set search_path = public
stable
as $$
  select
    tm.id, tm.display_name, tm.role_title,
    tm.bio, tm.portrait_url, tm.sort_order
  from team_members tm
  where tm.visibility = 'published'
  order by tm.sort_order asc;
$$;

grant execute on function get_published_team_members() to anon, authenticated;


create or replace function get_published_gallery(p_category text default null)
returns table (
  id            int,
  image_url     text,
  alt_text      text,
  category      text,
  caption       text,
  sort_order    int
)
language sql
security definer set search_path = public
stable
as $$
  select
    gi.id, gi.image_url, gi.alt_text,
    gi.category, gi.caption, gi.sort_order
  from gallery_images gi
  where gi.visibility = 'published'
    and (p_category is null or gi.category = p_category)
  order by gi.sort_order asc;
$$;

grant execute on function get_published_gallery(text) to anon, authenticated;


create or replace function get_public_site_settings()
returns json
language sql
security definer set search_path = public
stable
as $$
  select json_build_object(
    'site_name',            a.site_name,
    'site_tagline',         a.site_tagline,
    'logo_url',             a.logo_url,
    'favicon_url',          a.favicon_url,
    'primary_color',        a.primary_color,
    'support_email',        a.support_email,
    'support_phone',        a.support_phone,
    'whatsapp_number',      a.whatsapp_number,
    'terms_url',            a.terms_url,
    'privacy_url',          a.privacy_url,
    'hero_eyebrow',         s.hero_eyebrow,
    'hero_heading',         s.hero_heading,
    'hero_summary',         s.hero_summary,
    'hero_cta_label',       s.hero_cta_label,
    'hero_cta_url',         s.hero_cta_url,
    'homepage_intro',       s.homepage_intro,
    'marketing_statements', s.marketing_statements,
    'location',             s.location,
    'parent_portal_url',    s.parent_portal_url,
    'social_links',         s.social_links,
    'seo_title',            s.seo_title,
    'seo_description',      s.seo_description
  )
  from app_settings a
  cross join site_content s
  where a.id = 1;
$$;

grant execute on function get_public_site_settings() to anon, authenticated;


-- ============================================================
-- 10. ADMIN READ FUNCTIONS
-- ============================================================

create or replace function admin_get_events()
returns setof events
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query
    select * from events
    order by event_date desc nulls last, start_time desc nulls last;
end;
$$;

grant execute on function admin_get_events() to authenticated;


create or replace function admin_get_marketing_programmes()
returns setof marketing_programmes
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query
    select * from marketing_programmes
    order by sort_order asc, created_at desc;
end;
$$;

grant execute on function admin_get_marketing_programmes() to authenticated;


create or replace function admin_get_team_members()
returns setof team_members
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query
    select * from team_members
    order by sort_order asc, display_name asc;
end;
$$;

grant execute on function admin_get_team_members() to authenticated;


create or replace function admin_get_gallery_images()
returns setof gallery_images
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();
  return query
    select * from gallery_images
    order by category asc, sort_order asc, created_at desc;
end;
$$;

grant execute on function admin_get_gallery_images() to authenticated;


create or replace function admin_get_site_content()
returns site_content
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_row site_content;
begin
  perform assert_is_admin();
  select * into v_row from site_content where id = 1;
  return v_row;
end;
$$;

grant execute on function admin_get_site_content() to authenticated;


-- ============================================================
-- 11. ADMIN UPSERT FUNCTIONS
-- ============================================================

create or replace function admin_upsert_event(
  p_id          int default null,
  p_name        text default null,
  p_type        text default null,
  p_venue_id    int default null,
  p_event_date  date default null,
  p_start_time  time default null,
  p_description text default null,
  p_image_url   text default null,
  p_entry_fee   numeric default null,
  p_capacity    int default null,
  p_sort_order  int default 0,
  p_visibility  text default 'draft'
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_id int;
begin
  perform assert_is_admin();

  if p_visibility not in ('draft', 'published', 'archived') then
    raise exception 'Invalid visibility: %', p_visibility;
  end if;

  if p_id is null then
    insert into events (
      name, type, venue_id, event_date, start_time, description,
      image_url, entry_fee, capacity, sort_order, visibility, published_at
    )
    values (
      p_name, p_type, p_venue_id, p_event_date, p_start_time, p_description,
      p_image_url, p_entry_fee, p_capacity, p_sort_order, p_visibility,
      case when p_visibility = 'published' then now() else null end
    )
    returning id into v_id;
  else
    update events set
      name         = coalesce(p_name, name),
      type         = coalesce(p_type, type),
      venue_id     = coalesce(p_venue_id, venue_id),
      event_date   = coalesce(p_event_date, event_date),
      start_time   = coalesce(p_start_time, start_time),
      description  = coalesce(p_description, description),
      image_url    = coalesce(p_image_url, image_url),
      entry_fee    = coalesce(p_entry_fee, entry_fee),
      capacity     = coalesce(p_capacity, capacity),
      sort_order   = coalesce(p_sort_order, sort_order),
      visibility   = p_visibility,
      published_at = case
        when p_visibility = 'published' and published_at is null then now()
        when p_visibility = 'published' then published_at
        else null
      end
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Event not found: %', p_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function admin_upsert_event(
  int, text, text, int, date, time, text, text, numeric, int, int, text
) to authenticated;


create or replace function admin_upsert_marketing_programme(
  p_id              int default null,
  p_programme_id    int default null,
  p_display_title   text default null,
  p_eyebrow         text default null,
  p_summary         text default null,
  p_description     text default null,
  p_bullets         jsonb default null,
  p_image_url       text default null,
  p_cta_label       text default null,
  p_cta_url         text default null,
  p_price_override  numeric default null,
  p_sort_order      int default 0,
  p_visibility      text default 'draft'
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_id int;
begin
  perform assert_is_admin();

  if p_visibility not in ('draft', 'published', 'archived') then
    raise exception 'Invalid visibility: %', p_visibility;
  end if;

  if p_id is null then
    insert into marketing_programmes (
      programme_id, display_title, eyebrow, summary, description,
      bullets, image_url, cta_label, cta_url, price_override,
      sort_order, visibility, published_at
    )
    values (
      p_programme_id, p_display_title, p_eyebrow, p_summary, p_description,
      coalesce(p_bullets, '[]'::jsonb), p_image_url,
      coalesce(p_cta_label, 'Enrol'), p_cta_url, p_price_override,
      p_sort_order, p_visibility,
      case when p_visibility = 'published' then now() else null end
    )
    returning id into v_id;
  else
    update marketing_programmes set
      programme_id   = coalesce(p_programme_id, programme_id),
      display_title  = coalesce(p_display_title, display_title),
      eyebrow        = coalesce(p_eyebrow, eyebrow),
      summary        = coalesce(p_summary, summary),
      description    = coalesce(p_description, description),
      bullets        = coalesce(p_bullets, bullets),
      image_url      = coalesce(p_image_url, image_url),
      cta_label      = coalesce(p_cta_label, cta_label),
      cta_url        = coalesce(p_cta_url, cta_url),
      price_override = p_price_override,
      sort_order     = coalesce(p_sort_order, sort_order),
      visibility     = p_visibility,
      published_at   = case
        when p_visibility = 'published' and published_at is null then now()
        when p_visibility = 'published' then published_at
        else null
      end
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Marketing programme not found: %', p_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function admin_upsert_marketing_programme(
  int, int, text, text, text, text, jsonb, text, text, text, numeric, int, text
) to authenticated;


create or replace function admin_upsert_team_member(
  p_id            int default null,
  p_display_name  text default null,
  p_role_title    text default null,
  p_bio           text default null,
  p_portrait_url  text default null,
  p_coach_id      int default null,
  p_sort_order    int default 0,
  p_visibility    text default 'draft'
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_id int;
begin
  perform assert_is_admin();

  if p_visibility not in ('draft', 'published', 'archived') then
    raise exception 'Invalid visibility: %', p_visibility;
  end if;

  if p_id is null then
    if p_display_name is null or p_role_title is null then
      raise exception 'display_name and role_title are required';
    end if;

    insert into team_members (
      display_name, role_title, bio, portrait_url, coach_id,
      sort_order, visibility, published_at
    )
    values (
      p_display_name, p_role_title, p_bio, p_portrait_url, p_coach_id,
      p_sort_order, p_visibility,
      case when p_visibility = 'published' then now() else null end
    )
    returning id into v_id;
  else
    update team_members set
      display_name = coalesce(p_display_name, display_name),
      role_title   = coalesce(p_role_title, role_title),
      bio          = coalesce(p_bio, bio),
      portrait_url = coalesce(p_portrait_url, portrait_url),
      coach_id     = coalesce(p_coach_id, coach_id),
      sort_order   = coalesce(p_sort_order, sort_order),
      visibility   = p_visibility,
      published_at = case
        when p_visibility = 'published' and published_at is null then now()
        when p_visibility = 'published' then published_at
        else null
      end
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Team member not found: %', p_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function admin_upsert_team_member(
  int, text, text, text, text, int, int, text
) to authenticated;


create or replace function admin_upsert_gallery_image(
  p_id          int default null,
  p_image_url   text default null,
  p_alt_text    text default null,
  p_category    text default null,
  p_caption     text default null,
  p_sort_order  int default 0,
  p_visibility  text default 'draft'
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_id int;
begin
  perform assert_is_admin();

  if p_visibility not in ('draft', 'published', 'archived') then
    raise exception 'Invalid visibility: %', p_visibility;
  end if;

  if p_category is not null
     and p_category not in ('on_course', 'coaching', 'tournaments', 'academy_life')
  then
    raise exception 'Invalid category: %', p_category;
  end if;

  if p_id is null then
    if p_image_url is null or p_category is null then
      raise exception 'image_url and category are required';
    end if;

    insert into gallery_images (
      image_url, alt_text, category, caption,
      sort_order, visibility, published_at
    )
    values (
      p_image_url, coalesce(p_alt_text, ''), p_category, p_caption,
      p_sort_order, p_visibility,
      case when p_visibility = 'published' then now() else null end
    )
    returning id into v_id;
  else
    update gallery_images set
      image_url    = coalesce(p_image_url, image_url),
      alt_text     = coalesce(p_alt_text, alt_text),
      category     = coalesce(p_category, category),
      caption      = coalesce(p_caption, caption),
      sort_order   = coalesce(p_sort_order, sort_order),
      visibility   = p_visibility,
      published_at = case
        when p_visibility = 'published' and published_at is null then now()
        when p_visibility = 'published' then published_at
        else null
      end
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Gallery image not found: %', p_id;
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function admin_upsert_gallery_image(
  int, text, text, text, text, int, text
) to authenticated;


create or replace function admin_update_site_content(
  p_hero_eyebrow          text default null,
  p_hero_heading          text default null,
  p_hero_summary          text default null,
  p_hero_cta_label        text default null,
  p_hero_cta_url          text default null,
  p_homepage_intro        text default null,
  p_marketing_statements  jsonb default null,
  p_location              text default null,
  p_parent_portal_url     text default null,
  p_social_links          jsonb default null,
  p_seo_title             text default null,
  p_seo_description       text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  update site_content set
    hero_eyebrow         = coalesce(p_hero_eyebrow, hero_eyebrow),
    hero_heading         = coalesce(p_hero_heading, hero_heading),
    hero_summary         = coalesce(p_hero_summary, hero_summary),
    hero_cta_label       = coalesce(p_hero_cta_label, hero_cta_label),
    hero_cta_url         = coalesce(p_hero_cta_url, hero_cta_url),
    homepage_intro       = coalesce(p_homepage_intro, homepage_intro),
    marketing_statements = coalesce(p_marketing_statements, marketing_statements),
    location             = coalesce(p_location, location),
    parent_portal_url    = coalesce(p_parent_portal_url, parent_portal_url),
    social_links         = coalesce(p_social_links, social_links),
    seo_title            = coalesce(p_seo_title, seo_title),
    seo_description      = coalesce(p_seo_description, seo_description)
  where id = 1;
end;
$$;

grant execute on function admin_update_site_content(
  text, text, text, text, text, text, jsonb, text, text, jsonb, text, text
) to authenticated;


-- ============================================================
-- 12. ADMIN DELETE FUNCTIONS
-- ============================================================

create or replace function admin_delete_event(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from events where id = p_id;
end;
$$;

grant execute on function admin_delete_event(int) to authenticated;


create or replace function admin_delete_marketing_programme(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from marketing_programmes where id = p_id;
end;
$$;

grant execute on function admin_delete_marketing_programme(int) to authenticated;


create or replace function admin_delete_team_member(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from team_members where id = p_id;
end;
$$;

grant execute on function admin_delete_team_member(int) to authenticated;


create or replace function admin_delete_gallery_image(p_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  delete from gallery_images where id = p_id;
end;
$$;

grant execute on function admin_delete_gallery_image(int) to authenticated;
