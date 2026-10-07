# Events

Event functionality is currently exposed as an admin management surface. The `events` data model also tracks member registrations, but a parent-facing registration/checkout hook or page was not found in the current route and hook tree.

## Admin capabilities

- List events and filter by search text, upcoming status and event status
- Read event details and registrations
- Create, update and delete events
- Upload event images to Supabase Storage and use the resulting public URL
- Inspect each registrant's member name, registration status and payment flag

Event fields represented by the current hook include name, type, description, image, venue, date/start time, fee, capacity, age range and status. Current event types include tournaments, clinics, assessments, corporate events, fun tournaments and parent workshops.

## Data model

| Table | Purpose |
|---|---|
| `events` | Event definition, venue/date, type, eligibility bounds, capacity, price, image and lifecycle/archive state |
| `event_registrations` | Member registration, status and payment flag |
| `venues` | Venue reference shown with each event |

The admin registration count counts rows whose registration status is `registered`; the registrations query also returns other statuses, such as waitlisted rows.

## RPCs and storage

| Operation | Backend |
|---|---|
| List/filter events | `admin_get_events` |
| Read one event | `admin_get_event` |
| Read event registrations | `admin_get_event_registrations` |
| Create/update/delete | `admin_create_event`, `admin_update_event`, `admin_delete_event` |
| Archive/restore | `admin_archive_event`, `admin_unarchive_event` (database operations; no corresponding React hook was found) |
| Image upload | Supabase Storage bucket `event-images` |

Admin RPCs assert the caller's admin role. Deletion is refused if registration history exists; archive/restore is the non-destructive lifecycle path.

## Hook and route map

| Source | Responsibility |
|---|---|
| `hooks/admin/events/use-events.ts` | Filtered list, event detail and registrations queries |
| `hooks/admin/events/use-event-mutations.ts` | Create, update and delete; invalidates the `events` query family |
| `hooks/admin/events/use-event-image-upload.ts` | Uploads an image under a generated filename and returns its public URL |
| `/admin/events` | Event list and create-event modal |

The current page shows the event list and create dialog. The hooks also expose update, delete, detail and registration reads; verify their consuming UI before assuming every operation has a complete page.

## Current gaps

- No parent event catalogue, registration mutation or event checkout route/hook was found
- No React hook currently exposes the SQL archive/restore operations
- Event notification scheduling and calendar synchronization are not represented by the current hooks

Use the Supabase migration history as the authoritative source for table constraints and RPC deployment order. The event image bucket must exist and allow the public URL behavior expected by the app.
