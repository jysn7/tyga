# Programmes & Sessions — README

Programme creation, scheduling, coach assignment, and coaching-ratio enforcement.

---

## Features

### Admin

- **Create, edit, archive programmes** — type, level, age/gender restriction, venue, price, capacity, coaching ratio
- **Defaults from level** — age range and coaching ratio pre-fill from the selected level's own defaults (`levels.default_age_min/max`, `levels.default_ratio`), overridable per programme
- **Assign coaches** — lead, assistant, or volunteer role per programme
- **Generate sessions** — turn a recurrence pattern (days of week + time + date range) into individual `programme_sessions` rows in bulk
- **Session management** — edit time, venue, status, coach notes per session
- **Session-level coach overrides** — add or remove a coach for a single session without changing the programme-level assignment
- **Ratio check** — per-session report comparing enrolled headcount against assigned coaches
- **Curriculum tagging** — attach a level's curriculum modules to individual sessions, tracking what was actually taught

### Parent

- **Browse eligible programmes** — filtered automatically by a chosen child's age, gender, and current level; ineligible programmes are never shown
- **Programme detail page** — venue, schedule, coaches, curriculum, upcoming sessions, eligibility and already-enrolled status for the selected child
- **Enroll** — creates a pending enrollment + invoice in one step, redirects to payment

### Coach

- **My Sessions** — every session assigned via `session_coaches`, past and upcoming
- **Session detail (3 tabs)** — Overview (ratio, venue, coaches), Roster & Attendance, Notes & Curriculum

---

## Data model

| Table | What it holds |
|---|---|
| `programmes` | The umbrella entity — type, level, venue, age/gender rules, price, capacity, ratio |
| `programme_sessions` | One row per calendar occurrence |
| `programme_coaches` | Coach assignment at the programme level |
| `session_coaches` | Coach assignment at the individual session level (auto-synced from `programme_coaches` on session creation) |
| `enrollments` | Member ↔ programme link, with status |
| `curriculum_modules` | Taught content per level, category, and milestone flag |
| `session_curriculum_modules` | Which modules were tagged to which session |

**Enrollment status lifecycle:** `pending` → `active` (via payment webhook only) → `completed` / `withdrawn` / `paused` (cancellation-requested).

---

## RPCs

### Admin

| Function | Summary |
|---|---|
| `admin_get_programmes` | List with filters (search, level, archived) |
| `admin_get_programme` | Single programme, regardless of archive status |
| `admin_create_programme` | Create, defaulting age/ratio from level |
| `admin_update_programme` | Update |
| `admin_archive_programme` | Soft delete |
| `admin_unarchive_programme` | Restore |
| `admin_delete_programme` | Hard delete, blocked with active enrollments or attendance history |
| `admin_get_programme_coaches` | Coaches assigned to a programme |
| `admin_assign_coach_to_programme` | Assign, upserts role on conflict |
| `admin_remove_coach_from_programme` | Remove |
| `admin_generate_programme_sessions` | Bulk-create sessions from days-of-week + date range |
| `admin_get_sessions` | List with filters |
| `admin_update_session` | Edit time, venue, status, notes |
| `admin_delete_session` | Delete, blocked if attendance exists |
| `admin_sync_session_coaches` | Re-copy programme coaches onto a session |
| `admin_add_coach_to_session` | Session-level override, add |
| `admin_remove_coach_from_session` | Session-level override, remove |
| `admin_tag_session_curriculum` | Replace a session's tagged module set |
| `admin_remove_module_from_session` | Untag one module |
| `admin_get_session_modules` | Modules tagged to a session |
| `admin_get_level_modules` | All modules belonging to a level (curriculum picker source) |
| `admin_check_programme_ratio` | Per-session ratio report for a programme |

### Parent

| Function | Summary |
|---|---|
| `parent_get_programmes` | Eligible programmes for a given member |
| `parent_get_all_programmes` | Browse all non-archived programmes, no member context |
| `parent_get_programme_detail` | Full detail, with eligibility and already-enrolled status for a given member |
| `parent_get_enrollable_members` | Which of the parent's children qualify, and why not for the rest |
| `parent_create_enrollment` | Creates enrollment (pending) + invoice, re-validates eligibility server-side |

### Coach

| Function | Summary |
|---|---|
| `coach_get_sessions` | Sessions this coach is assigned to |
| `coach_get_session_detail` | Single session, scoped to the coach's own assignment |
| `coach_get_session_roster` | Enrolled members + current attendance status |
| `coach_get_session_curriculum` | Modules tagged + full level module list |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/admin/programmes/use-programmes.ts` | `useProgrammes`, `useProgramme`, `useGetSessions`, `useGetSessionModules`, `useGetLevelModules`, `useGetProgrammeCoaches`, `useGetSessionCoaches` |
| `hooks/admin/programmes/use-programme-mutations.ts` | `useCreateProgramme`, `useUpdateProgramme`, `useToggleProgrammeArchive`, `useDeleteProgramme`, `useTagSessionCurriculum`, `useRemoveModuleFromSession` |
| `hooks/admin/programmes/use-session-mutations.ts` | `useGenerateSessions`, `useUpdateSession`, `useDeleteSession`, `useAddCoachToSession`, `useRemoveCoachFromSession`, `useSyncSessionCoaches` |
| `hooks/client/use-programmes.ts` | `useProgrammes`, `useProgrammeDetail`, `useEnrollableMembers` |
| `hooks/client/use-enroll.ts` | `useEnroll` |
| `hooks/coach/use-coach-sessions.ts` | `useCoachSessions`, `useSessionDetail`, `useSessionRoster`, `useSessionCurriculum` |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/admin/programmes` | Admin | List + create |
| `/admin/programmes/[id]` (edit panel) | Admin | Basic info, coaches, sessions, curriculum |
| `/programmes` | Parent | Browse eligible programmes |
| `/programmes/[id]` | Parent | Programme detail + enroll |
| `/coach/sessions` | Coach | Calendar of assigned sessions |
| `/coach/sessions/[id]` | Coach | Overview / Roster & Attendance / Notes & Curriculum tabs |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| Ineligible programmes never shown to a parent | `parent_get_programmes`, re-checked in `parent_create_enrollment` |
| Enrollment can only be created as `pending` | `enrollments` RLS insert policy |
| Enrollment can only become `active` via the payment webhook | `enrollments` RLS update policy + webhook handler |
| Session-level coach assignment auto-syncs from the programme | `sync_session_coaches` trigger, fires on session insert |
| A programme can't be deleted with active enrollments or attendance history | `admin_delete_programme` |
| A session can't be deleted with attendance recorded | `admin_delete_session` |
| Curriculum tagging is a full replace, not additive | `admin_tag_session_curriculum` / `coach_tag_session_curriculum` |
| Coach ratio checked live against current enrollment + coach assignment | `admin_check_programme_ratio`, not a cached figure |

---

## Setup order

1. `01-levels-venues.sql` — reference data
2. `02-programmes.sql` — programme + programme_coaches
3. `03-sessions.sql` — programme_sessions + session_coaches + sync trigger
4. `04-curriculum.sql` — curriculum_modules + session_curriculum_modules
5. `05-enrollments.sql`
6. `06-admin-rpcs.sql`
7. `07-parent-rpcs.sql`
8. `08-coach-rpcs.sql`
9. `notify pgrst, 'reload schema';`

---

## Not implemented

- Drag-and-drop session rescheduling UI
- Bulk coach reassignment across multiple sessions at once
- Automated ratio-warning digest (nightly cron summarizing under-staffed sessions) — mechanism (`pg_cron`) available, job not scheduled
- Waitlist for full programmes