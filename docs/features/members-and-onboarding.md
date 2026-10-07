# Members & Onboarding

This document covers parent-led family setup, child intake and member-profile management.

## Overview

TYGA supports a parent-led onboarding flow: a parent account can manage one or more child member records. The intake flow captures identity and golf background, a per-child questionnaire, consent records and profile data. Member detail views bring together programme enrollment, attendance and progression history.

The account-level onboarding checklist derives its next step from child/profile completion and assessment/enrollment state. Its steps are `add-child`, `complete-profile`, `book-assessment`, `await-assessment`, `enrol` and `done`. A parent can dismiss the checklist; dismissal changes its presentation to a reminder banner, not the underlying completion state.

## Parent features

- Parent home summaries show active members, upcoming sessions, outstanding balance and recent milestone activity
- Per-child summary includes next session/programme/venue, attendance rate and milestone count
- Add a member through a multi-step form
- Capture intake answers in stages: basic information, health and safety, and golfer background
- Maintain separate questionnaire data per child
- Submit consent choices during intake and review consent/document records in the member profile
- View a member profile with overview, programme, progression and settings areas
- Edit member identity, background details, emergency information and medical notes
- Request cancellation for active enrollments or withdraw pending ones
- Archive a member while preserving historical records

## Admin features

- Inspect member profiles across families, including enrollments, progressions, attendance summaries and uploaded document references
- Sensitive member detail is gated: the admin flow records an access reason before enabling the detail query; the detail includes the access history
- Review member archival and enrollment state in the context of active participation

## Data model

| Table | Purpose |
|---|---|
| `members` | Child profile data, current level, school, sizing, emergency info and archival state |
| `member_questionnaires` | One questionnaire per member with availability, skill, interests and gear data |
| Consent records | Consent type, signed state/time and associated document URL returned with a member overview |
| Member documents | Document type, storage URL and upload time returned with member detail |
| `accounts` | Parent identity, login data and role |
| Sensitive access log | Audit trail for admin access to sensitive member details, including reason and actor |

## RPCs

- `create_member`
- `submit_member_questionnaire`
- `submit_member_consents`
- `get_my_members_with_details`
- `parent_get_member_detail`
- `parent_get_member_overview`
- `get_member_programmes`
- `get_member_progression`
- `update_member`
- `archive_member`
- `parent_request_cancellation`
- `admin_get_member_detail`
- `admin_log_sensitive_access`
- `handle_new_user`
- `get_my_onboarding_state`
- `dismiss_onboarding_checklist`

## Hooks

| Hook | Responsibility |
|---|---|
| `hooks/use-create-member.ts` | Creates the member, questionnaire and consents, then fetches the created member |
| `hooks/client/members/use-members.ts` | Fetches parent-visible member detail, including questionnaire, consents, documents, enrollment, attendance and progress summaries |
| `hooks/client/members/use-member-overview.ts` | Loads questionnaire, consent and document overview |
| `hooks/client/members/use-member-programmes.ts` | Loads the member's programme enrollment/session view |
| `hooks/client/members/use-member-progression.ts` | Loads parent-visible progression details |
| `hooks/client/members/use-member-mutations.ts` | Updates a member or archives one; invalidates member and onboarding state |
| `hooks/client/use-parent-overview.ts` | Parent stats, children summary, upcoming sessions, recent progress and outstanding invoice cards |
| `hooks/admin/use-members.ts` | Admin member directory with search and active/archived filters |
| `hooks/admin/members/use-member-detail.ts` | Logs sensitive access and loads admin detail only after the UI gate is unlocked |
| `hooks/admin/members/use-sensitive-access-gate.ts` | Collects a reason and requires successful logging before revealing sensitive fields |
| `hooks/admin/use-document-url.ts` | Creates a one-hour signed URL from the private `documents` storage bucket |
| `hooks/shared/use-onboarding-state.ts` | Derives checklist/banner/hidden phase and exposes dismiss/reset mutations |

## Routes

- `/members` — list of a parent's children
- `/members/new` — guided onboarding wizard
- `/members/[id]` — member profile, programme, progression and settings views
- `/admin/members` and `/admin/members/[id]` — admin member directory and gated detail
- Parent dashboard — account-level and child-level summaries (see `hooks/client/use-parent-overview.ts`)
- `/settings` — account-level settings, including notification preferences

## Key behaviours

- Public sign-up always creates a `parent` account
- One questionnaire per member is enforced at schema level
- New member creation is a multi-step client operation. If questionnaire or consent submission fails after the member row was created, the hook reports partial completion and directs the parent to finish the profile; the member itself is not silently rolled back.
- The admin sensitive-access gate logs a reason before the admin detail query is enabled. The parent detail hook is a separate, caller-scoped read.
- Archiving is a soft-state change (`archived_at`), not destructive deletion; the hook refreshes member lists/details and onboarding state.
- Checklist dismissal is persisted separately from completion. The checklist remains a reminder banner until the setup is complete.
- Member mutations use React Query invalidation to refresh member list/detail data; archive also refreshes onboarding state.

## Setup order

Apply the account, member, questionnaire, consent/document and sensitive-access schema/functions in the order defined by the corresponding Supabase migrations, then reload the PostgREST schema. The historic numbered SQL filenames vary from the current migration layout; use migrations as the deployment source of truth.

## Not implemented

- Self-service reactivation of an archived member (no matching parent hook was found)
- Member avatar uploads
- Multi-parent access to a single member
