# README

A short reference for the features implemented in this project.

---

## Features

### Authentication & Accounts

- Email/password sign-in via Supabase Auth
- Role-based access: `admin`, `coach`, `parent`
- Account active toggle + Auth ban for deactivation
- `useAuth` hook enforces role and active status on protected routes
- Public sign-up always creates a `parent` account (`handle_new_user` trigger) — role cannot be self-escalated by passing a different role in sign-up metadata
- Login attempts are tracked (`login_events`), with automatic flags for suspicious activity: sign-in from a new IP, repeated failed attempts, or many accounts targeted from one IP
- Admin-managed account lockouts (`account_lockouts`) — timed (e.g. 1 hour, 24 hours, 7 days) or indefinite, always with a reason, separate from the `active` toggle
- Automatic short lockout after repeated failed sign-ins, independent of any admin action
- Sensitive field access (medical notes, date of birth, emergency contact) is logged per view (`log_sensitive_data_access` / `sensitive_data_access_log`) — who viewed it, whose record, and when

### Programmes

- Create, edit, archive programmes
- Assign coaches, set venue, level, age range, capacity, price
- Programme price includes equipment for enrolled members — no separate gear fee charged at enrollment
- Coaching ratio and age range default from the selected level's own defaults, overridable per programme
- Programme sessions generated from recurring rules
- Session management: edit time, venue, status, coaches
- Session curriculum tagging (splits a level's modules across sessions)
- `sync_session_coaches` trigger auto-copies programme-level coach assignments onto newly generated sessions, so a coach assigned at the programme level doesn't need separately assigning per session

### Levels & Curriculum

- Levels with sort order, age ranges, goals, upgrade criteria
- Curriculum modules attached to levels
- Tag modules to individual sessions
- Track which modules were taught
- Curriculum modules can be flagged `is_milestone` — marks which ones count toward badge-completion criteria for progression

### Members

- Member profiles: DOB, gender, medical notes, school, kit sizes, emergency contacts
- Link members to parent accounts
- Enrol members in programmes
- Level progressions with badge completion
- Per-member intake questionnaire (`member_questionnaires`) — each child has their own, not shared across siblings on the same account
- Enrollment cancellation: parent can withdraw a pending (unpaid) enrollment directly; an active (paid) enrollment requires an admin-reviewed cancellation request
- Member deactivation (soft delete, `deactivated_at`) — blocked while the member has an active enrollment; full history (attendance, progressions, invoices) is retained, never erased

### Enrollments & Attendance

- Members enrolled in programmes
- Attendance tracking per session (present / late / excused / absent)
- Bulk marking, per-member marking
- Enrollment can only move from pending to active via the payment webhook — never set directly by the parent, enforced at the RLS level
- Attendance uniqueness per session/member enforced by a database constraint, not just application logic

### Appointments & Assessments

- Parents browse open slots and book assessments
- Coaches publish one-off and recurring availability
- Blocked times for holidays and time off
- Head coaches confirm requests, complete assessments, record outcomes
- Booking window (lead time + lookahead), cancellation cutoff
- Admin overrides (create slot, book for member, confirm)
- A completed assessment automatically sets the member's current level (`set_level_from_assessment` trigger) — no separate manual update step
- Data-integrity guard (`enforce_appointment_type_consistency`): a parent consultation can never carry an assessed level, and a completed assessment must always have one

### Schedules

- Combined calendar (week / month) per role
- Coach: sessions + booked appointments
- Parent: children's sessions + appointments
- Admin: entire academy, filterable by coach or venue
- Subscribable `.ics` calendar feed per account, so sessions and appointments can sync into a personal calendar app (Google Calendar, Apple Calendar, Outlook) outside of TYGA itself

### Notifications

- In-app notifications per user
- Toast feedback for every mutation
- Web Push notifications via the installed PWA (VAPID-based, no third-party notification provider) — delivered even when the app isn't open
- Per-type, per-channel notification preferences (`notification_preferences`)

### Coaches

- Coach invites
- Coach types: head coach, assistant coach, volunteer
- Max student ratio per coach
- Linked member support (a coach can also be a parent)
- A coach record can exist before their login is provisioned (`account_id` nullable) — shown as pending signup in admin lists until linked to an account

### Venues

- Admin CRUD for venues (course, practice ground, driving range, school facility)
- Address entry via Google Places autocomplete, with a draggable map pin for fine-tuning the exact location (latitude/longitude stored)
- Deletion blocked while a venue is still referenced by any programme, session, appointment, booking, or event

### Payments & Invoicing

- Paystack integration: transaction initialization, redirect to hosted checkout, webhook-based confirmation
- Idempotent webhook handling via a unique `gateway_reference` — a duplicate webhook delivery can't create a duplicate payment or double-activate an enrollment
- A single-line invoice is generated per enrollment at creation time; itemized multi-line invoices are supported for future add-ons
- The `payments` table has no client-writable policy at all — only the server-side webhook handler (service role) can write to it

### Events & Ticketing

- Admin CRUD for events (tournaments, fun tournaments, clinics, parent workshops, corporate) with an uploaded header image (Supabase Storage)
- Event registration automatically generates a unique ticket code (`generate_ticket_code` trigger) — no manual step
- Check-in fields (`checked_in_at`, `checked_in_by`) are reserved on the schema for coach-side QR scanning

### Search

- Global header search, scoped per role: parents see their own members and all programmes; coaches see their own roster and the programmes they teach; admins see users and coaches
- Debounced queries, results grouped by type in a dropdown
- Advanced search page for a full, ungrouped result list

### Progressive Web App

- Installable as a PWA (manifest + service worker), works on desktop, Android, and iOS
- Web Push notifications wired into the service worker's `push` event, independent of any paid push provider

---

## Data model

| Group | Tables |
|---|---|
| Accounts | `accounts`, `audit_log`, `login_events`, `account_lockouts` |
| People | `members`, `member_questionnaires`, `coaches`, `coach_invites` |
| Programmes | `programmes`, `programme_sessions`, `programme_coaches`, `enrollments` |
| Venues | `venues` |
| Curriculum | `levels`, `curriculum_modules`, `session_curriculum_modules`, `level_progressions` |
| Attendance | `attendance` |
| Appointments | `appointments`, `appointment_slots`, `coach_availability_rules`, `coach_blocks` |
| Bookings | `bookings` |
| Gear | `gear_types`, `gear_units`, `gear_rentals`, `gear_rental_units` |
| Events | `events`, `event_registrations` |
| Money | `invoices`, `invoice_line_items`, `payments`, `sponsorships`, `sponsorship_allocations` |
| Notifications | `notifications`, `notification_preferences`, `push_subscriptions` |
| Documents | `documents`, `consents` |
| Settings | `academy_settings` |

---

## RPCs by domain

### Accounts

| Function | Summary |
|---|---|
| `admin_get_accounts` | List all accounts |
| `admin_update_account_role` | Change a user's role |
| `admin_set_account_active` | Activate or deactivate |
| `account_update_self` | Update own profile |
| `handle_new_user` | Auth trigger — creates the `accounts` row on sign-up, always as `parent` |
| `get_active_lockout` | Service-role lookup for the login route |
| `get_my_active_lockout` | Caller checks their own lockout status |
| `record_login_event` | Service-role — logs a login attempt and flags suspicious activity |
| `admin_get_login_events` | Sign-in history, filterable to suspicious-only |
| `admin_get_lockouts` | List lockouts, active or all |
| `log_sensitive_data_access` | Logs a view of a sensitive member field |

### Programmes

| Function | Summary |
|---|---|
| `admin_get_programmes` | List with filters |
| `admin_get_programme` | Single programme |
| `admin_create_programme` | Create |
| `admin_update_programme` | Update |
| `admin_archive_programme` | Soft delete |
| `admin_unarchive_programme` | Restore |
| `admin_delete_programme` | Hard delete (guarded) |
| `get_eligible_programmes` | Programmes a given member is eligible for (age/gender/level) |
| `parent_get_programmes` | Parent-facing eligible programme list for a member |
| `parent_get_all_programmes` | Browse all non-archived programmes, no member context |
| `parent_get_programme_detail` | Single programme detail, with coaches/curriculum/sessions and eligibility for a given member |
| `parent_get_enrollable_members` | Which of the parent's children qualify for a programme, and why not for the rest |
| `parent_create_enrollment` | Creates the enrollment + invoice, re-validates eligibility server-side |

### Sessions

| Function | Summary |
|---|---|
| `admin_generate_programme_sessions` | Bulk-create from days-of-week + date range |
| `admin_get_sessions` | List with filters |
| `admin_update_session` | Edit |
| `admin_delete_session` | Delete (guarded) |
| `admin_sync_session_coaches` | Copy coaches from programme |
| `admin_add_coach_to_session` | Add a coach |
| `admin_remove_coach_from_session` | Remove a coach |
| `admin_tag_session_curriculum` | Replace the session's module set |
| `admin_remove_module_from_session` | Untag one |
| `admin_get_session_modules` | List tagged modules |
| `admin_check_programme_ratio` | Ratio report |

### Levels & Curriculum

| Function | Summary |
|---|---|
| `admin_get_levels` | List levels |
| `admin_get_all_curriculum_modules` | All modules |
| `admin_get_level_modules` | Modules for a level (curriculum picker) |

### Venues

| Function | Summary |
|---|---|
| `admin_get_venues` | List/search venues |
| `admin_get_venue` | Single venue |
| `admin_create_venue` | Create, with address + lat/lng |
| `admin_update_venue` | Update |
| `admin_delete_venue` | Delete (blocked if still referenced anywhere) |

### Coaches

| Function | Summary |
|---|---|
| `admin_get_programme_coaches` | Assigned to a programme |
| `admin_assign_coach_to_programme` | Assign |
| `admin_remove_coach_from_programme` | Remove |
| `coach_get_own_slots` | Own availability slots |
| `coach_get_booked_appointments` | Bookings against own slots |
| `coach_get_full_schedule` | Combined calendar |

### Attendance

| Function | Summary |
|---|---|
| `coach_mark_attendance` | Mark one member |
| `coach_bulk_mark_attendance` | Mark all present |
| `coach_get_session_roster` | Session roster with status |

### Appointments

| Function | Summary |
|---|---|
| `parent_get_open_slots` | Browse open slots |
| `parent_book_slot` | Book a slot |
| `parent_get_own_appointments` | Own bookings |
| `parent_cancel_appointment` | Cancel with cutoff |
| `parent_get_full_schedule` | Combined calendar |
| `coach_open_appointment_slot` | Open a slot |
| `coach_archive_appointment_slot` | Remove a slot |
| `coach_create_availability_rule` | Weekly recurring rule |
| `coach_apply_availability_rule` | Generate slots from a rule |
| `coach_archive_availability_rule` | Remove a rule |
| `coach_add_block` | Block time off |
| `coach_remove_block` | Remove a block |
| `head_coach_get_appointments` | The queue |
| `head_coach_confirm_appointment` | Confirm a request |
| `head_coach_complete_appointment` | Record outcome |
| `head_coach_mark_no_show` | Mark no-show |
| `admin_create_slot_for_coach` | Override: open for a coach |
| `admin_book_slot_for_member` | Override: book for a parent |
| `admin_confirm_appointment` | Override: confirm |
| `admin_get_full_schedule` | Academy-wide calendar |
| `admin_coach_utilisation` | Slots opened vs. booked |

### Members

| Function | Summary |
|---|---|
| `get_my_members` / `get_my_members_with_details` | Parent's own members |
| `get_member_programmes` | A member's enrollments, next session, recent attendance |
| `get_member_progression` | A member's current level, badge status, curriculum covered, next level |
| `update_member` | Update a member's own profile fields |
| `parent_request_cancellation` | Flags an active enrollment for admin-reviewed cancellation |
| `parent_deactivate_member` | Soft-deactivates a member (blocked while an active enrollment exists) |

### Events

| Function | Summary |
|---|---|
| `admin_get_events` | List/search events |
| `admin_get_event` | Single event |
| `admin_create_event` | Create, with venue, fee, capacity, header image |
| `admin_update_event` | Update |
| `admin_delete_event` | Delete (blocked if registrations exist) |
| `admin_get_event_registrations` | Registrations + ticket status for an event |

### Search

| Function | Summary |
|---|---|
| `parent_global_search` | Own members + all programmes |
| `coach_global_search` | Own roster + own programmes |
| `admin_global_search` | Users + coaches |

### Reference

| Function | Summary |
|---|---|
| `get_venues` | Venue list |
| `get_levels` | Level list |
| `get_my_members` / `get_my_members_with_details` | Parent's own members |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/lookups/use-lookups.ts` | `useVenues`, `useLevels` |
| `hooks/lookups/use-academy-settings.ts` | `useAcademySettings`, `useUpdateAcademySettings` |
| `hooks/admin/programmes/use-programmes.ts` | `useProgrammes`, `useProgramme`, `useGetSessions`, `useGetSessionModules`, `useGetLevelModules`, `useGetProgrammeCoaches`, `useGetSessionCoaches` |
| `hooks/admin/programmes/use-programme-mutations.ts` | `useCreateProgramme`, `useUpdateProgramme`, `useToggleProgrammeArchive`, `useDeleteProgramme`, `useTagSessionCurriculum`, `useRemoveModuleFromSession` |
| `hooks/admin/programmes/use-session-mutations.ts` | `useGenerateSessions`, `useUpdateSession`, `useDeleteSession`, `useAddCoachToSession`, `useRemoveCoachFromSession`, `useSyncSessionCoaches` |
| `hooks/admin/venues/use-venue-mutations.ts` | `useCreateVenue`, `useUpdateVenue`, `useDeleteVenue` |
| `hooks/admin/events/use-events.ts` | `useEvents` |
| `hooks/admin/events/use-event-mutations.ts` | `useCreateEvent`, `useUpdateEvent`, `useDeleteEvent` |
| `hooks/admin/events/use-event-image-upload.ts` | `useUploadEventImage` |
| `hooks/admin/use-security.ts` | `useLoginEvents`, `useLockouts` |
| `hooks/admin/use-lock-account.ts` | `useLockAccount`, `useUnlockAccount` |
| `hooks/client/use-programmes.ts` | `useProgrammes`, `useProgrammeDetail`, `useEnrollableMembers` |
| `hooks/client/use-enroll.ts` | `useEnroll` |
| `hooks/client/use-member.ts` | `useMember` |
| `hooks/client/use-members.ts` | `useMembers` |
| `hooks/client/use-member-programmes.ts` | `useMemberProgrammes` |
| `hooks/client/use-member-progression.ts` | `useMemberProgression` |
| `hooks/client/use-member-mutations.ts` | `useUpdateMember` |
| `hooks/client/use-global-search.ts` | `useGlobalSearch` |
| `hooks/client/use-parent-appointments.ts` | `useOpenSlots`, `useParentAppointments`, `useBookSlot`, `useCancelAppointment` |
| `hooks/coach/use-coach-appointments.ts` | `useCoachSlots`, `useCoachBookedAppointments`, `useOpenAppointmentSlot`, `useArchiveAppointmentSlot`, `useIsHeadCoach` |
| `hooks/coach/use-coach-availability.ts` | `useCoachRules`, `useCreateAvailabilityRule`, `useArchiveAvailabilityRule`, `useApplyAvailabilityRule`, `useCoachBlocks`, `useAddBlock`, `useRemoveBlock` |
| `hooks/admin/use-admin-overrides.ts` | `useAdminCreateSlotForCoach`, `useAdminBookSlotForMember`, `useAdminConfirmAppointment` |
| `hooks/shared/use-schedule.ts` | `useCoachSchedule`, `useParentSchedule`, `useAdminSchedule` |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| Role-based access (`admin` / `coach` / `parent`) | `assert_is_admin`, coach role checks in RPCs |
| Deactivated accounts are blocked | `accounts.active` + `useAuth` + Supabase Auth ban |
| Booking window (lead + lookahead) | `parent_get_open_slots`, `parent_book_slot` |
| Cancellation cutoff | `parent_cancel_appointment` |
| Slot capacity under concurrency | `SELECT ... FOR UPDATE` in `parent_book_slot` |
| Coaches can't archive booked slots | `coach_archive_appointment_slot` |
| Coaches can't block booked windows | `coach_add_block` |
| Assessments completed only after the appointment happens | `head_coach_complete_appointment` |
| Applying a rule is idempotent | `coach_apply_availability_rule` |
| Sessions can't be deleted with attendance | `admin_delete_session` |
| Programmes can't be deleted with active enrollments | `admin_delete_programme` |
| Public sign-up can never self-assign an elevated role | `handle_new_user` |
| Level progression requires badge confirmation, not age alone | `level_progressions.badge_complete`, coach submission RLS |
| Enrollment activation only happens via the payment webhook | RLS on `enrollments`, payment webhook handler |
| Payment webhooks are idempotent | Unique `payments.gateway_reference` |
| `payments` has no client-writable policy | RLS on `payments` |
| Sensitive field views are logged | `log_sensitive_data_access` / `sensitive_data_access_log` |
| Event tickets are unique and auto-generated | `generate_ticket_code` trigger, unique `event_registrations.ticket_code` |
| Venue deletion blocked while still referenced | `admin_delete_venue` |
| Session-level coach assignment auto-syncs from the programme | `sync_session_coaches` trigger |
| Repeated failed sign-ins trigger an automatic short lockout | `record_login_event` |
| A locked account is blocked from signing in and signed out of active sessions | `get_active_lockout`, `get_my_active_lockout`, layout guard |
| Member deactivation blocked while an active enrollment exists | `parent_deactivate_member` |

---

## Not implemented

- Email notifications
- Audit log triggers on most tables
- Google Calendar sync (a subscribable `.ics` feed exists as a lighter alternative — see Schedules)
- Reschedule UI for appointments
- Admin override UI
- Reports beyond `admin_coach_utilisation`
- Report exports (PDF / CSV)
- Two-factor authentication enforcement
- WhatsApp / SMS notifications
- Weather API integration for outdoor session planning
- Accounting sync (Xero / QuickBooks)
- Apple Wallet / Google Wallet passes for event tickets
- Automated reminder jobs (session reminders, invoice overdue, gear due) — the `pg_cron` mechanism is available, but scheduled jobs aren't yet configured
- Coach-side QR ticket scanning / event check-in UI (schema fields exist, no UI)
- Sponsorship allocation UI (schema exists, no UI)
- Gear rental UI (schema exists, no UI)