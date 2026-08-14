-- ============================================================
-- TYGA Platform — Admin Shared Functions
-- Run this FIRST, before any other admin_*.sql file. Every
-- other admin SQL file (accounts/members/coaches, levels/
-- curriculum, events, appointments, etc.) assumes these two
-- functions already exist and does not redefine them.
-- ============================================================

-- ---------- Admin Authorization Guard ----------

-- Raises an exception unless the current user's account has role = 'admin'.
-- Every admin-only function across every admin SQL file calls this as
-- its first statement.
create or replace function assert_is_admin()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from accounts
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access denied: admin role required';
  end if;
end;
$$;


-- ---------- Reference-Check Helper for Hard Deletes ----------

-- Returns true if no row in p_table has p_fk_column = p_id — i.e. it's
-- safe to hard-delete. Used by every admin_delete_* function across
-- every admin SQL file (levels, curriculum modules, events, and any
-- future entity needing a guarded hard delete).
create or replace function can_delete(
  p_table text,
  p_fk_column text,
  p_id int
) returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_count int;
begin
  execute format('select count(*) from %I where %I = $1', p_table, p_fk_column)
    into v_count using p_id;
  return v_count = 0;
end;
$$;


-- ---------- Grants ----------

grant execute on function assert_is_admin() to authenticated;
grant execute on function can_delete(text, text, int) to authenticated;