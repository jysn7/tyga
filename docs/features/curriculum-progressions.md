# Curriculum & Progressions

This document describes level and curriculum administration, curriculum tags attached to sessions, member milestone/progression records and what the current hooks expose.

## Domain model

| Table | Purpose |
|---|---|
| `levels` | Ordered programme/member levels, with default age range, goals, focus and upgrade criteria |
| `curriculum_modules` | Modules grouped by level and category; modules can be marked as milestones and archived |
| `session_curriculum_modules` | The modules associated with a session |
| `member_milestones` | Per-member module completion records |
| `level_progressions` | Historical transitions from one level to another |

A session tag means a module was covered during that session; a member milestone is a separate assertion that an individual completed a module. A session tag must not be presented as proof that every attendee completed the module.

## Admin capabilities

Admins can list, create, update, archive and restore levels, and manage curriculum modules (read, create, update, archive/restore). Module categories in the schema include `technical`, `physical`, `mental_character` and `format`. A level or module with dependent records should be archived rather than destructively deleted.

Admins can also inspect and edit the curriculum tags on programme sessions through the programme/session management surface; see [programmes-and-sessions.md](./programmes-and-sessions.md).

## Coach and parent capabilities

- Coaches can read the curriculum associated with their session and tag modules covered in a session.
- Parents can read the member progression view through `get_member_progression`.
- Member detail views may show progression history and attendance summary.

## Hook map

| Hook | Responsibility |
|---|---|
| `hooks/admin/levels/use-levels.ts` | Lists configured levels |
| `hooks/admin/levels/use-level-mutations.ts` | Creates, updates, archives/restores levels |
| `hooks/admin/curriculums/use-curriculum-modules.ts` | Lists curriculum modules, optionally filtered by level |
| `hooks/admin/curriculums/use-curriculum-module-mutations.ts` | Admin module create/update/archive operations |
| `hooks/admin/programmes/use-curriculum-mutations.ts` | Reads modules and changes session-module associations |
| `hooks/coach/use-coach-session-detail.ts` | Loads session-specific curriculum for coaches |
| `hooks/coach/use-coach-mutations.ts` | Lets a coach tag session curriculum |
| `hooks/client/members/use-member-progression.ts` | Reads a member's parent-visible progression |
| `hooks/admin/use-admin-overview.ts` | Provides aggregate progression reporting for administrators |

## Current progression boundary

The `member_milestones` and `level_progressions` tables exist, and parent/admin read surfaces include progression data. However, a repository search of the current hooks and Supabase migrations did not find an implemented `coach_advance_member_level`, `member_is_level_complete` or `coach_complete_module_for_enrolled` operation. Do not describe automatic milestone completion, readiness enforcement or coach level advancement as currently available until a corresponding migration, hook and UI are added and verified.

The `get_member_progression` read function is used by the parent hook; it is a read path and does not itself advance a member's level.

## Related routes

- `/admin/levels` — admin level catalogue
- `/admin/curriculum` — admin curriculum module catalogue
- `/coach/sessions/[id]` — session curriculum context
- `/members/[id]` — parent/member progression view

## Setup and integrity

Use the migration history as the source of truth for schema and RPC deployment order. The level/module administration functions enforce admin access; migrations also prevent deleting levels/modules while referenced by members, programmes, progression history or milestone records. Reload PostgREST after function signature changes.

## Not present in the current client hook surface

- Coach-driven per-member milestone completion or level advancement
- Automatic advancement
- Certificate/badge generation and progression notifications
