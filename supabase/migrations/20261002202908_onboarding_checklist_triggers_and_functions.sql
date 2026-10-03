-- ============================================================
-- Onboarding state on accounts
-- ============================================================

alter table accounts
  add column if not exists setup_completed_at timestamptz;

-- Index so we can quickly find accounts that still need onboarding
create index if not exists accounts_setup_incomplete_idx
  on accounts (id)
  where setup_completed_at is null;

-- ============================================================
-- Auto-mark setup_completed_at on first active enrolment
-- ============================================================

create or replace function mark_account_setup_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    update accounts
    set setup_completed_at = coalesce(setup_completed_at, now())
    where id = (
      select account_id from members where id = new.member_id
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_enrollment_active on enrollments;

create trigger on_enrollment_active
after insert or update of status on enrollments
for each row
when (new.status = 'active')
execute function mark_account_setup_complete();


drop function if exists get_my_onboarding_state();

create or replace function get_my_onboarding_state()
returns table (
  account_id uuid,
  setup_completed_at timestamptz,
  has_children boolean,
  has_incomplete_profile boolean,
  pending_assessment_member_ids int[],
  awaiting_assessment_member_ids int[],
  unenrolled_member_ids int[],
  next_step text
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_account_id uuid;
  v_setup_completed_at timestamptz;
  v_member_ids int[];
begin
  v_account_id := auth.uid();
  if v_account_id is null then
    raise exception 'Not authenticated';
  end if;

  select a.setup_completed_at into v_setup_completed_at
  from accounts a where a.id = v_account_id;

  -- All member ids for this account
  select coalesce(array_agg(m.id), '{}')
  into v_member_ids
  from members m
  where m.account_id = v_account_id
    and m.archived_at is null;

  return query
  with
    child_count as (
      select count(*)::int as c
      from members m
      where m.account_id = v_account_id and m.archived_at is null
    ),
    incomplete_profiles as (
      select count(*)::int as c
      from members m
      where m.account_id = v_account_id
        and m.archived_at is null
        and not m.onboarding_complete
    ),
    pending_assessments as (
      select coalesce(array_agg(m.id), '{}') as ids
      from members m
      where m.account_id = v_account_id
        and m.archived_at is null
        and m.onboarding_complete = true
        and not exists (
          select 1 from assessments a where a.member_id = m.id
        )
    ),
    awaiting_assessments as (
      select coalesce(array_agg(m.id), '{}') as ids
      from members m
      where m.account_id = v_account_id
        and m.archived_at is null
        and m.onboarding_complete = true
        and exists (
          select 1 from assessments a
          where a.member_id = m.id and a.status != 'completed'
        )
    ),
    unenrolled as (
      select coalesce(array_agg(m.id), '{}') as ids
      from members m
      where m.account_id = v_account_id
        and m.archived_at is null
        and m.onboarding_complete = true
        and m.current_level_id is not null
        and not exists (
          select 1 from enrollments e
          where e.member_id = m.id and e.status = 'active'
        )
    )
  select
    v_account_id,
    v_setup_completed_at,
    (child_count.c > 0),
    (incomplete_profiles.c > 0),
    pending_assessments.ids,
    awaiting_assessments.ids,
    unenrolled.ids,
    case
      when child_count.c = 0 then 'add-child'
      when incomplete_profiles.c > 0 then 'complete-profile'
      when array_length(pending_assessments.ids, 1) > 0 then 'book-assessment'
      when array_length(awaiting_assessments.ids, 1) > 0 then 'await-assessment'
      when array_length(unenrolled.ids, 1) > 0 then 'enrol'
      else 'done'
    end
  from child_count, incomplete_profiles, pending_assessments,
       awaiting_assessments, unenrolled;
end;
$$;

grant execute on function get_my_onboarding_state() to authenticated;