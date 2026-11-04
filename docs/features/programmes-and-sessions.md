# Programmes & Sessions

This document consolidates programme management, coach session workflows, curriculum tagging, attendance and session administration.
Discount rules and parent-facing price previews for programme enrollment are covered in [Discounts & enrollment pricing](./discounts-and-pricing.md).

## Overview

TYGA supports admin programme setup, parent discovery and enrollment initiation, coach assignment and a coach-first operations view for daily sessions. Parent programme queries can be scoped to one member or request the all-programmes view; eligibility is returned by the backend and is not inferred only from the display.

## Core user flows

### Admin

- Create, edit, archive and soft-delete programmes
- Default age-range and coaching-ratio settings from the selected level
- Assign lead, assistant and volunteer coaches per programme
- Generate sessions from recurrence patterns (days of week + time + date range)
- Update session time, venue, status and notes
- Add or remove session-level coach overrides without changing programme defaults
- Review each session's staffing ratio against enrolled members
- Tag a session with modules from the programme level's curriculum

### Parent

- Browse eligible programmes for a child based on age, gender and current level
- View programme detail, session schedule, venue and coaches
- Open a child-specific session detail with coach notes, curriculum, attendance and previous/next session navigation
- Enroll a child through a pending enrollment + invoice flow
- Check programme and session eligibility before submitting payment

### Coach

- View all sessions assigned via `session_coaches`
- Open a session detail screen with roster, curriculum and notes tabs
- Mark attendance for enrolled members
- Bulk-mark attendance and tag the session curriculum

## Data model

| Table | Purpose |
|---|---|
| `programmes` | Programme umbrella record including type, level, age/gender rules, price, capacity and ratio |
| `programme_sessions` | One row per calendar session occurrence |
| `programme_coaches` | Programme-level assigned coaches |
| `session_coaches` | Session-level coach assignments and overrides |
| `enrollments` | Parent/member-to-programme enrollment lifecycle |
| `curriculum_modules` | Catalogue of modules for a level |
| `session_curriculum_modules` | Modules tagged on a specific session |
| `member_milestones` | Per-member curriculum completion records (the current session hooks do not expose a bulk-completion action) |

Lifecycle for enrollment status:

`pending` → `active` (via payment webhook) → `completed` / `withdrawn` / `paused`

## Key invariants

- Eligibility is calculated by parent-facing backend queries for the selected child; the enrollment flow must honor the returned eligibility/reason
- A programme cannot be deleted while it still has active enrollments or attendance history
- A session cannot be deleted once attendance has been recorded
- Coach ratio checks are computed live against current sessions and enrollments
- A coach can only access sessions they are assigned to
- Attendance and notes updates are supported by coach mutations; no session-state guard named `assert_session_recordable` was found in the current migrations

## RPCs

### Admin RPCs

- `admin_get_programmes`
- `admin_get_programme`
- `admin_create_programme`
- `admin_update_programme`
- `admin_archive_programme`
- `admin_unarchive_programme`
- `admin_delete_programme`
- `admin_get_programme_coaches`
- `admin_assign_coach_to_programme`
- `admin_remove_coach_from_programme`
- `admin_generate_programme_sessions`
- `admin_get_sessions`
- `admin_update_session`
- `admin_delete_session`
- `admin_sync_session_coaches`
- `admin_add_coach_to_session`
- `admin_remove_coach_from_session`
- `admin_tag_session_curriculum`
- `admin_remove_module_from_session`
- `admin_get_session_modules`
- `admin_get_level_modules`
- `admin_check_programme_ratio`

### Parent RPCs

- `parent_get_programmes`
- `parent_get_all_programmes`
- `parent_get_programme_detail`
- `parent_get_enrollable_members`
- `parent_create_enrollment`

### Coach RPCs

- `coach_get_sessions`
- `coach_get_session_detail`
- `coach_get_session_roster`
- `coach_get_session_curriculum`
- `coach_mark_attendance`
- `coach_bulk_mark_attendance`
- `coach_save_session_notes`
- `coach_tag_session_curriculum`

## Hook map

| User/surface | Hooks | Coverage |
|---|---|---|
| Parent programme discovery | `hooks/client/use-programmes.ts` | Programme list/detail, per-member eligibility and enrollable member list |
| Parent enrollment initiation | `hooks/client/use-enroll.ts` | Posts member/programme IDs to `/api/enroll`; returns checkout URL, reference and created enrollment/invoice IDs |
| Parent session detail and attendance | `hooks/client/use-parent-sessions.ts` | Session detail, child attendance history and attendance summaries |
| Admin programme management | `hooks/admin/programmes/use-programmes.ts`, `use-programme-mutations.ts` | Filtered list/detail, create/update/archive/delete, lookups, sessions and assignments |
| Admin scheduling | `hooks/admin/programmes/use-session-mutations.ts` | Generate sessions, update/delete a session and add/remove/synchronize coaches |
| Admin programme coaches | `hooks/admin/programmes/use-programme-coaches.ts` | Load and change programme-level coach assignments |
| Admin session curriculum | `hooks/admin/programmes/use-curriculum-mutations.ts` | Read level/session modules, replace session tags and add/remove a module |
| Coach sessions | `hooks/coach/use-coach-dashboard.ts`, `use-coach-sessions.ts`, `use-coach-session-detail.ts` | Dashboard summary, date-bounded sessions, session detail, roster and tagged curriculum |
| Coach session changes | `hooks/coach/use-coach-mutations.ts`, `use-sessions-mutations.ts` | Attendance, bulk attendance, notes and session curriculum tagging |
| Calendar | `hooks/shared/use-schedule.ts` | Role-specific parent, coach and admin combined schedules |

The React Query mutations invalidate the related programme/session/coach/curriculum queries. The enrollment hook delegates validation and creation to the app API route; discounts and price previews are covered in [discounts-and-pricing.md](./discounts-and-pricing.md), and payment completion remains webhook-driven as documented in [billing-and-payments.md](./billing-and-payments.md).

## Coach session detail UX

The coach UX includes:

- a weekly overview with stats tiles, day strip and attention queue
- a session detail page with a roster and attendance tab, notes and curriculum tab, and overview tab
- bulk attendance marking
- session notes saved separately from curriculum tagging

The coach hooks read sessions over an explicit start/end date range and load detail, roster and curriculum independently by session ID. Attendance and notes changes refresh the related queries. The separate progression helper hooks are not wired into the current coach UI and their database functions are not present in the checked-in migrations; see [curriculum-progressions.md](./curriculum-progressions.md) for that boundary.

## Route surfaces

- `/programmes` and `/programmes/[id]` — parent programme discovery and details
- `/coach/sessions` and `/coach/sessions/[id]` — coach session list and session workspace
- `/admin/programmes` — programme management

## Setup order

Apply the levels/venues, programmes, sessions, curriculum links and enrollment migrations before the role-specific RPC migrations; reload PostgREST after database changes. The current `supabase/migrations` history is authoritative for exact migration ordering.

## Not implemented

- Drag-and-drop rescheduling UI
- Bulk coach reassignment across sessions
- Automated under-staffing digest
- Waitlist for full programmes
- Per-attendee bulk curriculum completion
