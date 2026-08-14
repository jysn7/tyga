-- ============================================================
-- Admin: Levels
-- ============================================================

create or replace function admin_get_levels(p_level_id int default null)
returns table (
  id int,
  name text,
  sort_order int,
  default_age_min int,
  default_age_max int,
  goal text,
  focus_summary text,
  upgrade_criteria text,
  archived_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select l.id, l.name, l.sort_order, l.default_age_min, l.default_age_max,
         l.goal, l.focus_summary, l.upgrade_criteria, l.archived_at
  from levels l
  where p_level_id is null or l.id = p_level_id
  order by l.sort_order;
end;
$$;

create or replace function admin_create_level(
  p_name text,
  p_sort_order int,
  p_default_age_min int default null,
  p_default_age_max int default null,
  p_goal text default null,
  p_focus_summary text default null,
  p_upgrade_criteria text default null
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_level_id int;
begin
  perform assert_is_admin();

  insert into levels (name, sort_order, default_age_min, default_age_max, goal, focus_summary, upgrade_criteria)
  values (p_name, p_sort_order, p_default_age_min, p_default_age_max, p_goal, p_focus_summary, p_upgrade_criteria)
  returning id into v_level_id;

  return v_level_id;
end;
$$;

create or replace function admin_update_level(
  p_level_id int,
  p_name text default null,
  p_sort_order int default null,
  p_default_age_min int default null,
  p_default_age_max int default null,
  p_goal text default null,
  p_focus_summary text default null,
  p_upgrade_criteria text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  update levels
  set
    name = coalesce(p_name, name),
    sort_order = coalesce(p_sort_order, sort_order),
    default_age_min = coalesce(p_default_age_min, default_age_min),
    default_age_max = coalesce(p_default_age_max, default_age_max),
    goal = coalesce(p_goal, goal),
    focus_summary = coalesce(p_focus_summary, focus_summary),
    upgrade_criteria = coalesce(p_upgrade_criteria, upgrade_criteria)
  where id = p_level_id;
end;
$$;

create or replace function admin_archive_level(p_level_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update levels set archived_at = now() where id = p_level_id;
end;
$$;

create or replace function admin_unarchive_level(p_level_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update levels set archived_at = null where id = p_level_id;
end;
$$;

-- True delete only allowed if nothing references this level anywhere
-- it could be referenced: members currently placed at it, programmes
-- requiring it, curriculum modules under it, or historical progression
-- records pointing to it either as source or destination.
create or replace function admin_delete_level(p_level_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if not can_delete('members', 'current_level_id', p_level_id) then
    raise exception 'Cannot delete level: members are currently placed at this level';
  end if;
  if not can_delete('programmes', 'level_id', p_level_id) then
    raise exception 'Cannot delete level: programmes reference this level';
  end if;
  if not can_delete('curriculum_modules', 'level_id', p_level_id) then
    raise exception 'Cannot delete level: curriculum modules exist under this level';
  end if;
  if not can_delete('level_progressions', 'from_level_id', p_level_id) then
    raise exception 'Cannot delete level: referenced in progression history (from_level)';
  end if;
  if not can_delete('level_progressions', 'to_level_id', p_level_id) then
    raise exception 'Cannot delete level: referenced in progression history (to_level)';
  end if;

  delete from levels where id = p_level_id;
end;
$$;


-- ============================================================
-- Admin: Curriculum Modules
-- ============================================================

create or replace function admin_get_curriculum_modules(p_level_id int default null)
returns table (
  id int,
  level_id int,
  level_name text,
  category text,
  name text,
  description text,
  is_milestone boolean,
  archived_at timestamptz
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  perform assert_is_admin();

  return query
  select cm.id, cm.level_id, l.name as level_name, cm.category, cm.name,
         cm.description, cm.is_milestone, cm.archived_at
  from curriculum_modules cm
  join levels l on l.id = cm.level_id
  where p_level_id is null or cm.level_id = p_level_id
  order by l.sort_order, cm.id;
end;
$$;

create or replace function admin_create_curriculum_module(
  p_level_id int,
  p_name text,
  p_category text default null,
  p_description text default null,
  p_is_milestone boolean default false
)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_module_id int;
begin
  perform assert_is_admin();

  if p_category is not null and p_category not in ('technical', 'physical', 'mental_character', 'format') then
    raise exception 'Invalid category: %', p_category;
  end if;

  insert into curriculum_modules (level_id, category, name, description, is_milestone)
  values (p_level_id, p_category, p_name, p_description, p_is_milestone)
  returning id into v_module_id;

  return v_module_id;
end;
$$;

create or replace function admin_update_curriculum_module(
  p_module_id int,
  p_name text default null,
  p_category text default null,
  p_description text default null,
  p_is_milestone boolean default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if p_category is not null and p_category not in ('technical', 'physical', 'mental_character', 'format') then
    raise exception 'Invalid category: %', p_category;
  end if;

  update curriculum_modules
  set
    name = coalesce(p_name, name),
    category = coalesce(p_category, category),
    description = coalesce(p_description, description),
    is_milestone = coalesce(p_is_milestone, is_milestone)
  where id = p_module_id;
end;
$$;

create or replace function admin_archive_curriculum_module(p_module_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update curriculum_modules set archived_at = now() where id = p_module_id;
end;
$$;

create or replace function admin_unarchive_curriculum_module(p_module_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();
  update curriculum_modules set archived_at = null where id = p_module_id;
end;
$$;

create or replace function admin_delete_curriculum_module(p_module_id int)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  perform assert_is_admin();

  if not can_delete('session_curriculum_modules', 'curriculum_module_id', p_module_id) then
    raise exception 'Cannot delete module: it has been taught in one or more sessions';
  end if;
  if not can_delete('member_milestones', 'curriculum_module_id', p_module_id) then
    raise exception 'Cannot delete module: member milestone records reference it';
  end if;

  delete from curriculum_modules where id = p_module_id;
end;
$$;


-- ============================================================
-- Grants
-- ============================================================

grant execute on function can_delete(text, text, int) to authenticated;

grant execute on function admin_get_levels(int) to authenticated;
grant execute on function admin_create_level(text, int, int, int, text, text, text) to authenticated;
grant execute on function admin_update_level(int, text, int, int, int, text, text, text) to authenticated;
grant execute on function admin_archive_level(int) to authenticated;
grant execute on function admin_unarchive_level(int) to authenticated;
grant execute on function admin_delete_level(int) to authenticated;

grant execute on function admin_get_curriculum_modules(int) to authenticated;
grant execute on function admin_create_curriculum_module(int, text, text, text, boolean) to authenticated;
grant execute on function admin_update_curriculum_module(int, text, text, text, boolean) to authenticated;
grant execute on function admin_archive_curriculum_module(int) to authenticated;
grant execute on function admin_unarchive_curriculum_module(int) to authenticated;
grant execute on function admin_delete_curriculum_module(int) to authenticated;