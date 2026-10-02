-- ============================================================
-- Coach: Curriculum helper + level progressions
-- Create with: supabase migration new coach_progression
-- ============================================================

-- ---------- READ: modules at a level ("what does badge-complete need?") ----------
-- SECURITY INVOKER (the default): curriculum_modules and levels already
-- have a "anyone logged in can view" RLS policy, so RLS does the job.

create or replace function coach_get_curriculum_modules(p_level_id int default null)
returns table (
  module_id int,
  level_id int,
  level_name text,
  category text,
  module_name text,
  description text,
  is_milestone boolean
)
language sql
security invoker set search_path = public
stable
as $$
  select
    cm.id, cm.level_id, l.name, cm.category, cm.name, cm.description, cm.is_milestone
  from curriculum_modules cm
  join levels l on l.id = cm.level_id
  where p_level_id is null or cm.level_id = p_level_id
  order by l.sort_order, cm.is_milestone desc, cm.id;
$$;


-- ---------- WRITE: submit a level progression ----------
-- SECURITY INVOKER on purpose: the "Coaches submit progressions for their
-- own students" RLS policy is what stops a coach submitting for a child
-- they don't teach. We only add friendly error messages on top.

create or replace function coach_submit_progression(
  p_member_id int,
  p_to_level_id int,
  p_badge_complete boolean,
  p_notes text default null
)
returns int
language plpgsql
security invoker set search_path = public
as $$
declare
  v_coach_id int := get_coach_id();
  v_from_level_id int;
  v_progression_id int;
begin
  if v_coach_id is null then
    raise exception 'Only coaches can submit progressions';
  end if;

  -- RLS hides members this coach doesn't teach, so "not found" covers both cases
  select m.current_level_id into v_from_level_id
  from members m
  where m.id = p_member_id;

  if not found then
    raise exception 'Member not found, or not in one of your programmes';
  end if;
  if v_from_level_id is null then
    raise exception 'This member has no level yet. Complete their assessment first';
  end if;
  if p_to_level_id = v_from_level_id then
    raise exception 'The new level must be different from the current level';
  end if;

  insert into level_progressions (
    member_id, from_level_id, to_level_id, assessed_by, badge_complete, notes
  )
  values (
    p_member_id, v_from_level_id, p_to_level_id, v_coach_id,
    coalesce(p_badge_complete, false), p_notes
  )
  returning id into v_progression_id;

  return v_progression_id;
end;
$$;

grant execute on function coach_get_curriculum_modules(int) to authenticated;
grant execute on function coach_submit_progression(int, int, boolean, text) to authenticated;
