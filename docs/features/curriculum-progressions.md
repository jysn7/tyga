# Curriculum & Progressions

This document describes level and curriculum administration, curriculum tags attached to sessions, member milestone/progression records and what the current hooks expose.

## Domain model

| Table                        | Purpose                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `levels`                     | Ordered programme/member levels, with default age range, goals, focus and upgrade criteria |
| `curriculum_modules`         | Modules grouped by level and category; modules can be marked as milestones and archived    |
| `session_curriculum_modules` | The modules associated with a session                                                      |
| `member_milestones`          | Per-member module completion records                                                       |
| `level_progressions`         | Historical transitions from one level to another                                           |

A session tag means a module was covered during that session; a member milestone is a separate assertion that an individual completed a module. A session tag must not be presented as proof that every attendee completed the module.

## Admin capabilities

Admins can list, create, update, archive and restore levels, and manage curriculum modules (read, create, update, archive/restore). Module categories in the schema include `technical`, `physical`, `mental_character` and `format`. A level or module with dependent records should be archived rather than destructively deleted.

Admins can also inspect and edit the curriculum tags on programme sessions through the programme/session management surface; see [programmes-and-sessions.md](./programmes-and-sessions.md).

## Coach and parent capabilities

- Coaches can read the curriculum associated with their session and tag modules covered in a session.
- Coaches can review active students' current-level curriculum completion and progression records they submitted from `/coach/progressions`.
- Coaches can manually verify and undo module completion for students actively enrolled in their programmes.
- A student is ready to advance when every non-archived module marked as a milestone in their current level is complete. If the level has no active milestones, the student is eligible to advance. Non-milestone modules do not affect progression readiness. The coach confirms advancement; the operation records the transition, optional badge status and notes, and updates the student's current level atomically.
- Parents can read the member progression view through `get_member_progression`.
- Member detail views may show progression history and attendance summary.

## Hook map

| Hook                                                         | Responsibility                                                                     |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `hooks/admin/levels/use-levels.ts`                           | Lists configured levels                                                            |
| `hooks/admin/levels/use-level-mutations.ts`                  | Creates, updates, archives/restores levels                                         |
| `hooks/admin/curriculums/use-curriculum-modules.ts`          | Lists curriculum modules, optionally filtered by level                             |
| `hooks/admin/curriculums/use-curriculum-module-mutations.ts` | Admin module create/update/archive operations                                      |
| `hooks/admin/programmes/use-curriculum-mutations.ts`         | Reads modules and changes session-module associations                              |
| `hooks/coach/use-coach-session-detail.ts`                    | Loads session-specific curriculum for coaches                                      |
| `hooks/coach/use-coach-mutations.ts`                         | Lets a coach tag session curriculum                                                |
| `hooks/coach/use-coach-progression-overview.ts`              | Reads active students' curriculum milestones and coach-visible progression history |
| `hooks/coach/use-coach-progressions.ts`                      | Verifies/undoes module completion and advances a ready student                     |
| `hooks/client/members/use-member-progression.ts`             | Reads a member's parent-visible progression                                        |
| `hooks/admin/use-admin-overview.ts`                          | Provides aggregate progression reporting for administrators                        |

## Progression enforcement

The `coach_complete_module_for_enrolled`, `member_is_level_complete` and `coach_advance_member_level` database functions enforce coach access and progression readiness. Coach milestone and progression writes go through these functions rather than direct table writes. Completion is a manual coach verification; session curriculum tags do not automatically complete a student's module. A level with no active milestones is eligible to advance.

`coach_advance_member_level` selects the next non-archived level in sort order and, in one transaction, records the coach's progression assessment and updates the student's current level. It rejects advancement if any active milestone in the current level is incomplete or if no higher active level exists.

The `get_member_progression` function used by the parent hook remains a read path; it does not itself advance a member's level.

## Related routes

- `/admin/levels` — admin level catalogue
- `/admin/curriculum` — admin curriculum module catalogue
- `/coach/progressions` — coach view of active students' current-level progress
- `/coach/sessions/[id]` — session curriculum context
- `/members/[id]` — parent/member progression view

## Setup and integrity

Use the migration history as the source of truth for schema and RPC deployment order. The level/module administration functions enforce admin access; migrations also prevent deleting levels/modules while referenced by members, programmes, progression history or milestone records. Reload PostgREST after function signature changes.

## Not present in the current client hook surface

- Automatic advancement
- Certificate/badge generation and progression notifications
