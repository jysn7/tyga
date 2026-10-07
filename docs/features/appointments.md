# Appointments — README

A booking and assessment system for parents, coaches, and head coaches.

---

## Features

### Parent

- **Browse open slots** — calendar view (week / month) of available appointment times
- **Book a slot** — pick a time, choose a child, confirm
- **My appointments** — see all bookings with status, cancel if allowed
- **My schedule** — combined calendar of programme sessions and appointments

### Coach

- **One-off slots** — open individual times for booking
- **Recurring rules** — set weekly availability once, generate slots for weeks ahead
- **Blocked times** — mark holidays, competitions, or personal time off
- **Booked** — see who has booked against your slots
- **My schedule** — combined calendar of own sessions and bookings
- **Queue** (head coaches only) — confirm requests, complete assessments, mark no-shows

### Admin

- **Academy schedule** — every session and appointment, filtered by coach or venue
- **Settings** — booking lead time, lookahead window, cancellation cutoff
- **Overrides** — create slots for a coach, book for a member, confirm on behalf of a head coach

---

## Data model

| Table | What it holds |
|---|---|
| `appointment_slots` | Bookable times opened by coaches |
| `appointments` | Bookings against slots |
| `coach_availability_rules` | Recurring weekly patterns |
| `coach_blocks` | Time off |
| `app_settings` | Booking window and cancellation policy (among other platform settings) |

**Status lifecycle:** `requested` → `scheduled` → `completed` (or `cancelled` / `no_show`).

---

## RPCs

### Parent

| Function | Summary |
|---|---|
| `parent_get_open_slots` | List available slots within the booking window |
| `parent_book_slot` | Book a slot for a member |
| `parent_get_own_appointments` | List this parent's bookings |
| `parent_cancel_appointment` | Cancel a booking, blocked inside the cutoff |
| `parent_get_full_schedule` | Combined sessions + appointments calendar |

### Coach

| Function | Summary |
|---|---|
| `coach_open_appointment_slot` | Open a one-off slot |
| `coach_get_own_slots` | List own slots with booked counts |
| `coach_archive_appointment_slot` | Remove an unbooked slot |
| `coach_get_booked_appointments` | Bookings against own slots |
| `coach_get_full_schedule` | Combined own sessions + bookings |
| `coach_create_availability_rule` | Create a recurring weekly rule |
| `coach_archive_availability_rule` | Remove a rule |
| `coach_get_own_rules` | List own rules |
| `coach_apply_availability_rule` | Generate slots from a rule for N weeks |
| `coach_add_block` | Block time off, removing unbooked slots |
| `coach_remove_block` | Remove a block |
| `coach_get_own_blocks` | List own blocks |

### Head coach

| Function | Summary |
|---|---|
| `head_coach_get_appointments` | The queue: requested + scheduled |
| `head_coach_confirm_appointment` | Confirm a request, set the datetime |
| `head_coach_complete_appointment` | Mark complete, record assessed level |
| `head_coach_mark_no_show` | Mark as no-show |

### Admin

| Function | Summary |
|---|---|
| `admin_create_slot_for_coach` | Open a slot on behalf of a coach |
| `admin_book_slot_for_member` | Book on behalf of a parent |
| `admin_confirm_appointment` | Confirm on behalf of a head coach |
| `admin_get_full_schedule` | Academy-wide calendar |
| `admin_coach_utilisation` | Slots opened vs. booked per coach |

### Reference

| Function | Summary |
|---|---|
| `get_venues` | Any authenticated user |
| `get_levels` | Any authenticated user |

---

## Hooks

| File | Exports |
|---|---|
| `hooks/lookups/use-lookups.ts` | `useVenues`, `useLevels` |
| `hooks/lookups/use-academy-settings.ts` | `useAppSettings`, `useUpdateAppSettings`, booking behavior defaults |
| `hooks/client/use-parent-appointments.ts` | `useOpenSlots`, `useParentAppointments`, `useBookSlot`, `useCancelAppointment` |
| `hooks/coach/use-coach-appointments.ts` | Coach slot list, booked appointments, one-off slot create/archive and head-coach check |
| `hooks/coach/use-coach-availability.ts` | Recurring availability rules and blocked-time list/create/apply/archive operations |
| `hooks/coach/use-head-coach-appointments.ts` | Assessment queue, confirm, complete and no-show actions |
| `hooks/admin/appointments/use-admin-overrides.ts` | `useAdminCreateSlotForCoach`, `useAdminBookSlotForMember`, `useAdminConfirmAppointment` |
| `hooks/shared/use-schedule.ts` | `useCoachSchedule`, `useParentSchedule`, `useAdminSchedule` |
| `hooks/coach/use-appointment-slots.ts` and `hooks/use-appointment-slots.ts` | Shared appointment slot types, query-key helpers and client utilities |

---

## Pages

| Route | Role | Purpose |
|---|---|---|
| `/my-appointments` | Parent | Browse slots + manage bookings |
| `/my-schedule` | Parent | Combined calendar |
| `/coach/appointments` | Coach | Recurring, one-off slots, booked, queue |
| `/coach/my-schedule` | Coach | Combined calendar |
| `/admin/appointments` | Admin | Appointment and schedule administration |
| `/admin/settings` | Admin | Academy/application settings, including booking behavior |
| `/coach/appointments/queue` | Head coach | Assessment request queue |

---

## Key behaviours

| Rule | Where enforced |
|---|---|
| Booking windows and cancellation policy are read through the shared app-settings hook; defaults are 24 hours lead time, 56 days lookahead, 24 hours cancellation cutoff and 60 minute slots when settings are unavailable | `useBehaviourSettings` |
| Parents can only book slots at least `booking_lead_hours` ahead, up to `booking_lookahead_days` | `parent_get_open_slots`, `parent_book_slot` |
| Parents can't cancel inside `cancellation_cutoff_hours` | `parent_cancel_appointment` + UI |
| Two parents can't book the last seat simultaneously | `parent_book_slot` uses `SELECT ... FOR UPDATE` |
| Coaches can't archive slots with active bookings | `coach_archive_appointment_slot` |
| Coaches can't block time with active bookings | `coach_add_block` |
| Head coaches can only complete appointments after they've happened | `head_coach_complete_appointment`, `head_coach_mark_no_show` |
| Applying a rule is idempotent | `coach_apply_availability_rule` skips existing slots and blocked windows |

---

## Setup order

Apply the current migrations for lookups, `app_settings`, coach availability, appointment slots/bookings, role-specific RPCs and combined schedule functions; reload PostgREST after changing RPC definitions. The migration history is authoritative for ordering and the active settings table name.

---

## Not implemented

- Email notifications on book / confirm / cancel
- Audit log triggers on the appointment tables
- Google Calendar sync
- Reschedule UI (RPC exists, no page)
- Admin override UI (RPCs exist, no page)