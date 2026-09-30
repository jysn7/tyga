# Members & Onboarding — README

Family accounts, child profiles, intake, and profile management.

---

## Features

### Parent

- **Add a member** — progress-centered questionnaire (Basic info → Health & safety → About your golfer), back/next navigation
- **Per-member questionnaire** — each child gets their own intake answers; never shared or copied between siblings on the same account
- **Member profile, tabbed** — Overview, Programmes & Sessions, Levels & Curriculum, Settings
- **Edit member** — name, DOB, gender, school, kit sizing, emergency contact, medical details, ID/birth certificate number
- **Sensitive info clearly separated** — its own tab section, explicitly labeled, access-logged
- **Enrollment cancellation** — withdraw a pending enrollment directly; request cancellation on an active one for admin review
- **Member deactivation** — soft delete; blocked while an active enrollment exists; full history retained

### Admin

- **Oversight** — view any member's full profile, across all families
- **Role/account management** — activate/deactivate accounts, change roles

---

## Data model

| Table | What it holds |
|---|---|
| `members` | Name, DOB, gender, current level, school, kit sizing, emergency contact, medical notes, `deactivated_at` |
| `member_questionnaires` | One per member — availability, self-reported skill level, interests, gear owned |
| `accounts` | The parent's own login/identity, `role`, `active` |
| `sensitive_data_access_log` | Who viewed which sensitive field, on which member, and when |

---

## RPCs

| Function | Summary |
|---|---|
| `get_my_members_with_details` | Full member detail (or list, if no id given), scoped to the caller's own account |
| `get_member_programmes` | A member's enrollments, next session, recent attendance |
| `get_member_progression` | Current level, badge status, curriculum covered, next level |
| `update_member` | Update a member's own profile fields |
| `parent_request_cancellation` | Flags an active enrollment for admin review |
| `parent_deactivate_member` | Soft-deactivates a member, blocked with an active enrollment |
| `log_sensitive_data_access` | Records a view of a sensitive field |
| `handle_new_user` | Auth trigger — creates the `accounts` row on sign-up, always as `parent` |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/client/use-member.ts` | `useMember`, `toMemberDetail` (shared mapper) |
| `hooks/client/use-members.ts` | `useMembers` (full list) |
| `hooks/client/use-member-programmes.ts` | `useMemberProgrammes` |
| `hooks/client/use-member-progression.ts` | `useMemberProgression` |
| `hooks/client/use-member-mutations.ts` | `useUpdateMember` |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/members` | Parent | List of own children |
| `/members/new` | Parent | Add-member wizard |
| `/members/[id]` | Parent | Tabbed profile (Overview / Programmes / Levels / Settings) |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| Public sign-up always creates a `parent` account | `handle_new_user`, role hardcoded, not read from client metadata |
| One questionnaire per member, enforced at the schema level | `unique(member_id)` on `member_questionnaires` |
| Sensitive fields are access-logged every view | `log_sensitive_data_access`, called server-side before render |
| A member can't be deactivated with an active enrollment | `parent_deactivate_member` |
| A deactivated member's history is retained, not deleted | Soft delete via `deactivated_at`, no cascading delete |
| Editing a member invalidates its detail, programmes, and progression queries together | `useUpdateMember`'s `onSuccess`, prefix-invalidates `["members", id]` |

---

## Setup order

1. `01-accounts.sql` — accounts table + `handle_new_user` trigger
2. `02-members.sql` — members table
3. `03-member-questionnaires.sql`
4. `04-sensitive-data-log.sql`
5. `05-member-rpcs.sql`
6. `notify pgrst, 'reload schema';`

---

## Not implemented

- Self-service reactivation of a deactivated member by the parent (currently requires contacting admin)
- Photo/avatar upload for member profiles
- Multi-parent access to one member (e.g. two guardians on separate accounts sharing a child)